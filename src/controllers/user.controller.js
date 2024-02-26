import { options } from "../constant";
import { uploadCloudinary } from "../services/cloudinary";
import { ApiResponse } from "../utility/Response";
import { ThrowError } from "../utility/ThrowError";
import { asyncHandler } from "../utility/asyncHandler";
import User from 'user.controller.js'
import jsonwebtoken from 'jsonwebtoken'



// generate accessAndRefreshToken
const GenerateAccessAndRefreshToken = async (userId) => {
     try {
          const user = await User.findById(userId)
          const AccessToken = user.generateAccessToken()
          const RefreshToken = user.generateRefreshToken()

          user.RefreshToken = RefreshToken
          await user.save({ validateBeforeSave: false })

          return { AccessToken, RefreshToken }
     } catch (error) {
          throw new ThrowError(400, 'error while generating accesstoken and refreshtoken')
     }
}

//new user registration
const registerUser = asyncHandler(async (req, res) => {
     try {
          //get the user detail form frontend 
          const { email, userName, fullName, password } = req.body;
          if ([fullName, email, userName, password].some((feild) => feild?.trim() === "")) {
               throw new ThrowError(400, 'all feilds are required')
          }
          const existingUser = User.findOne({
               $or: [{ userName }, { email }]
          })
          if (existingUser) {
               throw new ThrowError(400, "user already found")
          }

          const avatarLocalPath = req.files?.avatar[0]?.path;
          // const coverImageLocalPath = req.files?.coverImage[0]?.path;

          let coverImageLocalPath;
          if (req.files && Array.isArray(req.files.coverImage) && req.files?.coverImage.length > 0) {
               coverImageLocalPath = req.files?.coverImage[0].path
          }

          if (!avatarLocalPath) {
               throw new ThrowError(400, 'user avatar is required')
          }

          const avatar = await uploadCloudinary(avatarLocalPath);
          const coverImage = await uploadCloudinary(coverImageLocalPath);

          if (!avatar) {
               throw new ThrowError(400, 'user avatar is required')
          }

          const user = await User.create({
               userName: userName.tolowerCase(),
               fullName,
               email,
               password,
               avatar: avatar?.url,
               coverImage: coverImage?.url || "",
          })
          const createdUser = User.findById(user._id).select("-password -refreshToken")
          if (!createdUser) {
               throw new ThrowError(400, 'something went wrong while creating user');
          }

          return res.status(201).json(
               ApiResponse(200, "user created successfully")
          )
     } catch (error) {
          throw new ThrowError(400, 'register user getting error')
     }
})

//login existing user
const loginUser = asyncHandler(async (req, res) => {
     const { email, username, password } = req.body;

     if (!email || !username) {
          throw new ThrowError(400, 'username or email required');
     }
     const user = User.findById({
          $or: [{ email }, { username }]
     })
     if (!user) {
          throw new ThrowError(400, 'user not found , please signup')
     }
     const isPasswordCorrect = await user.isPasswordValid(password)

     if (!isPasswordCorrect) {
          throw new ThrowError(401, 'invalid user creadintial')
     }

     const { AccessToken, RefreshToken } = await GenerateAccessAndRefreshToken(user._id);

     const logInUser = User.findById(user._id).select("-password -refreshToken")

     return res
          .status(200)
          .cookie('accessToken', AccessToken, options)
          .cookie('refreshToken', RefreshToken, options)
          .json(
               new ApiResponse(200,
                    {
                         user: logInUser, AccessToken, RefreshToken
                    },
                    'user login successfully'
               )
          )

})

// logout functionality
const logoutUser = asyncHandler(async (req, res) => {
     await User.findByIdAndUpdate(
          req.user._id,
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
     const user = await User.findById(req?.user?._id)

     const isPasswordCorrect = await user.isPasswordValid(oldPassword)
     if (!isPasswordCorrect) {
          throw new ThrowError(400, 'invalid old password')
     }
     user.password = newPassword
     await user.save({ validateBeforeSave: false })

     return res
          .status(200)
          .json(
               new Response(200, "password change successfully")
          )
})

const getCurrentUser = asyncHandler(async (req, res) => {
     return res
          .status(200)
          .json(
               new Response(200, req.user, 'user fetch successfully')
          )
})

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

     return res
          .status(200)
          .json(
               new Response(200, user, 'user update successfully')
          )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
     const avatarLocalPath = req.file?.path

     if (!avatarLocalPath) {
          throw new ThrowError(400, 'avatar file is missing')
     }
     //TODO: delete old image - assignment   

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

     return res
          .status(200)
          .json(
               new Response(200, user, 'avatar image upload successfully')
          )
})


const updateUserCoverImage = asyncHandler(async (req, res) => {
     const coverImageLocalPath = req.file?.path

     if (!coverImageLocalPath) {
          throw new ThrowError(400, 'coverImage file is missing')
     }
     //TODO: delete old image - assignment

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

     return res
          .status(200)
          .json(
               new Response(200, user, 'cover image upload successfully')
          )
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
          throw new ApiError(404, "channel does not exists")
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

