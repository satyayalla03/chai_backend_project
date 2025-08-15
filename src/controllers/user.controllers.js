import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// here User is an object in mongodB

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // finds user in User dB by id,
        // generates access and refresh tokens
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // save refreshtoken in db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens")
    }
}

/*
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})
*/



// 1. get user details from frontend
// 2. validation - not empty
// 3. check if user already exists
// 4. check for images, check for avatar
// 5. upload them to cloudinary, avatar
// 6. create user object - create entry in dB
// 7. remove password and refresh token field from response
// 8. check for user creation
// 9. return response
    
const registerUser = asyncHandler(async(req, res) => {

    // if(!req.body){
    //     throw new ApiError(400, "it is required");
    // }
   
    // 1
    const {fullName, email, username, password} = req.body;
    // console.log("email: ", email);
    
    // 2. validation

    /*
    if(fullName === ""){
        throw new ApiError(400, "full name is required")
    }
    */

    if (
        [fullName, email, username, password].some( (field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "all fields are required")
    }

    // 3
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username already exists")
    }

    console.log(req.files);
    

    // 4
    // multer gives access to req.files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;


    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // 5

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "avatar is required")
    }

    // 6
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // 7 - unselecting what we don't want
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering thr user")
    }

    // 9 return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => {
    // 1. req.body for data
    // 2. username or email validation
    // 3. find the user, if user there, then login, else error
    // 4. login before check password
    // 5. access and refresh token
    // 6. send cookie

    // 1
    const {email, username, password} = req.body

    // if none of them are empty, throw err, since we req something
    if( [email, username].every((field) => { field?.trim() === "" }) )
    {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist");
    }

    // checking password, since bcrypt time lagega, so await
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    // if pwd correct, generate access, refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = User.findById(user._id).select(
        "-password -refreshToken" 
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in succesfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out"))
})

export {registerUser, loginUser, logoutUser}
