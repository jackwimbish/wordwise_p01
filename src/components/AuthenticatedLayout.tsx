'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Navbar } from './Navbar'
import { GrammarProvider } from '@/lib/contexts/GrammarContext'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-700">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <GrammarProvider>
      <div className="min-h-screen bg-slate-50">
        <AuthenticatedContent>
          {children}
        </AuthenticatedContent>
      </div>
    </GrammarProvider>
  )
} 