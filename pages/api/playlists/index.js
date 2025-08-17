const prisma = require('../../../lib/prisma')
const { requireAuth, validateRequiredFields, handleApiError } = require('../../../lib/auth-utils')

/**
 * Playlists API
 * POST /api/playlists - Create playlist (user only)
 * GET /api/playlists - Fetch user's playlists with all songs
 */
async function handler(req, res) {
  if (req.method === 'POST') {
    return await createPlaylist(req, res)
  } else if (req.method === 'GET') {
    return await getUserPlaylists(req, res)
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }
}

/**
 * Create a new playlist
 */
async function createPlaylist(req, res) {
  try {
    const { name, description } = req.body

    // Validate required fields
    const validationError = validateRequiredFields(req.body, ['name'])
    if (validationError) {
      return res.status(400).json(validationError)
    }

    // Check if user already has a playlist with this name
    const existingPlaylist = await prisma.playlist.findFirst({
      where: {
        name: name.trim(),
        owner_id: req.user.id
      }
    })

    if (existingPlaylist) {
      return res.status(409).json({
        error: 'You already have a playlist with this name',
        code: 'DUPLICATE_PLAYLIST'
      })
    }

    // Create playlist
    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        owner_id: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            songs: true
          }
        }
      }
    })

    return res.status(201).json({
      message: 'Playlist created successfully',
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        created_at: playlist.created_at,
        owner: playlist.owner,
        song_count: playlist._count.songs
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to create playlist')
  }
}

/**
 * Get user's playlists with all songs
 */
async function getUserPlaylists(req, res) {
  try {
    const { include_songs = 'true' } = req.query
    const shouldIncludeSongs = include_songs === 'true'

    // Build include object based on query parameter
    const include = {
      owner: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          songs: true
        }
      }
    }

    if (shouldIncludeSongs) {
      include.songs = {
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
          }
        },
        orderBy: {
          added_at: 'desc'
        }
      }
    }

    // Fetch user's playlists
    const playlists = await prisma.playlist.findMany({
      where: {
        owner_id: req.user.id
      },
      include,
      orderBy: {
        created_at: 'desc'
      }
    })

    // Format response
    const formattedPlaylists = playlists.map(playlist => {
      const formatted = {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        created_at: playlist.created_at,
        owner: playlist.owner,
        song_count: playlist._count.songs
      }

      if (shouldIncludeSongs) {
        formatted.songs = playlist.songs.map(playlistSong => ({
          id: playlistSong.id,
          added_at: playlistSong.added_at,
          song: {
            id: playlistSong.song.id,
            title: playlistSong.song.title,
            artist: playlistSong.song.artist,
            album: playlistSong.song.album,
            cover_url: playlistSong.song.cover_url,
            storage_url: playlistSong.song.storage_url,
            uploaded_at: playlistSong.song.uploaded_at,
            uploaded_by: playlistSong.song.uploadedBy
          }
        }))
      }

      return formatted
    })

    return res.status(200).json({
      playlists: formattedPlaylists,
      total_count: playlists.length
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch playlists')
  }
}

// Apply authentication middleware
module.exports = requireAuth(handler)
