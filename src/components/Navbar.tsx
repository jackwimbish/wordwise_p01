'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from './ui/button'
import { 
  FileText, 
  Settings, 
  LogOut, 
  User 
} from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-slate-200 z-40">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent">
            WordWise
          </h1>
          <p className="text-sm text-slate-600 mt-1 truncate">
            {user.email}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/documents"
                className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200 group"
              >
                <FileText className="w-5 h-5 mr-3 text-slate-500 group-hover:text-indigo-600" />
                <span className="font-medium">Documents</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/settings"
                className="flex items-center px-4 py-3 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200 group"
              >
                <Settings className="w-5 h-5 mr-3 text-slate-500 group-hover:text-indigo-600" />
                <span className="font-medium">Account Settings</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-200">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full flex items-center justify-center border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
} 