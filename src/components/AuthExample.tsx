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
        } else {
          // User will be automatically redirected by the main page component
          setMessage('✅ Signed in successfully!')
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
    return <div className="p-4 text-center text-lg font-medium text-slate-700">Loading...</div>
  }

  if (user) {
    return (
      <div className="p-8 max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">✅ Welcome back!</h2>
        <p className="mb-6 text-slate-700 font-medium">
          Signed in as: <span className="text-indigo-600 font-semibold">{user.email}</span>
        </p>
        <div className="space-y-3 mb-6 text-sm text-slate-600 bg-slate-50/80 p-4 rounded-xl border border-slate-200/50">
          <p>User ID: <code className="bg-slate-200/70 px-2 py-1 rounded text-xs font-mono text-slate-700">{user.id}</code></p>
          <p>Email confirmed: {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
        </div>
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="w-full border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-md mx-auto bg-white/90 rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-8 text-slate-800 text-center">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-800 font-medium bg-white/90 placeholder:text-slate-400"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
            Password {isSignUp && <span className="text-slate-500 font-normal">(min 6 characters)</span>}
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-slate-800 font-medium bg-white/90 placeholder:text-slate-400"
            minLength={6}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
      
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors duration-200"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
      
      {message && (
        <div className={`mt-6 p-4 rounded-xl border ${
          message.includes('✅') || message.includes('Account created') 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium whitespace-pre-line">{message}</p>
        </div>
      )}
    </div>
  )
} 