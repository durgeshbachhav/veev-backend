import mongoose from "mongoose"
import { asyncHandler } from "../utility/asyncHandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new Response(200, 'service is healty')
    );
});


export {
    healthcheck
}
