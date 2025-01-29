// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connnectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
    path: './env'
})

connnectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`Server is running at PORT: ${process.env.PORT}`);
    })
    app.on("error" , (error)=> {
        console.log("Server is not running at the PORT, please check the PORT", error);
        throw error
    })
})

.catch((error)=> {
    console.log("MongoDb connection failed", error);
} )











/* A METHOD OF CONNECTING THE DATABASE IN THE MAIN INDEX.JS FILE
import express from "express"
const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/