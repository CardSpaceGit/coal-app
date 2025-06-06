"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[] | null
  created_at: string
  updated_at: string
}

export default function RolesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: ''
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string; userCount?: number } | null>(null)
  
  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 4000)
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description, permissions, created_at, updated_at')
        .order('name')

      if (error) throw error
      setRoles((data as unknown as Role[]) || [])
    } catch (error) {
      console.error('Error loading roles:', error)
      showToast("Failed to load roles", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const permissions = formData.permissions 
        ? formData.permissions.split(',').map(p => p.trim()).filter(p => p)
        : null

      const { error } = await supabase
        .from('roles')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          permissions: permissions
        }])

      if (error) throw error

      showToast("Role created successfully", "success")

      setFormData({ name: '', description: '', permissions: '' })
      setShowCreateDialog(false)
      loadRoles()
    } catch (error) {
      console.error('Error creating role:', error)
      showToast("Failed to create role", "error")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    try {
      const permissions = formData.permissions 
        ? formData.permissions.split(',').map(p => p.trim()).filter(p => p)
        : null

      const { error } = await supabase
        .from('roles')
        .update({
          name: formData.name,
          description: formData.description || null,
          permissions: permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRole.id)

      if (error) throw error

      showToast("Role updated successfully", "success")

      setEditingRole(null)
      setFormData({ name: '', description: '', permissions: '' })
      loadRoles()
    } catch (error) {
      console.error('Error updating role:', error)
      showToast("Failed to update role", "error")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    // First check if there are users with this role
    const { data: users } = await supabase
      .from('organization_users')
      .select('id')
      .eq('role_id', id)

    setRoleToDelete({ id, name, userCount: users?.length || 0 })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleToDelete.id)

      if (error) throw error

      showToast("Role deleted successfully", "success")
      setShowDeleteDialog(false)
      setRoleToDelete(null)
      loadRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      showToast("Failed to delete role", "error")
    }
  }

  const startEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions ? role.permissions.join(', ') : ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/coal-texture.png" alt="Coal texture background" fill className="object-cover" priority />
        </div>
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full overflow-hidden"
                onClick={() => router.push("/profile")}
              >
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{user?.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-light">
              <span className="font-bold">Roles</span>{" "}
              <span className="italic">management.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage user roles and permissions</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {roles.length} Roles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Roles Management */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Roles & Permissions</h2>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
                  <div className="flex flex-col w-full">
                    <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                      <DialogTitle className="text-xl font-bold text-gray-800">Create New Role</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Role Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter role name"
                            className="rounded-full"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter role description"
                            className="rounded-[16px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="permissions">Permissions</Label>
                          <Textarea
                            id="permissions"
                            value={formData.permissions}
                            onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                            placeholder="Enter permissions separated by commas (e.g., manage_users, view_reports)"
                            className="rounded-[16px]"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                            Create Role
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="rounded-full">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Roles List */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">All Roles ({roles.length})</span>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading roles...</p>
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No roles found. Create your first role to get started.
                </div>
              ) : (
                <div className="bg-white rounded-[16px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Description</TableHead>
                        <TableHead className="font-semibold text-gray-700">Permissions</TableHead>
                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions ? 
                                role.permissions.slice(0, 3).map((permission) => (
                                  <span 
                                    key={permission} 
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                                  >
                                    {permission}
                                  </span>
                                )) : '-'
                              }
                              {role.permissions && role.permissions.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{role.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(role.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(role)}
                                className="rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(role.id, role.name)}
                                className="rounded-full text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Edit Role</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Role Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter role description"
                    className="rounded-[16px]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-permissions">Permissions</Label>
                  <Textarea
                    id="edit-permissions"
                    value={formData.permissions}
                    onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                    placeholder="Enter permissions separated by commas (e.g., manage_users, view_reports)"
                    className="rounded-[16px]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    Update Role
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingRole(null)} className="rounded-full">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 