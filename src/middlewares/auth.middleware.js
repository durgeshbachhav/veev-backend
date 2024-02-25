import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { asyncHandler } from '../utility/asyncHandler'
import { User } from '../models/user.model'
import { ThrowError } from '../utility/ThrowError'

export const verifyJsonWebToken = asyncHandler(async () => {
     try {
          const token = req.cookies?.accessToken || req.headers('Authorization').replace("Bearer ", "");

          if (!token) {
               throw new ThrowError(401, "auth.middleware.js = > unauthorized access token")
          }

          const decodedToken = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECREAT)
          const user = User.findById(decodedToken?._id)
          if (!user) {
               throw new ThrowError(400, 'auth.middleware.js = > invalid access token user cannot go to the next step');
          }

          req.user = user;


     } catch (error) {
          throw new ThrowError(500, error?.message || 'auth.middleware.js getting something wrong')
     }
})