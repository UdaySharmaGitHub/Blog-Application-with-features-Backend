import { ApiError } from "../utils/ApiError.js";
import { asynHandler } from "../utils/asynHandler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.models.js'

//  its check or verify the user
// response res is not in use so write "_"
export const verifyJWT = asynHandler(async(req,_,next)=>{
    try {
        // getting the access Token   
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")    
        console.log(token);
        if(!token){
             throw new ApiError(401,"Unauthorized Request");
            }
    
        const decodedToken = await jwt.verify(token, proccess.env.ACCESS_TOKEN_SECRET);
    
        const user =   await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        // If user does not exist
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
    
        //  if user Exists
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
    
})