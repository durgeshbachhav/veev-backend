import mongoose from "mongoose";

const subscribeSchema = mongoose.Schema({
     subscriber: {
          type: Schema.Types.ObjectId, // one who is subscribing
          ref: "User"
     },
     channel: {
          type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
          ref: "User"
     }
}, { timestamps: true })


export const Subscribe = mongoose.model('Subscribe', subscribeSchema);
