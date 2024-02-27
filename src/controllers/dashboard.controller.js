import mongoose from "mongoose"
import { asyncHandler } from "../utility/asyncHandler"
import Video from '../models/video.model.js'

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        // Get the user's channel ID from the request
        const { userId } = req.params;

        // Calculate total video views
        const totalVideoViews = await Video.aggregate([
            {
                $match: { owner: userId } // Filter videos by the user's ID
            },
            {
                $group: {
                    _id: null, // Aggregate all documents
                    totalViews: { $sum: "$views" } // Sum up the views field for all videos
                }
            }
        ]);

        // Get total subscribers count
        const totalSubscribers = await Subscribe.countDocuments({ channel: userId });

        // Get total videos count
        const totalVideos = await Video.countDocuments({ owner: userId });

        // Get total likes count on all videos
        const totalLikes = await Like.countDocuments({});

        // Construct the response object
        const channelStats = {
            totalVideoViews: totalVideoViews.length > 0 ? totalVideoViews[0].totalViews : 0,
            totalSubscribers,
            totalVideos,
            totalLikes
        };

        return res
            .status(200)
            .json(
                new Response(200, channelStats, 'Channel statistics retrieved successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error.message || 'erro while getting statistics')
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {

    try {
        const channelVideos = await Video.find({ owner: req.user?._id })
        if (!channelVideos || channelVideos.length === 0) {
            throw new ThrowError(404, 'Videos not found for the channel');
        }
        return res
            .status(200)
            .json(
                new Response(200, channelVideos, 'you channel videos')
            )
    } catch (error) {
        throw new ThrowError(500, error.message || 'error while getting channel videos')
    }

})

export {
    getChannelStats,
    getChannelVideos
}