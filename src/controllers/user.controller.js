import {asynHandler} from "../utils/asynHandler.js"
//  APIERROR
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.models.js";
// Cloudinary Path
import {uploadOnCloudinary} from '../utils/cloudinary.js'
// API RESPONSE
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


//  make combine method to generate Access and RefersehToken
const generateAccessAndRefereshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Add the referesh token to the database
        user.refreshToken =refreshToken;
        // and save the database
        await user.save({ validateBeforeSave: false })
        return {accessToken,refreshToken};
    }catch(error){
        throw new ApiError(500,"Something Went Wrong while generating the Referesh and Access Token");
    }
}

//-----------------------------------User Register -----------------------------------//
const registerUser= asynHandler( async(req,res)=>{
    //  we send the status 200 which is Successful Status Code
    // res.status(200).json({
    //     message:"Registered Users Done",
    // })

    /*
     get user details from frontend
    validation - not empty
    check if user already exists: username, email
    check for images, check for avatar
    upload them to cloudinary, avatar
    create user object - create entry in db
    remove password and refresh token field from response
    check for user creation
    return res
    */
    // getting the data from the user
    const {username,email,fullName,password} = req.body;
    // console.log("req.body",req.body);  // get the output in JSON or Object Format
    if(
        [fullName,username,email,password].some((field)=> field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are Required")
    }

    // check if user already exists
    // using $or: [array1,array2, ...]
    const existingUser = await User.findOne({
        $or:[{email},{username}]
    })
    console.log("Existing Uesr:",existingUser);
    if(existingUser) throw new ApiError(409,"User already Exist");

    // requset also handles the file
    // console.log("req.files",req.files);  // get the output in JSON or Object Format
    // but keep it optional is the best practice
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // printing the local path of avatar of coverImage
    console.log(`avatarLocalPath : ${avatarLocalPath} and coverImageLocalPath : ${coverImageLocalPath}`);

    // Check that the avatar image is present or not
    if(!avatarLocalPath) throw new ApiError(400,"Avatar File Required"); // avatar image is not present

    // Uploading on Cloudinary which takes time so used the await  
    // cloudinary is returing the whole response not the URL 
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   
    // check the avatar field is uploaded on cloudinary
    if(!avatar) throw new ApiError(400,"Avatar File Required");

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",         // taaki code na fateeh
        email,
        password,
        username: username.toLowerCase()
    })
    
    // remove password and refresh token field from response
    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Check that user is Created or not
    if(!createdUser){
        throw new ApiError(500,"Something Went Wrong while registering the User");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

})

//-----------------------------------Logged In -----------------------------------//
const loginUser = asynHandler(async(req,res)=>{

    // req body->data
    // username or email
    // finding the user
    //  password Check
    // generate access and refersh token
    // send cookies
    const {email, username, password} = req.body
    console.log(email);
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //  Check if the user Exist or not;
    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    //  If user is not exist throw the error
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid)
    // if the password is Correct
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid User Credentials");
    }

    // Generating the Access and Refresh Token
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})


//-----------------------------------Logged Out -----------------------------------//
const loggedOutUser = asynHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
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

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

//-----------------------------------Refreshed Access Token-----------------------------------//
const refreshAccessToken = asynHandler( async(req,res)=>{
    // get the refresh token from the cookies of body
    try {
        const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        console.log(incommingRefreshToken)
        // check if the user has token or not
        if(!incommingRefreshToken){
            throw new ApiError(401,"Unauthorized Request");
            
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        // verify the token
       const decodedToken = await jwt.verify(
            incommingRefreshToken,
            process.evn.REFRESH_TOKEN_SECRET
        )
        console.log(decodedToken)
        // get the user from the decodeToken
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401,"Unauthorized Request");
        }
        if(incommingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is Expired or uesd");
        }
        // Generate new Access and refreshToken using the methods generateAccessAndRefereshTokens
        // Generate new Access and Refresh Token
        const {acccessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("acccessToken",acccessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {acccessToken,refreshToken:newrefreshToken},
                "Access Token Refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token");
        
    }
})
export {
    registerUser,
    loginUser,
    loggedOutUser,
    refreshAccessToken
}