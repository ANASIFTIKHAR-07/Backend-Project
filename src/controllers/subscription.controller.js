import mongoose, {isValidObjectId} from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Subscription} from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async(req, res)=> {
    const {channelId} = req.params
})



const getUserChannelSubscriber = asyncHandler(async(req, res)=> {
    const { channelId }= req.params
})

const getSubscribedChannels = asyncHandler(async(req, res)=> {
    const  { subscribedId } = req.params
})




export{
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels,
}
