import mongoose from "mongoose"
import { asyncHandler } from "../utility/asyncHandler.js"
import { Subscribe } from "../models/subscription.model.js"


const toggleSubscription = asyncHandler(async (req, res) => {
     const { channelId } = req.params
     const userId = req.user?._id;

     //check user is already subscribe a channel or not
     try {
          const existingSubscriber = await Subscribe.findOne({ subscriber: userId, channel: channelId })
          if (existingSubscriber) {
               await existingSubscriber.remove();
               return res
                    .status(200)
                    .json(
                         new Response(200, 'channel is unsubscribe')
                    )
          } else {
               const newSubscription = await Subscribe.create({ subscriber: userId, channel: channelId });
               return res
                    .status(200)
                    .json(
                         new Response(200, newSubscription, 'channel subscribe successfully')
                    )
          }

     } catch (error) {
          throw new Response(500, error?.message || 'error while subsribing a channel')
     }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
     const { channelId } = req.params

     try {
          const subscribers = await Subscribe.find({ channel: channelId }).populate('subscriber')

          // Check if any subscribers were found
          if (!subscribers || subscribers.length === 0) {
               throw new ThrowError(404, 'No subscribers found for the channel');
          }

          const SubscriberDetail = subscribers.map(subscription => ({
               subscriberId: subscription.subscriber.id,
               subscriberName: subscription.subscriber.userName
          }))

          return res
               .status(200)
               .json(
                    new Response(200, SubscriberDetail, 'subscriber detail are fetch successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error?.message || 'error while fetching subscribers')
     }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
     const { subscriberId } = req.params

     try {
          const channels = await Subscribe.find({ subscriber: subscriberId }).populate('channel')

          if (!channels || channels.length === 0) {
               throw new ThrowError(404, 'No subscribed channels found for the user');
          }

          const channelDetails = channels.map(subscription => ({
               channelId: subscription.channel._id,
               channelName: subscription.channel.channelName
          }));

          return res
               .status(200)
               .json(
                    new Response(200, channelDetails, 'channellist fetch successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getting channelList')
     }
})

export {
     toggleSubscription,
     getUserChannelSubscribers,
     getSubscribedChannels
}

