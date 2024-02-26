import mongoose, { Schema } from "mongoose";
import jsonwebtoken from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
     userName: {
          type: string,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
          index: true
     },
     email: {
          type: string,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
     },
     fullName: {
          type: string,
          required: true,
     },
     avatar: {
          type: string,
          required: true,
     },
     coverImage: {
          type: string,
     },
     watchHistory: [
          {
               type: Schema.Types.ObjectId,
               ref: "Video"
          }
     ],
     password: {
          type: string,
          required: [true, 'password is required']
     },
     refreshToken: {
          type: string,
     }
},
     {
          timestamps: true
     });

userSchema.pre("save", async function (next) {
     if (!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password, 10)
     next()
})

userSchema.methods.isPasswordValid = async (password) => {
     return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = () => {
     return jsonwebtoken.sign({
          _id: this._id,
          email: this.email,
          username: this.userName,
          fullName: this.fullName
     }, process.env.ACCESS_TOKEN_SECREAT,
          {
               expiresIn: process.env.ACCESS_TOKEN_EXPIRY
          })
}

userSchema.methods.generateRefreshToken = () => {
     return jsonwebtoken.sign(
          {
               _id: this._id
          },
          process.env.REFRESH_TOKEN_SECREAT,
          {
               expiresIn: process.env.REFRESH_TOKEN_EXPIRY
          }
     )
}


export const User = mongoose.model("User", userSchema);