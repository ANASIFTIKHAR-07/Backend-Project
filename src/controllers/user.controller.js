import { asyncHandler } from "../utils/asyncHandler.js"


const registerUser = asyncHandler( async (req, res)=> {
    res.status(200).json({
        message : "Hey this is meeeee!! Learning from chai aur code",
    })
})


export { 
    registerUser
}