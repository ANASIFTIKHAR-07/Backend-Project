import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'


const connnectDB = async ()=> {
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("MongoDB connection Failed!", error);
        process.exit(1);
    }
}

export default connnectDB;