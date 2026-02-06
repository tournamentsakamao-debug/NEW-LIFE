'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { TouchButton } from '@/components/ui/TouchButton'
import { Input } from '@/components/ui/Input'
import { Trophy } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSignup && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    const result = isSignup 
      ? await signup(username, password)
      : await login(username, password)

    setLoading(false)

    if (result.success) {
      toast.success(isSignup ? 'Account created successfully!' : 'Logged in successfully!')
      if (result.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      toast.error(result.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-luxury-black via-luxury-gray to-luxury-black">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-luxury-gold to-luxury-darkGold rounded-full mb-4">
            <Trophy className="w-10 h-10 text-luxury-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin's Tournament</h1>
          <p className="text-gray-400">Professional eSports Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-luxury-gray border border-luxury-lightGray rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isSignup && (
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <TouchButton
              type="submit"
              variant="luxury"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
            </TouchButton>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-luxury-gold hover:text-luxury-darkGold transition-colors"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
            }
