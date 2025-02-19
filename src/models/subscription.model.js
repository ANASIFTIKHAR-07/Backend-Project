import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // The user who is subscribing the channel
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // The user who is the owner of the channel and the subscriber is subscribing
        ref: "User"
    }
},
{timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema )  