import jsonwebtoken from 'jsonwebtoken'
import { asyncHandler } from '../utility/asyncHandler.js'
import { User } from '../models/user.model.js'
import { ThrowError } from '../utility/ThrowError.js'

export const verifyJsonWebToken = asyncHandler(async (req, _, next) => {
     try {
          console.log("request cookies===>", req.cookies);
          const token = req.cookies?.accessToken || req.headers('Authorization')?.replace("Bearer ", "");
          console.log('token ===> ', token)

          if (!token) {
               throw new ThrowError(401, "auth.middleware.js = > unauthorized access token")
          }

          const decodedToken = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECREAT)
          const user = await User.findById(decodedToken?._id)
          if (!user) {
               throw new ThrowError(400, 'auth.middleware.js = > invalid access token user cannot go to the next step');
          }
          console.log("user => ", user);

          req.user = user;
          next();
     } catch (error) {
          throw new ThrowError(500, error?.message || 'auth.middleware.js getting something wrong')
     }
})