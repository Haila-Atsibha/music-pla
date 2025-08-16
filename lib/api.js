// API utility functions for authentication

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.confirmPassword - Password confirmation
 * @returns {Promise<Object>} Registration response
 */
export async function registerUser(userData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login response with user data and session
 */
export async function loginUser(credentials) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Store user session in localStorage
 * @param {Object} session - Session data from login response
 * @param {Object} user - User data from login response
 */
export function storeSession(session, user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('session', JSON.stringify(session))
    localStorage.setItem('user', JSON.stringify(user))
  }
}

/**
 * Get stored session from localStorage
 * @returns {Object|null} Session data or null if not found
 */
export function getStoredSession() {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('session')
    return session ? JSON.parse(session) : null
  }
  return null
}

/**
 * Get stored user from localStorage
 * @returns {Object|null} User data or null if not found
 */
export function getStoredUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

/**
 * Clear stored session and user data
 */
export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session')
    localStorage.removeItem('user')
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  const session = getStoredSession()
  if (!session) return false

  // Check if session is expired
  const now = new Date().getTime()
  const expiresAt = new Date(session.expires_at).getTime()
  
  if (now >= expiresAt) {
    clearSession()
    return false
  }

  return true
}
