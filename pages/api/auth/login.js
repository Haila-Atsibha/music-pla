import { createClient } from '@supabase/supabase-js'
import prisma from '../../../lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
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
      
      // Handle specific error cases
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

    // 2. Get additional user data from our database
    const user = await prisma.user.findUnique({
      where: { auth_uid: authData.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true
      }
    })

    if (!user) {
      console.error('User not found in database:', authData.user.id)
      return res.status(500).json({ error: 'User data not found' })
    }

    // 3. Return success response with user data
    return res.status(200).json({
      success: true,
      user: {
        ...user,
        // Include any additional user data you want to expose to the frontend
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // Handle Prisma errors
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
