"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { OrganizationUser, Permission, SuperAdmin } from "@/types/database"

export function useAuth() {
  const [user, setUser] = useState<OrganizationUser | null>(null)
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await loadUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setSuperAdmin(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      // Check if user is super admin first
      const { data: superAdminData } = await supabase
        .from("super_admins")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

      if (superAdminData) {
        setSuperAdmin(superAdminData)
        return
      }

      // If not super admin, check organization user
      const { data: orgUser } = await supabase
        .from("organization_users")
        .select(`
        *,
        role:roles(*),
        organization:organizations(*)
      `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

      if (orgUser) {
        setUser(orgUser)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role?.permissions) return false
    return user.role.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  return {
    user,
    superAdmin,
    loading,
    hasPermission,
    hasAnyPermission,
    refetch: () => user && loadUserProfile(user.user_id),
  }
}
