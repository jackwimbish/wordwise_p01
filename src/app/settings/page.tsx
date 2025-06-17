'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  User, 
  Mail, 
  Shield,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-slate-600">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-slate-800">Account Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-800">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User ID
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <code className="text-xs text-slate-600 font-mono break-all">
                    {user.id}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Verified
                </label>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Shield className="w-4 h-4 text-slate-400 mr-2" />
                  <span className={`font-medium ${
                    user.email_confirmed_at ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {user.email_confirmed_at ? '✅ Verified' : '⚠️ Not Verified'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Created
                </label>
                <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-800">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-slate-800">Account Actions</h2>
            </div>

            <div className="space-y-4">
              {!user.email_confirmed_at && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Email Verification Required
                      </h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Please check your email and click the verification link to secure your account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  <strong>Note:</strong> Additional account management features like password changes 
                  and email updates are available through Supabase Auth. More settings will be added here in future updates.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Security</h3>
          <div className="text-sm text-slate-600 space-y-2">
            <p>• Your account is secured with Supabase authentication</p>
            <p>• We recommend using a strong, unique password</p>
            <p>• Your data is encrypted and stored securely</p>
            <p>• You can sign out at any time using the navigation menu</p>
          </div>
        </div>
      </div>
    </div>
  )
} 