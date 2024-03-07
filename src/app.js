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
app.get('/api', (req, res) => {
     res.send('this is api please provide version of api available version /v1')
})
app.get('/api/v1', (req, res) => {
     res.send('welcome to the version 1: please provide next routes eg./user')
})

app.use('/api/v1/comment', commentRoutes)
app.use('/api/v1/health-check', healthCheckRoutes)
app.use('/api/v1/like', likeRoutes)
app.use('/api/v1/playlist', playlistRoutes)
app.use('/api/v1/subscription', subscriptionRoutes)
app.use('/api/v1/tweet', tweetRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/video', videoRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)




//declare routes

export { app };
