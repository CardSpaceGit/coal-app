"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Track page navigation loading
  useEffect(() => {
    const handleStart = () => setPageLoading(true)
    const handleComplete = () => setPageLoading(false)

    // Show loading for navigation
    setPageLoading(true)
    
    // Simulate page load completion after a short delay
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 300)

    return () => {
      clearTimeout(timer)
      setPageLoading(false)
    }
  }, [pathname])

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

      // Check if user is a Super Admin
      const { data: superAdmin, error: superAdminError } = await supabase
        .from('super_admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (superAdminError || !superAdmin) {
        console.error('Access denied: User is not a Super Admin')
        alert('Access denied. Super Admin privileges required.')
        router.push('/dashboard')
        return
      }

      setIsSuperAdmin(true)
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
      <LoadingPage 
        message="Checking authentication..." 
        description="Verifying super admin privileges"
      />
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
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold px-4 py-2 rounded-full"
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
            <h1 className="text-lg font-semibold text-gray-900">Super Admin Panel</h1>
            <span className="text-sm text-gray-500">({user?.email})</span>
            {pageLoading && (
              <LoadingSpinner size="sm" className="ml-2" />
            )}
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
      <div className="relative">
        {pageLoading && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm">
            <div className="h-1 bg-yellow-500 animate-pulse"></div>
          </div>
        )}
        {children}
      </div>
    </div>
  )
} 