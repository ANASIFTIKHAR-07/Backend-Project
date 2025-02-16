import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"




const addAccessAndRefereshToken = async(userId) => {
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

    if (!email || !userName) {
        throw new ApiError(400, "Username or Email is required!")
    }

     const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist!")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is invalid")
    }

    const {accessToken, refreshToken} = await addAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
})

export { 
    registerUser,
    loginUser,
} 