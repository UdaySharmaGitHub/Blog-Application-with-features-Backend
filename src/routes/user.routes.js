import { Router } from "express";
import { registerUser, loginUser,loggedOutUser } from "../controllers/user.controller.js";
import {upload} from '../middlerwares/multer.middleware.js'
import {verifyJWT} from "../middlerwares/auth.middleware.js"
const router = Router();

// Register Routing
router.route("/register").post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser
)

// 
router.route("/login").post(loginUser)
// Secured Route
router.route("/logout").post(verifyJWT,loggedOutUser)
router.route("/refreshToken").post(refreshAccessToken);
export default router;