const prisma = require('../../../lib/prisma')
const { requireAdmin, validateRequiredFields, handleApiError } = require('../../../lib/auth-utils')

/**
 * Admin Song Upload API
 * POST /api/songs/upload
 * 
 * Only users with role = 'admin' can upload songs
 * Accepts: title, artist, album, cover_url, storage_url
 * Returns: created song object
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }

  try {
    const { title, artist, album, cover_url, storage_url } = req.body

    // Validate required fields
    const validationError = validateRequiredFields(req.body, [
      'title', 
      'artist', 
      'storage_url'
    ])
    
    if (validationError) {
      return res.status(400).json(validationError)
    }

    // Validate storage_url format (should be a valid URL)
    try {
      new URL(storage_url)
    } catch (urlError) {
      return res.status(400).json({
        error: 'Invalid storage_url format. Must be a valid URL.',
        code: 'VALIDATION_ERROR',
        field: 'storage_url'
      })
    }

    // Validate cover_url if provided
    if (cover_url) {
      try {
        new URL(cover_url)
      } catch (urlError) {
        return res.status(400).json({
          error: 'Invalid cover_url format. Must be a valid URL.',
          code: 'VALIDATION_ERROR',
          field: 'cover_url'
        })
      }
    }

    // Create song in database
    const song = await prisma.song.create({
      data: {
        title: title.trim(),
        artist: artist.trim(),
        album: album ? album.trim() : null,
        cover_url: cover_url ? cover_url.trim() : null,
        storage_url: storage_url.trim(),
        uploaded_by: req.user.id
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return res.status(201).json({
      message: 'Song uploaded successfully',
      song: {
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover_url: song.cover_url,
        storage_url: song.storage_url,
        uploaded_at: song.uploaded_at,
        uploaded_by: {
          id: song.uploadedBy.id,
          name: song.uploadedBy.name,
          email: song.uploadedBy.email
        }
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to upload song')
  }
}

// Apply admin authentication middleware
module.exports = requireAdmin(handler)
