import prisma from '../../../../lib/prisma'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils'

async function handler(req, res) {
  console.log('🎵 Like Status Debug - Request received:', {
    method: req.method,
    songId: req.query.id,
    hasAuthHeader: !!req.headers.authorization,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  })

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { id: songId } = req.query
    console.log('🎵 Like Status Debug - Processing song ID:', songId)

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(songId)) {
      return res.status(400).json({
        error: 'Invalid song ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if song exists
    console.log('🎵 Like Status Debug - Checking if song exists...')
    const song = await prisma.song.findUnique({ where: { id: songId } })
    if (!song) {
      console.log('❌ Like Status Debug - Song not found:', songId)
      return res.status(404).json({
        error: 'Song not found',
        code: 'NOT_FOUND'
      })
    }
    console.log('✅ Like Status Debug - Song found:', song.title)

    // Check if the user liked it
    console.log('🎵 Like Status Debug - Checking user like status for user:', req.user.id)
    const existingLike = await prisma.userLike.findFirst({
      where: {
        user_id: req.user.id,
        song_id: songId
      }
    })

    const userLiked = !!existingLike
    console.log('✅ Like Status Debug - User liked status:', userLiked)

    return res.status(200).json({
      user_liked: userLiked
    })
  } catch (error) {
    console.error('❌ Like Status Debug - Error occurred:', error)
    return handleApiError(res, error, 'Failed to fetch like status')
  }
}

export default requireAuth(handler)
