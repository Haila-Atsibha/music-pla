import { createClient } from '@supabase/supabase-js'
import prisma from '../../../lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required',
      fields: ['email', 'password']
    })
  }

  try {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password.trim()
    })

    if (authError) {
      console.error('Login error:', authError)
      
      if (authError.message.toLowerCase().includes('invalid login credentials')) {
        return res.status(401).json({ 
          error: 'Invalid email or password',
          field: 'password'
        })
      }
      
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        return res.status(403).json({ 
          error: 'Please confirm your email before logging in',
          field: 'email'
        })
      }
      
      return res.status(400).json({ error: authError.message })
    }

    // 2. Try to get the user from Prisma by auth_uid
    let user = await prisma.user.findUnique({
      where: { auth_uid: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    })

    // 3. If not found, try by email (fallback)
    if (!user) {
      console.warn('User not found by auth_uid, checking by email:', authData.user.email)

      const existingByEmail = await prisma.user.findUnique({
        where: { email: authData.user.email.toLowerCase().trim() }
      })

      if (existingByEmail) {
        // Update with the correct auth_uid
        user = await prisma.user.update({
          where: { email: existingByEmail.email },
          data: { auth_uid: authData.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            created_at: true
          }
        })
        console.log('User record updated with new auth_uid:', user.id)
      }
    }

    if (!user) {
      console.error('User not found in database (even by email):', authData.user.id)
      return res.status(500).json({ error: 'User data not found' })
    }

    // 4. Return success response with user data + session
    return res.status(200).json({
      success: true,
      user,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'User data not found',
        code: 'user_not_found'
      })
    }
    
    return res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export default handler
