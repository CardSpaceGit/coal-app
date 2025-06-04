"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Search, Building2, Users, Edit, Trash2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Organization } from "@/types/database"

interface OrganizationWithStats extends Organization {
  user_count: number
  active_user_count: number
}

export default function OrganizationsManagement() {
  const { superAdmin } = useAuth()
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!superAdmin) {
      router.push("/dashboard")
      return
    }
    loadOrganizations()
  }, [superAdmin])

  const loadOrganizations = async () => {
    try {
      // Get organizations with user counts
      const { data: orgs } = await supabase.from("organizations").select(`
        *,
        organization_users(id, is_active)
      `)

      const orgsWithStats =
        orgs?.map((org) => ({
          ...org,
          user_count: org.organization_users?.length || 0,
          active_user_count: org.organization_users?.filter((u: any) => u.is_active).length || 0,
        })) || []

      setOrganizations(orgsWithStats)
    } catch (error) {
      console.error("Error loading organizations:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteOrganization = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      return
    }

    try {
      await supabase.from("organizations").delete().eq("id", orgId)
      loadOrganizations()
    } catch (error) {
      console.error("Error deleting organization:", error)
    }
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
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
            <Button variant="ghost" size="icon" onClick={() => router.push("/super-admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Organizations Management</h1>
              <p className="text-sm text-gray-600">Manage all platform organizations</p>
            </div>
          </div>
          <Button
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => router.push("/super-admin/organizations/new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organizations by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <p className="text-sm text-gray-600">@{org.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/super-admin/organizations/${org.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOrganization(org.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {org.description && <p className="text-sm text-gray-600">{org.description}</p>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{org.user_count} total</Badge>
                      <Badge variant="default">{org.active_user_count} active</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {new Date(org.created_at).toLocaleDateString()}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/super-admin/organizations/${org.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No organizations found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
