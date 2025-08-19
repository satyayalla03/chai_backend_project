import {Router} from "express"
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import verify from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


router.route("/login").post(loginUser)

// secured routes, go to middleware verifyJWT once you go through logoutUser
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)


router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword)
export default router
