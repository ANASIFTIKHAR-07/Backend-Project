import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"



const registerUser = asyncHandler( async (req, res)=> {
    const {fullName, password, userName, email} = req.body
    console.log("email :", email);

    if (
        [password, email, fullName, userName].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required.")
    }
    
})


export { 
    registerUser
}