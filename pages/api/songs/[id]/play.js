import prisma from '../../../../lib/prisma.js'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils.js'

/**
 * Song Play Tracking API
 * POST /api/songs/[id]/play - Record that a user played a song (play_history entry)
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

    // Check if user has played this song recently (within last 30 seconds)
    // This prevents spam/duplicate entries from rapid API calls
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
    
    const recentPlay = await prisma.playHistory.findFirst({
      where: {
        user_id: req.user.id,
        song_id: songId,
        played_at: {
          gte: thirtySecondsAgo
        }
      }
    })

    if (recentPlay) {
      return res.status(200).json({
        message: 'Play already recorded recently',
        play_history: {
          id: recentPlay.id,
          played_at: recentPlay.played_at,
          song: {
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album
          },
          user: {
            id: req.user.id,
            name: req.user.name
          }
        },
        duplicate: true
      })
    }

    // Record the play in history
    const playHistory = await prisma.playHistory.create({
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
        },
        song: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            cover_url: true
          }
        }
      }
    })

    // Get updated play count for this song
    const totalPlays = await prisma.playHistory.count({
      where: {
        song_id: songId
      }
    })

    return res.status(201).json({
      message: 'Play recorded successfully',
      play_history: {
        id: playHistory.id,
        played_at: playHistory.played_at,
        song: playHistory.song,
        user: playHistory.user
      },
      song_stats: {
        total_plays: totalPlays
      },
      duplicate: false
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to record play')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
