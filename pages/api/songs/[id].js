import prisma from '../../../lib/prisma'
import { handleApiError } from '../../../lib/auth-utils'

/**
 * Individual Song API
 * GET /api/songs/[id] - Fetch song by ID with metadata and storage URL
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { id } = req.query

    // Validate song ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Fetch song with detailed information
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        likedBy: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true
              }
            },
            liked_at: true
          },
          orderBy: {
            liked_at: 'desc'
          },
          take: 10 // Show recent 10 likes
        },
        inHistory: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true
              }
            },
            played_at: true
          },
          orderBy: {
            played_at: 'desc'
          },
          take: 10 // Show recent 10 plays
        },
        _count: {
          select: {
            likedBy: true,
            inHistory: true,
            playlists: true
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

    // Format response with detailed information
    const formattedSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      cover_url: song.cover_url,
      storage_url: song.storage_url,
      uploaded_at: song.uploaded_at,
      uploaded_by: song.uploadedBy,
      stats: {
        total_likes: song._count.likedBy,
        total_plays: song._count.inHistory,
        in_playlists: song._count.playlists
      },
      recent_activity: {
        recent_likes: song.likedBy.map(like => ({
          user: like.user,
          liked_at: like.liked_at
        })),
        recent_plays: song.inHistory.map(play => ({
          user: play.user,
          played_at: play.played_at
        }))
      }
    }

    return res.status(200).json({
      song: formattedSong
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch song')
  }
}

export default handler
