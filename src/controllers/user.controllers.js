
import { asyncHandler } from "../utils/asyncHandler.js";

/*
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})
    
*/


// this is working, dont know why
const registerUser = (req, res) => {
    console.log("✅ Register route hit");
    console.log("Request body:", req.body);

    // Just send a success message for now
    res.status(200).json({ message: "User registered successfully" });
};


export {registerUser}
