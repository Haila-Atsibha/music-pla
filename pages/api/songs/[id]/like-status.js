import prisma from '../../../../lib/prisma'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils'

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { id: songId } = req.query

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(songId)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if song exists
    const song = await prisma.song.findUnique({ where: { id: songId } })
    if (!song) {
      return res.status(404).json({
        error: 'Song not found',
        code: 'NOT_FOUND'
      })
    }

    // Check if the user liked it
    const existingLike = await prisma.userLike.findFirst({
      where: {
        user_id: req.user.id,
        song_id: songId
      }
    })

    return res.status(200).json({
      user_liked: !!existingLike
    })
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch like status')
  }
}

export default requireAuth(handler)
