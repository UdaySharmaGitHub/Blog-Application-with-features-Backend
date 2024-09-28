# Full Stack Blog Application Complete Backend

- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

---
## Tech used
`JavaScript` `Node.js` `MongoDB` `Express.js` `Mongoose` `Jsonwebtoken` `bcrypt` `Cloudinary` `multer`

--- 
## Database Connectivity
##### Not a good Approach to connect the database directly in the main file
```bash
;(async()=>{
    try{
   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
   app.on("error",(error)=>{
    console.log("Not able to connect");
    throw error;
   })

   app.listen(process.env.PORT,()=>{
    console.log(`app is listing at port ${process.env.PORT}`);
})

    }catch(error){
        console.error(error);   
    }
})()
```
##### Good approach make a folder name db and inside `db` folder create a 
file name `db.js` and connect the database in this file
```bash
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try{
      const connectionInstance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log(`\n MongoDB connect !! DB Host: ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("MongoDB is unable to connect",error);
        process.exit(1);
    }
}
export default connectDB;
```
- this is an async function is return promise
- After call this function in `index.js `
```bash
// This Good Approach
// connectDB is async method and technically its return promise
connectDB()
.then(()=>{
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
})
.catch((erorr)=>{
    console.log("MongoDB is unable to connect",error);
})
```
---
## Utils Files
#### `asynHandler.js`
```bash
// const asynHandler =()=>{};


// const asynHandler =()=>{};
// const asynHandler =(fn)=>{ ()=>{} }; === const asynHandler =(fn)=>()=>{} ; 

// Higher Order Function (Using Promise)
const asynHandler =(requestHandle)=>{
    // we have to return the promise function
   return (req,res,next) =>{
        Promise.resolve(requestHandle(req,res,next)).
        catch((error)=> next(error) )
        }
    }

    export {asynHandler}
// Higher Order Function (Using Try Catch)
// const asynHandler = (fn)=> async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
```

#### `ApiError.js`
```bash
class ApiError extends Error{
    constructor(
        statusCode,message="Something went wrong",
        errors=[],
        statck=""
    ){
        super(message);
        this.statusCode =statusCode
        this.data = null
        this.succes =false
        this.message = message
        this.errors = errors

        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}
```
#### `ApiResponse.js`
```bash
class ApiResponse{
    constructor(
        statusCode,
        data,
        message="Success",
    ){
        this.statusCode =statusCode
        this.data=data
        this.message = message
        this.success = statusCode < 400
    }

}
```

---

## How to Upload file in Backend

## Cloudinary
### how to use Cloudinary
- create a file name ***`cloudinary.js`*** in the `utils` folder present in `src`.

***`cloudinary.js`***
```bash
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Make the code organized
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null;

        //  Upload file on Cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
        // file has been successfully upload
        console.log("File hasbeen Successfully uploaded",result.url);
        return result;
    } catch (error) {
        /*if we have some error or a malicius file is present in the 
        server than we have to unlink that file from our file system */
        fs.unlinkSync(localFilePath)  // remove the locally saved temporay file as the upload operation got failed
        return null;
    }
}

// Export the function
export {uploadOnCloudinary}

```
### Using Multer
#### mutler middlerware
`multer.middlerware.js`
```bash
import multer from "multer";

//  Storage pattern returns the file Path name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // For unique file or we can use the nano id
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // cb(null, file.fieldname + "-" + uniqueSuffix);

    cb(null, file.originalname); // not a good approach because if we have two file of same name

  },
});

export const upload = multer({
     storage: storage 
    });

```

---

## HTTP Crash Course

#### HTTP Headers
- ***metadata*** : key-value sent along with request and response

- Caching , Authentication , manage State

- ***Request Header*** - from Client
- ***Response Header*** - from Server
- ***Representation Header*** - encoding / Comrpession
- ***Payload Header*** - data

#### Most Comman Header
- ***`Accept : Application / json`***
- ***`User-Agent`***
- ***`Authorization`***
- ***`Content Type`***
- ***`Cookies`***
- ***`Cache-Control`***

#### CORS Header
- ***`Access-Control-Allow-Origin`***
- ***`Access-Control-Allow-Credentials`***
- ***`Access-Control-Allow-Method`***

#### Security
- ***`Cross-Origin-Embedder-Policy`***
- ***`Cross-origin-Opener-Policy`***
- ***`Content-Security-Policy`***
- ***`X-XSS-Protection`***

#### HTTP Methods
Basic set of Operations That can be used to interact with Server
- ***`GET`*** : Retrieve data from Server.
- ***`POST`*** : Create new data on Server(Mostly add).
- ***`PUT`*** : Update existing data on Server.
- ***`DELETE`*** : Delete existing data on Server.
- ***`PATCH`*** : Change part of a resource
- ***`HEAD`*** : No message body(response header only).
- ***`OPTION`*** :What operations are available.
- ***`TRACE`*** : Loopback test (get some data)

## HTTP response status codes
 - HTTP response status codes indicate whether a specific HTTP request has been successfully completed. Responses are grouped in five classes:
- ***`Informational`*** responses ***`100 – 199`***
- ***`Successful`*** responses ***`200 – 299`***
- ***`Redirection`*** messages ***`300 – 399`***
- ***`Client error`*** responses ***`400 – 499`***
- ***`Server error`*** responses ***`500 – 599`***

Example:-
- `100` Continue
- `102` Proccessing
- `200` OK
- `201` Created
- `202` Accepted
- `307` Temporary Redirect
- `308` Permanent Redirect
- `400` Bad Request
- `401` Unathourized
- `402` Payment Required
- `404` Not Found
- `500` Internal Server Error
- `504` Gateway Time Out


#### Full form
- ***`URL`***
A URI (Uniform Resource Identifier) is a sequence of characters that identifies a logical or physical resource. Usually, but not always, connected to the internet. A URI is used to distinguish one resource from another. URIs allow internet protocols to facilitate interactions between and among these resources. The strings of characters incorporated in a URI serve as identifiers, such as a scheme name and a file path. 

- ***`URI`***
A URI (Uniform Resource Identifier) is a sequence of characters that identifies a logical or physical resource. Usually, but not always, connected to the internet. A URI is used to distinguish one resource from another. URIs allow internet protocols to facilitate interactions between and among these resources. The strings of characters incorporated in a URI serve as identifiers, such as a scheme name and a file path. 

- ***`URN`***


