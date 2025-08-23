import prisma from '../../../../lib/prisma'
import { authenticateUser, handleApiError } from '../../../../lib/auth-utils'

/**
 * Song Likes Info API
 * GET /api/songs/[id]/likes - Fetch how many likes a song has and recent likes
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { id: songId } = req.query
    const { limit = 10 } = req.query

    // Validate song ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(songId)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Validate limit parameter
    const limitNum = parseInt(limit)
    if (limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: 'Limit must be between 1 and 50',
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

    // Get total like count
    const totalLikes = await prisma.userLike.count({
      where: {
        song_id: songId
      }
    })

    // Get recent likes with user information
    const recentLikes = await prisma.userLike.findMany({
      where: {
        song_id: songId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        liked_at: 'desc'
      },
      take: limitNum
    })

    // Check if current user (if authenticated) has liked this song
    let userLiked = false
    const user = await authenticateUser(req)
    
    if (user) {
      const userLike = await prisma.userLike.findFirst({
        where: {
          user_id: user.id,
          song_id: songId
        }
      })
      userLiked = !!userLike
    }

    // Format recent likes
    const formattedRecentLikes = recentLikes.map(like => ({
      id: like.id,
      user: like.user,
      liked_at: like.liked_at
    }))

    return res.status(200).json({
      song: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album
      },
      likes: {
        total_count: totalLikes,
        user_liked: userLiked,
        recent_likes: formattedRecentLikes
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch song likes')
  }
}
