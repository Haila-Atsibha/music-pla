import prisma from '../../../../lib/prisma'
import { requireAuth, validateRequiredFields, handleApiError } from '../../../../lib/auth-utils'

/**
 * Playlist Songs API
 * POST /api/playlists/[playlistId]/songs - Add song to playlist (only if playlist belongs to user)
 * DELETE /api/playlists/[playlistId]/songs/[songId] - Remove song from playlist
 */
async function handler(req, res) {
  if (req.method === 'POST') {
    return await addSongToPlaylist(req, res)
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }
}

/**
 * Add song to playlist
 */
async function addSongToPlaylist(req, res) {
  try {
    const { playlistId } = req.query
    const { song_id } = req.body

    // Validate required fields
    const validationError = validateRequiredFields(req.body, ['song_id'])
    if (validationError) {
      return res.status(400).json(validationError)
    }

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(playlistId)) {
      return res.status(400).json({
        error: 'Invalid playlist ID format',
        code: 'VALIDATION_ERROR'
      })
    }
    
    if (!uuidRegex.test(song_id)) {
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
        error: 'You can only add songs to your own playlists',
        code: 'FORBIDDEN'
      })
    }

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: song_id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!song) {
      return res.status(404).json({
        error: 'Song not found',
        code: 'NOT_FOUND'
      })
    }

    // Check if song is already in playlist
    const existingEntry = await prisma.playlistSong.findFirst({
      where: {
        playlist_id: playlistId,
        song_id: song_id
      }
    })

    if (existingEntry) {
      return res.status(409).json({
        error: 'Song is already in this playlist',
        code: 'SONG_ALREADY_IN_PLAYLIST'
      })
    }

    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlist_id: playlistId,
        song_id: song_id
      },
      include: {
        song: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        playlist: {
          include: {
            owner: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return res.status(201).json({
      message: 'Song added to playlist successfully',
      playlist_song: {
        id: playlistSong.id,
        added_at: playlistSong.added_at,
        playlist: {
          id: playlistSong.playlist.id,
          name: playlistSong.playlist.name,
          owner: playlistSong.playlist.owner
        },
        song: {
          id: playlistSong.song.id,
          title: playlistSong.song.title,
          artist: playlistSong.song.artist,
          album: playlistSong.song.album,
          cover_url: playlistSong.song.cover_url,
          storage_url: playlistSong.song.storage_url,
          uploaded_by: playlistSong.song.uploadedBy
        }
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to add song to playlist')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
