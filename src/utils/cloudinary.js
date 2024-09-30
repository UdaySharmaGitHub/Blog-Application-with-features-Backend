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
        console.log("File hasbeen Successfully uploaded",result.url);   // its is only used for testing purpose
        // fs.unlink(localFilePath); // directly Upload file to the cloudinary
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

