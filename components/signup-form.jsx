"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, CheckIcon, Loader2 } from 'lucide-react'
import { registerUser } from "@/lib/api"

export default function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password requirements
    const passwordRequirements = [
      { test: formData.password.length >= 8, message: "Password must be at least 8 characters long" },
      { test: /[A-Z]/.test(formData.password), message: "Password must contain an uppercase letter" },
      { test: /[a-z]/.test(formData.password), message: "Password must contain a lowercase letter" },
      { test: /\d/.test(formData.password), message: "Password must contain a number" },
    ]

    const failedRequirement = passwordRequirements.find(req => !req.test)
    if (failedRequirement) {
      setError(failedRequirement.message)
      return
    }

    setIsLoading(true)

    try {
      const response = await registerUser(formData)
      setSuccess(response.message)

      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ]

  return (
    <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center pb-8">
        <CardTitle className="text-3xl font-bold text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-gray-600 text-lg">Join us today and get started</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="h-12 pr-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {formData.password && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckIcon className={`h-4 w-4 ${req.met ? "text-green-500" : "text-gray-300"}`} />
                      <span className={`text-sm ${req.met ? "text-green-600" : "text-gray-500"}`}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="h-12 pr-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
              required
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-red-600 hover:text-red-700 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-red-600 hover:text-red-700 font-medium">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50 font-semibold bg-transparent">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>

      <CardFooter className="justify-center pt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}