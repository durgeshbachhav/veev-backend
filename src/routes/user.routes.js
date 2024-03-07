import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser, updateUserAvatar, updateUserCoverImage, userAccountDetails } from "../controllers/user.controller.js";
import { verifyJsonWebToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.route('/check').get((req, res) => {
     res.send('check completed')
})

//register user - done
router.route('/register').post(
     upload.fields(
          [
               {
                    name: 'avatar',
                    maxCount: 1
               },
               {
                    name: 'coverImage',
                    maxCount: 1
               }
          ]
     ),
     registerUser
)

// post data
router.route('/login').post(loginUser); //- working
router.route('/logout').post(verifyJsonWebToken, logoutUser) // working pass mongo db generated id and refreshtoken 
router.route('/change-password').post(verifyJsonWebToken, changeCurrentPassword) // working
router.route('/update-avatar').patch(verifyJsonWebToken, upload.single('avatar'), updateUserAvatar) // working
router.route('/update-coverImage').patch(verifyJsonWebToken, upload.single('coverImage'), updateUserCoverImage) //working

//get data 
router.route('/current-user').get(verifyJsonWebToken, getCurrentUser) //working
router.route('/account-details').get(verifyJsonWebToken, userAccountDetails) //working
router.route('/channel-profile/:username').get(verifyJsonWebToken, getUserChannelProfile) // working
router.route('/watch-history').get(verifyJsonWebToken, getWatchHistory) //working

export default router;
