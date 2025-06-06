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
        setSuperAdmin(superAdminData as any)
        return
      }

      // Get user data from auth.users with metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error("❌ Auth: Failed to get user data:", userError)
        return
      }

      console.log("🔍 Auth: Raw user metadata:", user.user_metadata)

      const metadata = user.user_metadata || {}
      const organizationId = metadata.organization_id
      const roleId = metadata.role_id
      const isActive = metadata.is_active

      if (!isActive) {
        console.log("🔍 Auth: User is not active")
        return
      }

      if (!organizationId || !roleId) {
        console.log("🔍 Auth: Missing organization_id or role_id in user metadata")
        return
      }

      console.log("🔍 Auth: User organization_id:", organizationId)
      console.log("🔍 Auth: User role_id:", roleId)

      // Fetch role data (global roles, no organization filter needed)
      let roleData = null
      const { data: role, error: roleError } = await supabase
        .from("roles")
        .select("id, name, description, permissions, created_at")
        .eq("id", roleId)
        .single()
      
      console.log("🔍 Auth: Fetched role data:", role)
      console.log("🔍 Auth: Role fetch error:", roleError)
      
      if (roleError) {
        console.error("❌ Auth: Failed to fetch role:", roleError.message)
      } else if (role) {
        console.log("✅ Auth: Successfully fetched role:", role.name)
        roleData = role
      } else {
        console.log("⚠️ Auth: Role query succeeded but returned no data")
      }

      // Fetch organization data
      let organizationData = null
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single()
      organizationData = org

      // Create user object with the new structure
      const userWithRelations = {
        id: user.id,
        user_id: user.id,
        organization_id: organizationId,
        role_id: roleId,
        full_name: metadata.full_name || user.email,
        email: user.email,
        avatar_url: metadata.avatar_url,
        is_active: isActive,
        role: roleData,
        organization: organizationData,
        created_at: user.created_at,
        updated_at: user.updated_at
      } as any

      console.log("🔍 Auth: Final user object with role:", userWithRelations)
      console.log("🔍 Auth: Role name in final object:", userWithRelations.role?.name || "NO ROLE")
      setUser(userWithRelations)
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
