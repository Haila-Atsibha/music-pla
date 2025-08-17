const prisma = require('../../../../lib/prisma')
const { requireAuth, handleApiError } = require('../../../../lib/auth-utils')

/**
 * Song Like API
 * POST /api/songs/[id]/like - User likes/unlikes a song (toggle functionality)
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { id: songId } = req.query

    // Validate song ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(songId)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: {
        id: true,
        title: true,
        artist: true,
        album: true
      }
    })

    if (!song) {
      return res.status(404).json({
        error: 'Song not found',
        code: 'NOT_FOUND'
      })
    }

    // Check if user has already liked this song
    const existingLike = await prisma.userLike.findFirst({
      where: {
        user_id: req.user.id,
        song_id: songId
      }
    })

    let action = ''
    let likeData = null

    if (existingLike) {
      // Unlike the song (remove like)
      await prisma.userLike.delete({
        where: {
          id: existingLike.id
        }
      })
      action = 'unliked'
    } else {
      // Like the song (create like)
      likeData = await prisma.userLike.create({
        data: {
          user_id: req.user.id,
          song_id: songId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
      action = 'liked'
    }

    // Get updated like count
    const likeCount = await prisma.userLike.count({
      where: {
        song_id: songId
      }
    })

    const response = {
      message: `Song ${action} successfully`,
      action,
      song: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album
      },
      like_count: likeCount,
      user_liked: action === 'liked'
    }

    if (likeData) {
      response.like_data = {
        id: likeData.id,
        liked_at: likeData.liked_at,
        user: likeData.user
      }
    }

    return res.status(200).json(response)

  } catch (error) {
    return handleApiError(res, error, 'Failed to process like action')
  }
}

// Apply authentication middleware
module.exports = requireAuth(handler)
