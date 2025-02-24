import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import {ObjectId} from "bson"



const addAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()
          user.refreshToken = refreshToken
          await user.save({validateBeforeSave: false})
          return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and referesh tokens!")
    }
}

const registerUser = asyncHandler( async (req, res)=> {
    const {fullName, password, userName, email} = req.body
    // console.log("email :", email);


    if (
        [password, email, fullName, userName].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required.")
    }
    
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }
    console.log("📂 Received Files:", req.files);

     const avatarLocalPath = req.files?.avatar[0]?.path;
     console.log("🛠 Avatar Local Path:", avatarLocalPath);

    //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } // Will check whether the coverImage is present in the repsonse or not and also helpfull in error cases
    // such as undefined errors which i faced in postman in the absence case of the coverImage in response
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }
    
    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    // console.log("☁️ Cloudinary Avatar Upload Response:", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }
    
    //  console.log("📝 Creating new user...");

     const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName : userName.toLowerCase()
     })
     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )
     if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
     }
     return res.status(201).json(
        new ApiResponse(200, createdUser, "User is regiestered Successfully")
     )
})


const loginUser = asyncHandler(async (req, res)=> {
    const {userName, email, password} = req.body
    // console.log(email);
    

    if (!email && !userName) {
        throw new ApiError(400, "Username or Email is required!")
    }

     // Here is an alternative of above code based on logic in a different case scenario:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

     const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    // console.log(password);
    

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await addAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly : true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
       new ApiResponse(
        200,
        {
            accessToken, refreshToken, loggedInUser
        },
        "User logged In successfully"
       ) 
    )
})

const logoutUser = asyncHandler(async(req, res)=> {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set :{
                        refreshToken: undefined
                }
            },
            {
                new: true
            }
        )
        const options = {
            httpOnly : true,
            secure: true,
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200,
            {},
            "User logged out successfully"
        ))
})
const accessRefreshToken = asyncHandler(async(req, res)=> {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!accessRefreshToken) {
            throw new ApiError(401, "Unauthorized Request!")
        }
        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            )
            const user = await User.findById(decodedToken?._id)
    
            if (!user) {
                throw new ApiError(401, "Invalid Refresh Token!")
            }
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh Token is expired or used")
            }
    
            const options = {
                httpOnly: true,
                secure: true,
            }
    
            const {accessToken, newRefreshToken} = await addAccessAndRefreshToken(user._id)
    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken , options)
            .json(
                new ApiResponse(
                    200,
                    {accessToken, refreshToken : newRefreshToken},
                    "Access Token refreshed successfully"
                )
            )
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid Refresh Token!")
        }
})

const changeCurrentPassword = asyncHandler(async (req, res)=> {

        const {oldPassword, newPassword} = req.body

        const user = await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid Old password!")
        }
        user.password = newPassword
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password updated successfully"
        ))

})

const getCurrentUser = asyncHandler(async(req, res)=> {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User Fetched successfulle"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res)=> {
        const {fullName, email} = req.body
        if (!fullName || !email) {
            throw new ApiError(400, "All fields are required")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email,
                },
            },
            {new: true}
        ).select("-password")

        res
        .status(200)
        .json(new ApiResponse(
            200 ,
            user,
            "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res)=> {
      const avatarLocalPath =  req?.file.path

      if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
      }

      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
      ).select("-password")

      return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            user,
            "Avatar image updated successfully")
    )
})

const updateUserCoverImage =  asyncHandler(async(req, res)=> {
    const coverImageLocalPath = req?.file.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing")
    }

    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cover Image!")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url, 
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "Avatar image updated successfully")
    )
})


const getUserChannelProfile = asyncHandler(async (req, res)=> {
        const {userName} = req.params

        if (!userName?.trim()) {
            throw new ApiError(400, "Username is missing!")
        }

        const channel = await User.aggregate([
                {
                    $match: { // Directly matches the entity stored in the database without accessing via find() methods of mongoDB
                        userName: userName?.toLowerCase(),
                    }
                },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "channel",
                        as: "subscribers"
                    }
                },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "subscriber",
                        as: "subscribedTo"
                    }
                },
                {
                    $addFields: {
                        subscribersCount: {
                            $size: "$subscribers"
                        },
                        channelsSubscribedToCount: {
                            $size: "$subscribedTo" 
                        },
                        isSubscribed: {
                            $cond: {
                                if: {$in: [req.user?._id , "$subscribers.subscriber"]},
                                then: true,
                                else: false,
                            }
                        }
                    }
                },
                {
                    $project: {
                        fullName: 1,
                        userName: 1,
                        subscribersCount: 1,
                        channelsSubscribedToCount: 1,
                        isSubscribed: 1,
                        avatar: 1,
                        coverImage: 1,
                        email: 1,
                    }
                }
            ])
                if (!channel?.length) {
                    throw new ApiError(404, "Channel does not exists!")
                }

            res
            .status(200)
            .json(
                new ApiResponse(200, channel[0], "User Channel fetched successfully")
            )
        
})

const getWatchHistory = asyncHandler(async(req, res)=> {
        const user = await User.aggregate([
              {
                $match: {
                    _id: new mongoose.mongo.ObjectId(req.user._id)
                }
              },
              {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",  
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            userName: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                $first: "$owner"
                            }
                        }
                    ]
                }
              }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].getWatchHistory,
                "Watch History Fetched Successfully"
            )
        )
})
export { 
    registerUser,
    loginUser,
    logoutUser,
    accessRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} 