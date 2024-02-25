import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'


cloudinary.config({
     cloud_name: process.env.CLOUD_NAME,
     api_key: process.env.CLOUD_API_KEY,
     api_secret: process.env.CLOUD_API_SECREAT
});

const uploadCloudinary = async (localFilePath) => {
     try {
          if (!localFilePath) return null
          //upload file on cloudinary
          const data = await cloudinary.uploader.upload(localFilePath, { resourse_type: "auto" })
          console.log("file upload successfully on cloudinary", data?.url);
          //when file is uploaded on cloudinary then delete from server localpath
          fs.unlinkSync(localFilePath)
          return data;


     } catch (error) {
          //if getting error while uploading file then also we delete the file from local server

          fs.unlinkSync(localFilePath);
          return null;
     }
}

export {
     uploadCloudinary
}




