'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from './ui/button'

export function AuthExample() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) {
          setMessage(error.message)
        } else {
          setMessage('✅ Account created! Please check your email for verification.')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setMessage(error.message)
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred: ' + String(error))
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      setMessage(error.message)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-lg font-medium text-gray-900">Loading...</div>
  }

  if (user) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md border">
        <h2 className="text-xl font-bold mb-4 text-gray-900">✅ Welcome!</h2>
        <p className="mb-6 text-gray-700 font-medium">
          Signed in as: <span className="text-blue-600">{user.email}</span>
        </p>
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <p>User ID: <code className="bg-gray-100 px-1 rounded text-xs">{user.id}</code></p>
          <p>Email confirmed: {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="w-full">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md border">
      <h2 className="text-xl font-bold mb-6 text-gray-900 text-center">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-gray-900 font-medium bg-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
            Password (min 6 characters)
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-gray-900 font-medium bg-white"
            minLength={6}
            required
          />
        </div>
        
        <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-md border ${
          message.includes('✅') || message.includes('Account created') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium whitespace-pre-line">{message}</p>
        </div>
      )}
    </div>
  )
} 