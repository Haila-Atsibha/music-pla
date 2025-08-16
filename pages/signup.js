import Head from 'next/head'
import SignupForm from '../components/signup-form'

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Sign Up - Music Platform</title>
        <meta name="description" content="Create your music platform account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </>
  )
}
