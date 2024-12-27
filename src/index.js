// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import connnectDB from './db/index.js';


dotenv.config({
    path: './env'
})

connnectDB();











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