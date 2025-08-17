import prisma from '../../../../../lib/prisma.js'
import { requireAuth, handleApiError } from '../../../../../lib/auth-utils.js'

/**
 * Remove Song from Playlist API
 * DELETE /api/playlists/[playlistId]/songs/[songId] - Remove song from playlist
 */
async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { playlistId, songId } = req.query

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(playlistId)) {
      return res.status(400).json({
        error: 'Invalid playlist ID format',
        code: 'VALIDATION_ERROR'
      })
    }
    
    if (!uuidRegex.test(songId)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if playlist exists and belongs to user
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!playlist) {
      return res.status(404).json({
        error: 'Playlist not found',
        code: 'NOT_FOUND'
      })
    }

    if (playlist.owner_id !== req.user.id) {
      return res.status(403).json({
        error: 'You can only remove songs from your own playlists',
        code: 'FORBIDDEN'
      })
    }

    // Find the playlist-song relationship
    const playlistSong = await prisma.playlistSong.findFirst({
      where: {
        playlist_id: playlistId,
        song_id: songId
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true
          }
        }
      }
    })

    if (!playlistSong) {
      return res.status(404).json({
        error: 'Song not found in this playlist',
        code: 'SONG_NOT_IN_PLAYLIST'
      })
    }

    // Remove song from playlist
    await prisma.playlistSong.delete({
      where: {
        id: playlistSong.id
      }
    })

    return res.status(200).json({
      message: 'Song removed from playlist successfully',
      removed_song: {
        id: playlistSong.song.id,
        title: playlistSong.song.title,
        artist: playlistSong.song.artist,
        album: playlistSong.song.album
      },
      playlist: {
        id: playlist.id,
        name: playlist.name,
        owner: playlist.owner
      },
      removed_at: new Date().toISOString()
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to remove song from playlist')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
