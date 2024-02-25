import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { asyncHandler } from '../utility/asyncHandler'
import { User } from '../models/user.model'

export const verifyJsonWebToken = asyncHandler(async () => {
     try {
          const token = req.cookies?.accessToken || req.headers('Authorization').replace("Bearer ", "");

          if (!token) {
               throw new Error('unauthorized user');
          }

          const decodedToken = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECREAT)
          const user = User.findById(decodedToken?._id)
          if (!user) {
               throw new Error('access token not found');
          }

          req.user = user;


     } catch (error) {
          console.log(error);
     }
})