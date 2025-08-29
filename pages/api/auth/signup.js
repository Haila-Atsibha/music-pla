import { createClient } from '@supabase/supabase-js'
import prisma from '../../../lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { firstName, lastName, email, password, confirmPassword } = req.body

  // Input validation
  if (!email || !password || !firstName || !lastName || !confirmPassword) {
    return res.status(400).json({ 
      error: 'All fields are required',
      fields: ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ 
      error: 'Passwords do not match',
      field: 'confirmPassword'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long',
      field: 'password'
    })
  }

  try {
    console.log('Starting registration for:', email)
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password: password.trim(),
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim()
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error('Supabase Auth Error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    console.log('Supabase registration successful:', authData.user?.id)

    // 2. Create user in Prisma database
    if (authData.user) {
      try {
        const dbUser = await prisma.user.create({
          data: {
            auth_uid: authData.user.id,
            email: email.toLowerCase().trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            role: 'user'
          }
        })
        console.log('Database user created successfully:', dbUser.id)
      } catch (dbError) {
        console.error('Prisma user creation error:', dbError)
        if (dbError.code === 'P2002') {
          return res.status(400).json({ 
            error: 'An account with this email already exists.'
          })
        }
        return res.status(500).json({ error: 'Database error: ' + dbError.message })
      }
    } else {
      console.error('No auth user returned from Supabase:', authData)
      return res.status(500).json({ error: 'Supabase did not return a user object.' })
    }

    // 3. Return success response
    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please check your email to confirm your account.'
    })

  } catch (error) {
    console.error('Unexpected Registration Error:', error)
    return res.status(500).json({ error: 'Unexpected error: ' + error.message })
  }
}
