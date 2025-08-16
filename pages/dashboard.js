import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getStoredUser, getStoredSession, clearSession, isAuthenticated } from '../lib/api'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Get user data
    const userData = getStoredUser()
    const sessionData = getStoredSession()
    
    if (userData && sessionData) {
      setUser(userData)
    } else {
      router.push('/login')
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Dashboard - Music Platform</title>
        <meta name="description" content="Your music platform dashboard" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Music Platform</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard!</h2>
                <p className="text-gray-600 mb-6">
                  You have successfully logged in to the music platform.
                </p>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                  <div className="space-y-2 text-left">
                    <p><span className="font-medium">Name:</span> {user.name}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Role:</span> {user.role}</p>
                    <p><span className="font-medium">Member since:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
