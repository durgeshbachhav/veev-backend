import mongoose from "mongoose"
import { asyncHandler } from "../utility/asyncHandler"
import Video from '../models/video.model.js'
import Like from '../models/like.model.js'
import Comment from '../models/comment.model.js'
import Tweet from '../models/tweet.model.js'

const toggleVideoLike = asyncHandler(async (req, res) => {
     const { videoId } = req.params

     try {
          const video = await Video.findById(videoId)

          if (!video) {
               throw new ThrowError(400, 'video not found')
          }

          const isLiked = await Like.findOne({ video: videoId, likedBy: req.user?._id })
          if (isLiked) {
               await isLiked.remove();
          } else {
               await Like.create({ video: videoId, likedBy: req.user?._id })
          }
          return res
               .status(200)
               .json(
                    new Response(200, 'video Like toggled successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while like to video')
     }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
     const { commentId } = req.params
     try {
          const comment = await Comment.findById(commentId)

          if (!comment) {
               throw new ThrowError(400, 'comment not found')
          }

          const isLiked = await Like.findOne({ comment: commentId, likedBy: req.user?._id })
          if (isLiked) {
               await isLiked.remove();
          } else {
               await Like.create({ comment: commentId, likedBy: req.user?._id })
          }
          return res
               .status(200)
               .json(
                    new Response(200, 'comment Like toggled successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while like to video')
     }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
     const { tweetId } = req.params
     try {
          const tweet = await Tweet.findById(tweetId)

          if (!tweet) {
               throw new ThrowError(400, 'tweet not found')
          }

          const isLiked = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id })
          if (isLiked) {
               await isLiked.remove();
          } else {
               await Like.create({ tweet: tweetId, likedBy: req.user?._id })
          }
          return res
               .status(200)
               .json(
                    new Response(200, 'tweet Like toggled successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while like to video')
     }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

     try {
          const userLikedVideo = await Like.find({ likedBy: req.user?._id })
          if (!userLikedVideo) {
               throw new ThrowError(200, 'user not like yet      any video')
          }

          const videoIds = userLikedVideo.map(like => like.video)

          const likeVideos = await Video.find({ _id: { $in: videoIds } })

          return res
               .status(200)
               .json(
                    new Response(200, likeVideos, 'like video fetch successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getlikeVideos')
     }
})

export {
     toggleCommentLike,
     toggleTweetLike,
     toggleVideoLike,
     getLikedVideos
}