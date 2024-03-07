import mongoose, { Schema } from "mongoose";

const videoSchema = mongoose.Schema({
     videoFile: {
          type: String, //url of cloudinary
          required: true,
     },
     thumbnail: {
          type: String, // url of cloudinary
          required: true
     },
     owner: {
          type: Schema.Types.ObjectId,
          ref: "User"
     },
     title: {
          type: String,
          required: true
     },
     description: {
          type: String,
          required: true
     },
     views: {
          type: Number,
          default: 0
     },
     duration: {
          type: Number,
          required: true
     },
     isPublished: {
          type: Boolean,
          default: true
     }
},
     {
          timestamps: true
     })

export const Video = mongoose.model('Video', videoSchema);
