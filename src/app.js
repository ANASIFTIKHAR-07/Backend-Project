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


// Routes import

import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// Routes declaration

app.use("/api/v1/users", userRouter)


export { app }
