import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" 


const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
))
// The (use) keyword is used for all the middlewares and the configurations 
// Express configuration for different data
app.use(express.json({limit: "16kb"})) // For json format
app.use(express.urlencoded({limit: "16kb", extended: true,})) // For the data which comes from the URL
app.use(express.static("public"))// For storing some pdf, images, create a public folder that is accessible
// Already created a public folder in which the files would be stored
app.use(cookieParser())


export { app }
