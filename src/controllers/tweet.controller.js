import mongoose from "mongoose"
import { asyncHandler } from "../utility/asyncHandler"
import User from '../models/user.model.js'
import Tweet from '../models/tweet.model.js'



const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;


    try {
        // Ensure the authenticated user ID is set as the owner of the tweet
        const tweet = await Tweet.create({
            content,
            owner: req.user._id // Assuming user is authenticated and their ID is available in req.user
        });

        if (!tweet) {
            throw new ThrowError(400, 'Error while creating a tweet');
        }

        return res
            .status(200)
            .json(
                new Response(200, tweet, 'tweet created successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error?.message || 'error in creation of tweet')
    }
})


const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    try {
        const tweet = await Tweet.find(req.user?._id)
        // Check if any tweets were found
        if (!tweet || tweet.length === 0) {
            throw new ThrowError(404, 'No tweets found for the user');
        }

        return res
            .status(200)
            .json(
                new Response(200, tweet, 'tweets found successfully')
            )
    } catch (error) {
        throw new ThrowError(500, 'error while fetching user tweets')
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const { TweetId } = req.params
    const { content } = req.body;

    try {
        const tweet = await Tweet.findById(TweetId)
        if (!tweet) {
            throw new ThrowError(400, 'tweet not found')
        }

        tweet.content = content;
        await tweet.save();

        return res
            .status(200)
            .json(
                new Response(200, tweet, 'tweet updated successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error?.message || 'error while updating tweet')
    }

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    try {
        const tweet = await Tweet.findById(tweetId);

        if (!tweet) {
            throw new ThrowError(404, 'Tweet not found');
        }

        await tweet.remove();

        return res
            .status(200)
            .json(
                new Response(200, 'tweet deleted successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error?.message || 'error while deleting a tweet')
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
