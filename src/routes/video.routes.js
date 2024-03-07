import { Router } from "express";
import { verifyJsonWebToken } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
//get
router.route('/get-all-videos').get(verifyJsonWebToken, getAllVideos); 
router.route('/:videoId').get(verifyJsonWebToken, getVideoById); 

//post
router.route('/publish-video').post(verifyJsonWebToken,
     upload.fields(
          [
               {
                    name: 'videoFile',
                    maxCount: 1
               },
               {
                    name: 'thumbnail',
                    maxCount: 1
               }
          ]
     ),
     publishAVideo
)

//patch
router.route('/update-video/:videoId').patch(verifyJsonWebToken,
     upload.fields([
          {
               name: 'thumbnail',
               maxCount: 1
          }
     ])
     ,
     updateVideo) 
router.route('/publish-video/:videoId').patch(verifyJsonWebToken, togglePublishStatus) 


//delete
router.route('/delete-video/:videoId').delete(verifyJsonWebToken, deleteVideo) 

export default router;


// all routes are working