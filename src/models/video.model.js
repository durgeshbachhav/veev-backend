import mongoose, { Schema } from "mongoose";

const videoSchema = mongoose.Schema({
     videoFile: {
          type: string, //url of cloudinary
          required: true,
     },
     thumbnail: {
          type: string, // url of cloudinary
          required: true
     },
     owner: {
          type: Schema.Types.ObjectId,
          ref: "User"
     },
     title: {
          type: string,
          required: true
     },
     description: {
          type: string
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

const Video = mongoose.model('Video', videoSchema);
