import { options } from "../constant.js";
import { uploadCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utility/Response.js";
import { ThrowError } from "../utility/ThrowError.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import { User } from '../models/user.model.js'
import jsonwebtoken from 'jsonwebtoken'
import mongoose from "mongoose";


// generate accessAndRefreshToken
const GenerateAccessAndRefreshToken = async (userId) => {
     try {
          const user = await User.findById(userId)
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({ validateBeforeSave: false })

          return { accessToken, refreshToken }
     } catch (error) {
          throw new ThrowError(400, 'error while generating accesstoken and refreshtoken')
     }
}

//new user registration
const registerUser = asyncHandler(async (req, res) => {

     //get the user detail form frontend 
     const { email, userName, fullName, password } = req.body;
     console.log(email, userName, fullName, password);
     console.log('------------------');
     if ([fullName, email, userName, password].some((feild) => feild?.trim() === "")) {
          throw new ThrowError(400, 'all feilds are required')
     }
     const existingUser = await User.findOne({
          $or: [{ userName }, { email }]
     })
     console.log('existing user query ==>', existingUser);

     if (existingUser) {
          throw new ThrowError(400, "user already found")
     }

     console.log('old user =>', existingUser)
     console.log('request==>', req.files);
     const avatarLocalPath = req.files?.avatar[0]?.path;
     // const coverImageLocalPath = req.files?.coverImage[0]?.path;
     console.log('avatar path =>', avatarLocalPath);
     let coverImageLocalPath;
     if (req.files && Array.isArray(req.files?.coverImage) && req.files?.coverImage.length > 0) {
          coverImageLocalPath = req.files?.coverImage[0].path
     }
     console.log('coverimage-==>', coverImageLocalPath);
     if (!avatarLocalPath) {
          throw new ThrowError(400, 'user avatar is required')
     }

     const avatar = await uploadCloudinary(avatarLocalPath);
     const coverImage = await uploadCloudinary(coverImageLocalPath);
     console.log("avatar url=>", avatar.url)
     console.log('getting error')
     console.log("coverImage=> url=>", coverImage.url)

     if (!avatar) {
          throw new ThrowError(400, 'user avatar is required')
     }
     console.log('avatar is getting===>', avatar)
     console.log('coverImage is getting===>', coverImage)
     const user = await User.create({
          userName: userName.toLowerCase(),
          fullName,
          email,
          password,
          avatar: avatar?.url,
          coverImage: coverImage?.url,
     })
     const createdUser = await User.findById(user?._id).select("-password -refreshToken")
     console.log('created user ====>', createdUser)
     if (!createdUser) {
          throw new ThrowError(400, 'something went wrong while creating user');
     }

     return res.status(201).json(
          new ApiResponse(200, createdUser, "user created successfully")
     )
})

// login user

const loginUser = asyncHandler(async (req, res) => {
     const { email, userName, password } = req.body;

     if (!email || !userName) {
          throw new ThrowError(400, 'username or email required');
     }

     // Execute the query to find the user
     const user = await User.findOne({
          $or: [{ email }, { userName }]
     });

     if (!user) {
          throw new ThrowError(400, 'user not found, please sign up');
     }

     // Now you have the user document, you can call the isPasswordValid method
     const isPasswordCorrect = await user.isPasswordValid(password);

     if (!isPasswordCorrect) {
          throw new ThrowError(401, 'invalid user credentials');
     }

     const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id);

     // Select specific fields from the user document
     const logInUser = await User.findById(user._id).select("-password -refreshToken");

     return res
          .status(200)
          .cookie('accessToken', accessToken, options)
          .cookie('refreshToken', refreshToken, options)
          .json(
               new ApiResponse(200,
                    {
                         user: logInUser.toObject(), // Convert Mongoose document to plain object
                         accessToken, refreshToken
                    },
                    'user login successfully'
               )
          );
});


// logout functionality
const logoutUser = asyncHandler(async (req, res) => {
     const user = req.body._id;
     await User.findByIdAndUpdate(
          user,
          {
               $unset: {
                    RefreshToken: 1 // this remove feild from documents
               }
          },
          {
               new: true
          }
     )

     return res
          .status(200)
          .clearCookie('accessToken', options)
          .clearCookie('refreshToken', options)
          .json(
               new ApiResponse(200, {}, 'user logout successfully')
          )
})


// when access token is expire then refreshToken refresh the accessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
     const incomingRefreshToken = req.cookie.RefreshToken || req.body.RefreshToken;

     if (incomingRefreshToken) {
          throw new ThrowError(400, 'unauthorized request');
     }

     try {
          const decodedToken = jsonwebtoken.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECREAT)


          const user = await User.findById(decodedToken?._id);

          if (!user) {
               throw new ThrowError(400, 'user not exist');
          }
          if (incomingRefreshToken !== user?.RefreshToken) {
               throw new ThrowError(400, 'refreshtoken is expire or used')
          }
          const { AccessToken, newRefreshToken } = await GenerateAccessAndRefreshToken(user?._id)

          return res
               .status(200)
               .cookie('accessToken', AccessToken, options)
               .cookie('refreshToken', newRefreshToken, options)
               .json(
                    new Response(
                         200,
                         {
                              AccessToken, RefreshToken: newRefreshToken
                         },
                         'access token is refresh'
                    )
               )

     } catch (error) {
          throw new ThrowError(401, error?.message || 'invalid refresh token')
     }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
     const { oldPassword, newPassword } = req.body;
     const user = await User.findById(req.user?._id)

     const isPasswordCorrect = await user.isPasswordValid(oldPassword)
     if (!isPasswordCorrect) {
          throw new ThrowError(400, 'invalid old password')
     }
     user.password = newPassword
     await user.save({ validateBeforeSave: false })

     return res
          .status(200)
          .json(
               new Response(200, { newPassword }, "password change successfully")
          )
})

const getCurrentUser = asyncHandler(async (req, res) => {
     const response = new ApiResponse(200, 'User fetch successfully', req.user);
     return res
          .status(200)
          .json(response);
});

const userAccountDetails = asyncHandler(async (req, res) => {
     const { fullName, email } = req.body;

     if (!fullName || !email) {
          throw new ThrowError(400, 'all feild are required form userAccountDetails')
     }


     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    fullName,
                    email: email
               }
          },
          {
               new: true
          }
     ).select("-password")

     const response = new ApiResponse(200, 'user account detail fetch successfully', user)
     return res
          .status(200)
          .json(
               response
          )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
     const avatarLocalPath = req.file?.path

     if (!avatarLocalPath) {
          throw new ThrowError(400, 'avatar file is missing')
     }

     const avatar = await uploadCloudinary(avatarLocalPath);

     if (!avatar) {
          throw new ThrowError(400, 'error while uploading avatar')
     }
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    avatar: avatar.url
               }
          },
          {
               new: true
          }
     ).select("-password")

     const response = new ApiResponse(200, 'Avatar image upload successfully', user);

     return res
          .status(200)
          .json(response);
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
     const coverImageLocalPath = req.file?.path

     if (!coverImageLocalPath) {
          throw new ThrowError(400, 'coverImage file is missing')
     }


     const coverImage = await uploadCloudinary(coverImageLocalPath);

     if (!coverImage) {
          throw new ThrowError(400, 'error while uploading avatar')
     }

     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    coverImage: coverImage.url
               }
          },
          {
               new: true
          }
     ).select("-password")

     const response = new ApiResponse(200, 'cover image upload successfully', user);

     return res
          .status(200)
          .json(response);
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
     const { username } = req.params

     if (!username?.trim()) {
          throw new ApiError(400, "username is missing")
     }

     const channel = await User.aggregate([
          {
               $match: {
                    username: username?.toLowerCase()
               }
          },
          {
               $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
               }
          },
          {
               $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
               }
          },
          {
               $addFields: {
                    subscribersCount: {
                         $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                         $size: "$subscribedTo"
                    },
                    isSubscribed: {
                         $cond: {
                              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                              then: true,
                              else: false
                         }
                    }
               }
          },
          {
               $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1

               }
          }
     ])

     if (!channel?.length) {
          throw new ThrowError(404, "channel does not exists")
     }

     return res
          .status(200)
          .json(
               new ApiResponse(200, channel[0], "User channel fetched successfully")
          )
})

const getWatchHistory = asyncHandler(async (req, res) => {
     const user = await User.aggregate([
          {
               $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
               }
          },
          {
               $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                         {
                              $lookup: {
                                   from: "users",
                                   localField: "owner",
                                   foreignField: "_id",
                                   as: "owner",
                                   pipeline: [
                                        {
                                             $project: {
                                                  fullName: 1,
                                                  username: 1,
                                                  avatar: 1
                                             }
                                        }
                                   ]
                              }
                         },
                         {
                              $addFields: {
                                   owner: {
                                        $first: "$owner"
                                   }
                              }
                         }
                    ]
               }
          }
     ])

     return res
          .status(200)
          .json(
               new ApiResponse(
                    200,
                    user[0].watchHistory,
                    "Watch history fetched successfully"
               )
          )
})

export {
     GenerateAccessAndRefreshToken,
     registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     userAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory
}

