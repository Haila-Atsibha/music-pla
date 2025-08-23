import { createClient } from '@supabase/supabase-js'
import prisma from './prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Authenticate user from request headers and get user data
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object>} User data or null if not authenticated
 */
async function authenticateUser(req) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get additional user data from our database
    const dbUser = await prisma.user.findUnique({
      where: { auth_uid: user.id },
      select: {
        id: true,
        auth_uid: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    })

    if (!dbUser) {
      return null
    }

    return {
      ...dbUser,
      supabase_user: user
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Check if user has admin role
 * @param {Object} user - User object from authenticateUser
 * @returns {boolean} True if user is admin
 */
function isAdmin(user) {
  return user && user.role === 'admin'
}

/**
 * Middleware to require authentication
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with authentication
 */
function requireAuth(handler) {
  return async (req, res) => {
    const user = await authenticateUser(req)
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      })
    }

    // Add user to request object
    req.user = user
    return handler(req, res)
  }
}

/**
 * Middleware to require admin role
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with admin authentication
 */
function requireAdmin(handler) {
  return requireAuth(async (req, res) => {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'FORBIDDEN'
      })
    }

    return handler(req, res)
  })
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object|null} Error object if validation fails, null if valid
 */
function validateRequiredFields(body, requiredFields) {
  const missingFields = []
  
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    return {
      error: `Missing required fields: ${missingFields.join(', ')}`,
      code: 'VALIDATION_ERROR',
      fields: missingFields
    }
  }

  return null
}

/**
 * Handle API errors consistently
 * @param {Object} res - Response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 */
function handleApiError(res, error, defaultMessage = 'Internal server error') {
  console.error('API Error:', error)

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'CONFLICT'
    })
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND'
    })
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message,
      code: 'VALIDATION_ERROR'
    })
  }

  // Default error response
  return res.status(500).json({
    error: defaultMessage,
    code: 'INTERNAL_ERROR'
  })
}

export {
  authenticateUser,
  isAdmin,
  requireAuth,
  requireAdmin,
  validateRequiredFields,
  handleApiError
}
