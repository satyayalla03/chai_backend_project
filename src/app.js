import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// app.use(...) in Express means 
// "use this middleware for every request".

// app.use(express.json());
// ✅ Means: "For every incoming request, 
// run express.json() first so I can read JSON in req.body".


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import

import userRouter from './routes/user.routes.js'

// routes declaration
// so when someone types users, it will take them to userRouter
// userRouter will get control now


app.use("/api/v1/users", userRouter)

// https://localhost:8000/api/v1/users/register

export default app
