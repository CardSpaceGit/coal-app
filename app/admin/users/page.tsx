"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Mail, Phone, UserCheck, UserX } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { OrganizationUser, Role } from "@/types/database"

export default function UsersManagementPage() {
  const { user, hasPermission } = useAuth()
  const [users, setUsers] = useState<OrganizationUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!hasPermission("manage_users")) {
      router.push("/dashboard")
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersResult, rolesResult] = await Promise.all([
        supabase
          .from("organization_users")
          .select(`
            *,
            role:roles(*)
          `)
          .order("created_at", { ascending: false }),
        supabase.from("roles").select("*").order("name"),
      ])

      if (usersResult.data) setUsers(usersResult.data)
      if (rolesResult.data) setRoles(rolesResult.data)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      await supabase.from("organization_users").update({ role_id: roleId }).eq("id", userId)

      loadData()
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await supabase.from("organization_users").update({ is_active: !isActive }).eq("id", userId)

      loadData()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">User Management</h1>
              <p className="text-sm text-gray-600">{user?.organization?.name}</p>
            </div>
          </div>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800">
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((orgUser) => (
            <Card key={orgUser.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {orgUser.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{orgUser.full_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {orgUser.email}
                        </div>
                        {orgUser.cellphone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {orgUser.cellphone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={orgUser.is_active ? "default" : "secondary"}>
                      {orgUser.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Select value={orgUser.role_id || ""} onValueChange={(value) => updateUserRole(orgUser.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleUserStatus(orgUser.id, orgUser.is_active)}
                      className={
                        orgUser.is_active ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"
                      }
                    >
                      {orgUser.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No users found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
