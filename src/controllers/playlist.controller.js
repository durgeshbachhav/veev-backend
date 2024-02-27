import { asyncHandler } from "../utility/asyncHandler"
import Playlist from '../models/playlist.model.js'



const createPlaylist = asyncHandler(async (req, res) => {
     const { name, description } = req.body

     try {
          const newPlaylist = await Playlist.create({ name, description })
          if (!newPlaylist) {
               throw new ThrowError(400, 'error while creating a playlist')
          }
          await newPlaylist.save();
          return res
               .status(200)
               .json(
                    new Response(200, newPlaylist, 'playlist created successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error in while create a playlist')
     }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
     const { userId } = req.params

     try {
          const playlist = await Playlist.findById({ owner: userId }).populate('owner')

          if (!playlist || playlist.length === 0) {
               throw new ThrowError(404, 'No playlists found for the user');
          }

          return res
               .status(200)
               .json(
                    new Response(200, playlist, 'playlist found successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getting playlist')
     }
})

const getPlaylistById = asyncHandler(async (req, res) => {
     const { playlistId } = req.params

     try {
          const playlist = await Playlist.findById(playlistId)
          if (!playlist || playlist.length === 0) {
               throw new ThrowError(404, 'No playlists found for the user');
          }
          return res
               .status(200)
               .json(
                    new Response(200, playlist, 'playlist found successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getting playlist')
     }

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
     const { playlistId, videoId } = req.params

     try {
          const playlist = await Playlist.findById(playlistId)

          if (!playlist || playlist.length === 0) {
               throw new ThrowError(404, 'No playlists found for the user');
          }

          playlist.videos.push(videoId);
          await playlist.save();

          return res
               .status(200)
               .json(
                    new Response(200, playlist, 'video added to playlist')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getting playlist')
     }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
     const { playlistId, videoId } = req.params
     try {
          const playlist = await Playlist.findById(playlistId)

          if (!playlist || playlist.length === 0) {
               throw new ThrowError(404, 'No playlists found for the user');
          }

          playlist.videos.pull(videoId);
          await playlist.save();

          return res
               .status(200)
               .json(
                    new Response(200, playlist, 'video remove from to playlist')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error while getting playlist')
     }

})

const deletePlaylist = asyncHandler(async (req, res) => {
     const { playlistId } = req.params
     try {
          const playlist = await Playlist.findById(playlistId)
          if (!playlist) {
               throw new ThrowError(400, 'playlist is not found')
          }
          await playlist.remove();
          return res
               .status(200)
               .json(
                    new Response(200, 'playlist remove successfully')
               )
     } catch (error) {
          throw new ThrowError(500, error.message || 'error in while create a playlist')
     }
})

const updatePlaylist = asyncHandler(async (req, res) => {
     const { playlistId } = req.params
     const { name, description } = req.body

     try {
          const playlist = await Playlist.findByIdAndUpdate(
               playlistId,
               {
                    $set: {
                         name,
                         description
                    }
               },
               {
                    new: true
               }
          );

          if (!playlist || playlist.length === 0) {
               throw new ThrowError(404, 'No playlists found for the user');
          }

          return res
               .status(200)
               .json(
                    new Response(200, playlist, 'playlist updated successfully')
               )

     } catch (error) {
          throw new ThrowError(500, error.message || 'error while updateing playlist')
     }
})


export {
     createPlaylist,
     getUserPlaylists,
     getPlaylistById,
     addVideoToPlaylist,
     removeVideoFromPlaylist,
     deletePlaylist,
     updatePlaylist
}
