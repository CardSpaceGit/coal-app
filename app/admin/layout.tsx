"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Check if user has admin permissions by checking their role in organization_users
      const { data: orgUser, error: orgError } = await supabase
        .from('organization_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (orgError || !orgUser) {
        console.error('Error fetching user organization:', orgError)
        router.push('/dashboard') // Redirect to regular dashboard if no org access
        return
      }

      // Get the role name separately
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', (orgUser as any).role_id)
        .single()

      if (roleError || !role) {
        console.error('Error fetching user role:', roleError)
        router.push('/dashboard')
        return
      }

      // Check if user has admin role
      const userRole = (role as any).name?.toLowerCase()
      if (userRole !== 'admin') {
        alert('Access denied. Admin privileges required.')
        router.push('/dashboard')
        return
      }

      setAuthorized(true)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
            <span className="text-sm text-gray-500">({user?.email})</span>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  )
} 