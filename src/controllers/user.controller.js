import {asynHandler} from "../utils/asynHandler.js"

const registerUser= asynHandler( async(req,res)=>{
    //  we send the status 200 which is Successful Status Code
    res.status(200).json({
        message:"Registered Users Done",
    })
})


export {registerUser}