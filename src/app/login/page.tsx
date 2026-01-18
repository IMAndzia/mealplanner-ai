'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// UI Components
const Button = ({ children, className = '', disabled, ...props }: any) => (
  <button
    className={`px-6 py-3 rounded-lg font-medium transition-all ${
      disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    } ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

const Card = ({ children, className = '', ...props }: any) => (
  <div
    className={`bg-white bg-opacity-80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
)

const Label = ({ children, className = '' }: any) => (
  <label className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
)

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        // Sign Up
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const existingUser = users.find((u: any) => u.email === email)
        
        if (existingUser) {
          throw new Error('Email already registered')
        }
        
        users.push({ email, password, createdAt: new Date().toISOString() })
        localStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem('currentUser', email)
        
        setSuccess('Account created successfully!')
        setTimeout(() => router.push('/'), 1500)
      } else {
        // Login
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find((u: any) => u.email === email && u.password === password)
        
        if (!user) {
          throw new Error('Invalid email or password')
        }
        
        localStorage.setItem('currentUser', email)
        setSuccess('Login successful!')
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-100 py-8 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? '🍳 Create Account' : '👋 Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Join Recipe Hub to save your recipes' : 'Log in to access your recipes'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setSuccess('')
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            {isSignUp
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </Card>
    </main>
  )
}