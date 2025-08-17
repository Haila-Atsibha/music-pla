const prisma = require('../../../lib/prisma')
const { handleApiError } = require('../../../lib/auth-utils')

/**
 * Songs API
 * GET /api/songs - Fetch all songs with metadata and storage URLs
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    // Parse query parameters for pagination and filtering
    const { 
      page = 1, 
      limit = 20, 
      search, 
      artist, 
      album,
      sortBy = 'uploaded_at',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100.',
        code: 'VALIDATION_ERROR'
      })
    }

    // Build where clause for filtering
    const where = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { album: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (artist) {
      where.artist = { contains: artist, mode: 'insensitive' }
    }
    
    if (album) {
      where.album = { contains: album, mode: 'insensitive' }
    }

    // Validate sort parameters
    const validSortFields = ['title', 'artist', 'album', 'uploaded_at']
    const validSortOrders = ['asc', 'desc']
    
    if (!validSortFields.includes(sortBy) || !validSortOrders.includes(sortOrder)) {
      return res.status(400).json({
        error: 'Invalid sort parameters',
        code: 'VALIDATION_ERROR'
      })
    }

    // Fetch songs with pagination
    const [songs, totalCount] = await Promise.all([
      prisma.song.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              likedBy: true,
              inHistory: true
            }
          }
        }
      }),
      prisma.song.count({ where })
    ])

    // Format response
    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      cover_url: song.cover_url,
      storage_url: song.storage_url,
      uploaded_at: song.uploaded_at,
      uploaded_by: song.uploadedBy,
      stats: {
        likes: song._count.likedBy,
        plays: song._count.inHistory
      }
    }))

    const totalPages = Math.ceil(totalCount / limitNum)

    return res.status(200).json({
      songs: formattedSongs,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_count: totalCount,
        limit: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      },
      filters: {
        search,
        artist,
        album,
        sort_by: sortBy,
        sort_order: sortOrder
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch songs')
  }
}
