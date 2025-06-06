"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-simple-toast"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface User {
  id: string
  organization_id: string
  user_id: string
  role_id: string
  full_name: string
  email: string
  cellphone: string | null
  is_active: boolean
  invited_at: string
  joined_at: string
  created_at: string
  updated_at: string
  avatar_url: string | null
  org_name: string
  role_name: string
}

interface Organization {
  id: string
  name: string
}

interface Role {
  id: string
  name: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationId: '',
    roleId: '',
    cellphone: ''
  })
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load users, organizations, and roles separately due to relationship issues
      const [usersResponse, orgsResponse, rolesResponse] = await Promise.all([
        supabase
          .from('organization_users')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('organizations')
          .select('id, name')
          .order('name'),
        supabase
          .from('roles')
          .select('id, name')
          .order('name')
      ])

      const usersData = usersResponse.data || []
      const orgsData = orgsResponse.data || []
      const rolesData = rolesResponse.data || []

      // Create lookup maps for organizations and roles
      const orgMap = new Map(orgsData.map(org => [org.id, org.name]))
      const roleMap = new Map(rolesData.map(role => [role.id, role.name]))

      // Format users with organization and role names
      const formattedUsers = usersData.map(user => ({
        ...user,
        org_name: orgMap.get(user.organization_id) || 'Unknown',
        role_name: roleMap.get(user.role_id) || 'Unknown'
      }))

      setUsers(formattedUsers as User[])
      setOrganizations(orgsData as Organization[] || [])
      setRoles(rolesData as Role[] || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Create user using our API endpoint
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      // If user was created with default organization, update with selected organization and role
      if (formData.organizationId !== '550e8400-e29b-41d4-a716-446655440000' || 
          formData.roleId !== '660e8400-e29b-41d4-a716-446655440001') {
        
        const { error: updateError } = await supabase
          .from('organization_users')
          .update({
            organization_id: formData.organizationId,
            role_id: formData.roleId,
            cellphone: formData.cellphone || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', result.user.id)

        if (updateError) {
          console.error('Error updating user assignment:', updateError)
          // Don't fail the whole operation if this fails
        }
      }

      toast({
        title: "Success",
        description: "User created successfully",
      })

      setFormData({ 
        email: '', 
        password: '', 
        fullName: '', 
        organizationId: '', 
        roleId: '', 
        cellphone: '' 
      })
      setShowCreateDialog(false)
      loadData()
    } catch (error) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const { error } = await supabase
        .from('organization_users')
        .update({
          organization_id: formData.organizationId,
          role_id: formData.roleId,
          full_name: formData.fullName,
          cellphone: formData.cellphone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      setEditingUser(null)
      setFormData({ 
        email: '', 
        password: '', 
        fullName: '', 
        organizationId: '', 
        roleId: '', 
        cellphone: '' 
      })
      loadData()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      })

      loadData()
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      loadData()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      fullName: user.full_name,
      organizationId: user.organization_id,
      roleId: user.role_id,
      cellphone: user.cellphone || ''
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
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.push('/admin')}>
              <Menu className="h-6 w-6" />
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
              <span className="font-bold">Users</span>{" "}
              <span className="italic">management.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage system users and their permissions</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {users.length} Users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Users Management */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
                  <div className="flex flex-col w-full">
                    <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                      <DialogTitle className="text-xl font-bold text-gray-800">Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="user@example.com"
                              className="rounded-full"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Enter password"
                              className="rounded-full"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="Enter full name"
                            className="rounded-full"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="organization">Organization</Label>
                            <Select 
                              value={formData.organizationId} 
                              onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                            >
                              <SelectTrigger className="rounded-full">
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                              <SelectContent>
                                {organizations.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select 
                              value={formData.roleId} 
                              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                            >
                              <SelectTrigger className="rounded-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cellphone">Phone (Optional)</Label>
                          <Input
                            id="cellphone"
                            value={formData.cellphone}
                            onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                            placeholder="Enter phone number"
                            className="rounded-full"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button 
                            type="submit" 
                            disabled={creating}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full"
                          >
                            {creating ? 'Creating...' : 'Create User'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowCreateDialog(false)}
                            className="rounded-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Users List */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">All Users ({users.length})</span>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found. Create your first user to get started.
                </div>
              ) : (
                <div className="bg-white rounded-[16px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="font-semibold text-gray-700">User</TableHead>
                        <TableHead className="font-semibold text-gray-700">Organization</TableHead>
                        <TableHead className="font-semibold text-gray-700">Role</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700">Joined</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.cellphone && (
                                <div className="text-xs text-gray-400">{user.cellphone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.org_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">
                              {user.role_name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_active ? "default" : "secondary"}
                              className="rounded-full"
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.joined_at || user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(user)}
                                className="rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                className="rounded-full"
                              >
                                {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(user.id, user.email)}
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
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Edit User</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="rounded-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-organization">Organization</Label>
                    <Select 
                      value={formData.organizationId} 
                      onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select 
                      value={formData.roleId} 
                      onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-cellphone">Phone</Label>
                  <Input
                    id="edit-cellphone"
                    value={formData.cellphone}
                    onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                    placeholder="Enter phone number"
                    className="rounded-full"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    Update User
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="rounded-full">
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



