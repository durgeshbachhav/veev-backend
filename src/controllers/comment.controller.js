import { asyncHandler } from "../utils/asyncHandler.js"
import Comment from '../models/comment.model.js'


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit;

    try {
        const comments = await Comment.find({ video: videoId })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('owner');
        return res
            .status(200)
            .json(
                new Response(200, comments, 'comments fetch successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error.message || 'error while getting a video commetn')
    }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    try {
        const { videoId } = req.params;
        const { content } = req.body;

        const newComment = await Comment.create(
            {
                video: videoId,
                owner: req.user?._id,
                content
            }
        )
        if (!newComment) {
            throw new ThrowError(400, 'error while commenting')
        }
        await newComment.save();

        return res
            .status(200)
            .json(
                new Response(200, newComment, 'comment created successfully')
            )
    } catch (error) {
        throw new ThrowError(400, error.message || 'error while commenting')
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    try {
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );
        if (!comment) {
            throw new ThrowError(400, 'error while updating a comment')
        }
        return res
            .status(200)
            .json(
                new Response(200, comment, 'comment updated successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error.message || 'error while updating a comment : error')
    }
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    try {
        const comment = await Comment.findById(commentId)
        if (!comment) {
            throw new ThrowError(400, 'comment not found')
        }
        // Ensure that the user deleting the comment is the owner
        if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ThrowError(403, 'Unauthorized: You are not allowed to delete this comment');
        }
        await comment.remove();
        return res
            .status(200)
            .json(
                new Response(200, 'comment deleted successfully')
            )
    } catch (error) {
        throw new ThrowError(500, error.message || 'error while deleteing a comment')
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
