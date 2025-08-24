import prisma from '../../../../lib/prisma'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils'

/**
 * Play History API
 * POST /api/users/[userId]/history - Add song to play history
 * GET /api/users/[userId]/history - Get user's play history
 */
async function handler(req, res) {
  if (req.method === 'POST') {
    return await addToHistory(req, res)
  } else if (req.method === 'GET') {
    return await getHistory(req, res)
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }
}

/**
 * Add song to play history
 */
async function addToHistory(req, res) {
  try {
    const { songId } = req.body

    if (!songId) {
      return res.status(400).json({
        error: 'Song ID is required',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: songId }
    })

    if (!song) {
      return res.status(404).json({
        error: 'Song not found',
        code: 'NOT_FOUND'
      })
    }

    // Add to play history
    const playHistory = await prisma.playHistory.create({
      data: {
        user_id: req.user.id,
        song_id: songId
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            cover_url: true,
            storage_url: true
          }
        }
      }
    })

    return res.status(201).json({
      message: 'Song added to history',
      play_history: playHistory
    })

  } catch (error) {
    console.error('Add to history error:', error)
    return handleApiError(res, error, 'Failed to add song to history')
  }
}

/**
 * Get user's play history
 */
async function getHistory(req, res) {
  try {
    const { page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    // First, get all play history entries for the user
    const allHistory = await prisma.playHistory.findMany({
      where: {
        user_id: req.user.id
      },
      include: {
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            cover_url: true,
            storage_url: true
          }
        }
      },
      orderBy: {
        played_at: 'desc'
      }
    })

    // Group by song and keep only the latest play for each song
    const uniqueSongsMap = new Map()
    allHistory.forEach(entry => {
      if (!uniqueSongsMap.has(entry.song_id)) {
        uniqueSongsMap.set(entry.song_id, entry)
      }
    })

    // Convert to array and sort by latest play time
    const uniqueHistory = Array.from(uniqueSongsMap.values())
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))

    // Apply pagination
    const paginatedHistory = uniqueHistory.slice(skip, skip + limitNum)

    return res.status(200).json({
      history: paginatedHistory.map(entry => ({
        id: entry.id,
        played_at: entry.played_at,
        song: entry.song
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: uniqueHistory.length,
        pages: Math.ceil(uniqueHistory.length / limitNum)
      }
    })

  } catch (error) {
    console.error('Get history error:', error)
    return handleApiError(res, error, 'Failed to get play history')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
