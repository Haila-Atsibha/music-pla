import prisma from '../../../../lib/prisma.js'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils.js'

/**
 * User Play History API
 * GET /api/users/[userId]/history - Fetch songs the user has played, ordered by latest
 */
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { userId } = req.query
    const { 
      page = 1, 
      limit = 20,
      unique_songs = 'false' // If true, only show unique songs (latest play of each)
    } = req.query

    // Validate user ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        error: 'Invalid user ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Validate pagination parameters
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100.',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (!targetUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND'
      })
    }

    // Privacy check: users can only view their own history
    if (req.user.id !== userId) {
      return res.status(403).json({
        error: 'You can only view your own play history',
        code: 'FORBIDDEN'
      })
    }

    const offset = (pageNum - 1) * limitNum
    const showUniqueSongs = unique_songs === 'true'

    let playHistory = []
    let totalCount = 0

    if (showUniqueSongs) {
      // Get unique songs with their latest play time
      const uniquePlays = await prisma.playHistory.findMany({
        where: {
          user_id: userId
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
          }
        },
        orderBy: {
          played_at: 'desc'
        }
      })

      // Filter to unique songs (keep only the latest play of each song)
      const uniqueSongsMap = new Map()
      uniquePlays.forEach(play => {
        if (!uniqueSongsMap.has(play.song_id)) {
          uniqueSongsMap.set(play.song_id, play)
        }
      })

      const allUniqueHistory = Array.from(uniqueSongsMap.values())
      totalCount = allUniqueHistory.length
      playHistory = allUniqueHistory.slice(offset, offset + limitNum)

    } else {
      // Get all play history with pagination
      [playHistory, totalCount] = await Promise.all([
        prisma.playHistory.findMany({
          where: {
            user_id: userId
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
            }
          },
          orderBy: {
            played_at: 'desc'
          },
          skip: offset,
          take: limitNum
        }),
        prisma.playHistory.count({
          where: {
            user_id: userId
          }
        })
      ])
    }

    // Format response
    const formattedHistory = playHistory.map(play => ({
      id: play.id,
      played_at: play.played_at,
      song: {
        id: play.song.id,
        title: play.song.title,
        artist: play.song.artist,
        album: play.song.album,
        cover_url: play.song.cover_url,
        storage_url: play.song.storage_url,
        uploaded_at: play.song.uploaded_at,
        uploaded_by: play.song.uploadedBy
      }
    }))

    const totalPages = Math.ceil(totalCount / limitNum)

    return res.status(200).json({
      user: {
        id: targetUser.id,
        name: targetUser.name
      },
      play_history: formattedHistory,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_count: totalCount,
        limit: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      },
      filters: {
        unique_songs: showUniqueSongs
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch play history')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
