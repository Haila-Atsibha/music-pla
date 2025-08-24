import Head from 'next/head'
import LoginForm from '../components/login-form'

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login - Music Platform</title>
        <meta name="description" content="Sign in to your music platform account" />
      </Head>
      
      <div className="min-h-screen bg-[#24293E] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  )
}
