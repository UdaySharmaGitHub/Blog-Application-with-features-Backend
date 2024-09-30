import {asynHandler} from "../utils/asynHandler.js"
//  APIERROR
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.models.js";
// Cloudinary Path
import {uploadOnCloudinary} from '../utils/cloudinary.js'
// API RESPONSE
import { ApiResponse } from "../utils/ApiResponse.js";

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


export {registerUser}