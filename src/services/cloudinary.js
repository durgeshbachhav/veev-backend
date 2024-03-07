import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { ThrowError } from "../utility/ThrowError.js";


cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.CLOUD_API_KEY,
     api_secret: process.env.CLOUD_API_SECREAT
});





const uploadCloudinary = async (localFilePath) => {
     try {
          if (!localFilePath) {
               throw new ThrowError('Local file path is missing for Cloudinary upload');
          }

          // Upload file to Cloudinary
          const data = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });

          // Log successful upload
          console.log("File uploaded successfully to Cloudinary:", data.url);

          // Delete the local file after successful upload
          fs.unlinkSync(localFilePath);

          // Return Cloudinary response
          return data;
     } catch (error) {
          // Log error
          console.error("Error uploading file to Cloudinary:", error);

          // Ensure local file is deleted even in case of error
          try {
               if (fs.existsSync(localFilePath)) {
                    fs.unlinkSync(localFilePath);
               }
          } catch (unlinkError) {
               console.error("Error deleting local file:", unlinkError);
          }

          // Return null to indicate failure
          return null;
     }
};

export {
     uploadCloudinary
}




