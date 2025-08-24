import prisma from '../../../../lib/prisma'
import { requireAuth, handleApiError } from '../../../../lib/auth-utils'

/**
 * Playlist Management API
 * DELETE /api/playlists/[playlistId] - Delete playlist (only if playlist belongs to user)
 */
async function handler(req, res) {
  if (req.method === 'DELETE') {
    return await deletePlaylist(req, res)
  } else {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    })
  }
}

/**
 * Delete a playlist
 */
async function deletePlaylist(req, res) {
  try {
    const { playlistId } = req.query

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(playlistId)) {
      return res.status(400).json({
        error: 'Invalid playlist ID format',
        code: 'VALIDATION_ERROR'
      })
    }

    // Check if playlist exists and belongs to user
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!playlist) {
      return res.status(404).json({
        error: 'Playlist not found',
        code: 'NOT_FOUND'
      })
    }

    if (playlist.owner_id !== req.user.id) {
      return res.status(403).json({
        error: 'You can only delete your own playlists',
        code: 'FORBIDDEN'
      })
    }

    // Delete playlist (this will cascade delete playlist songs due to Prisma schema)
    await prisma.playlist.delete({
      where: { id: playlistId }
    })

    return res.status(200).json({
      message: 'Playlist deleted successfully',
      deleted_playlist: {
        id: playlist.id,
        name: playlist.name
      }
    })

  } catch (error) {
    return handleApiError(res, error, 'Failed to delete playlist')
  }
}

// Apply authentication middleware
export default requireAuth(handler)
