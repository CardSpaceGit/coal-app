"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Shield, TrendingUp, Plus } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Organization, OrganizationUser } from "@/types/database"

interface SuperAdminStats {
  totalOrganizations: number
  totalUsers: number
  totalRoles: number
  activeUsers: number
}

export default function SuperAdminDashboard() {
  const { superAdmin, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [recentOrganizations, setRecentOrganizations] = useState<Organization[]>([])
  const [recentUsers, setRecentUsers] = useState<OrganizationUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!authLoading) {
      if (!superAdmin) {
        router.push("/dashboard")
        return
      }
      loadDashboardData()
    }
  }, [authLoading, superAdmin])

  const loadDashboardData = async () => {
    try {
      // Get stats
      const [orgsResult, usersResult, rolesResult] = await Promise.all([
        supabase.from("organizations").select("id"),
        supabase.from("organization_users").select("id, is_active"),
        supabase.from("roles").select("id"),
      ])

      const totalOrganizations = orgsResult.data?.length || 0
      const totalUsers = usersResult.data?.length || 0
      const activeUsers = usersResult.data?.filter((u) => u.is_active).length || 0
      const totalRoles = rolesResult.data?.length || 0

      setStats({
        totalOrganizations,
        totalUsers,
        totalRoles,
        activeUsers,
      })

      // Get recent organizations
      const { data: recentOrgs } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      // Get recent users
      const { data: recentUsersData } = await supabase
        .from("organization_users")
        .select(`
          *,
          organization:organizations(name),
          role:roles(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentOrgs) setRecentOrganizations(recentOrgs)
      if (recentUsersData) setRecentUsers(recentUsersData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading super admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!superAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-purple-100">Platform Management</p>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-light">
              Welcome back, <span className="font-bold">{superAdmin.full_name}</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Organizations</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.totalOrganizations || 0}</p>
                </div>
                <Building2 className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.activeUsers || 0}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Roles</p>
                  <p className="text-3xl font-bold text-gray-800">{stats?.totalRoles || 0}</p>
                </div>
                <Shield className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-20 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => router.push("/super-admin/organizations")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <span>Manage Organizations</span>
                </div>
              </Button>
              <Button
                className="h-20 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => router.push("/super-admin/users")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </div>
              </Button>
              <Button
                className="h-20 bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => router.push("/super-admin/roles")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span>Manage Roles</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Organizations */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Organizations</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push("/super-admin/organizations/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{org.name}</h4>
                      <p className="text-sm text-gray-600">{org.slug}</p>
                    </div>
                    <Badge variant="outline">{new Date(org.created_at).toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push("/super-admin/users/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{user.full_name}</h4>
                      <p className="text-sm text-gray-600">{user.organization?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{user.role?.name}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
