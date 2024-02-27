import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import commentRoutes from './routes/comment.routes.js';
import dashboardRoutes from './routes/dashboard.router.js'
import healthCheckRoutes from './routes/healthCheck.routes.js'
import likeRoutes from './routes/like.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import userRoutes from './routes/user.routes.js'
import videoRoutes from './routes/video.routes.js'


// declare a routes
app.use('/api/v1/', commentRoutes)
app.use('/api/v1/', healthCheckRoutes)
app.use('/api/v1/', likeRoutes)
app.use('/api/v1/', playlistRoutes)
app.use('/api/v1/', subscriptionRoutes)
app.use('/api/v1/', tweetRoutes)
app.use('/api/v1/', userRoutes)
app.use('/api/v1/', videoRoutes)
app.use('/api/v1/',dashboardRoutes)




//declare routes

export { app };
