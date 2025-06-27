import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config({});

cloudinary.config({
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
    cloud_name: process.env.CLOUD_NAME
});

export const uploadMedia = async (file)=>{
    try {
        const uploadResponse = await cloudinary.uploader.upload(file, {
            resource_type: "auto"
        });
        return uploadResponse;
    } catch (error) {
        console.log(error);
    }
}

//photo edit hone ke baad old photo dlt krne ke liye taki fltu space na use kre voh cloudinary pe 
export const deleteMediaFromCloudinary = async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
    }
}

export const deleteVideoFromCloudinary = async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId, {resource_type: "video"});
    } catch (error) {
        console.log(error);
    }
}


