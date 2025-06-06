"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, Edit, Trash2, Menu } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-simple-toast"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Organization {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name')

      if (error) throw error
      setOrganizations((data as unknown as Organization[]) || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('organizations')
        .insert([{
          name: formData.name,
          description: formData.description || null,
          website: formData.website || null
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Organization created successfully",
      })

      setFormData({ name: '', description: '', website: '' })
      setShowCreateDialog(false)
      loadOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrg) return

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          description: formData.description || null,
          website: formData.website || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOrg.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Organization updated successfully",
      })

      setEditingOrg(null)
      setFormData({ name: '', description: '', website: '' })
      loadOrganizations()
    } catch (error) {
      console.error('Error updating organization:', error)
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This will also remove all associated users.')) {
      return
    }

    try {
      // First check if there are users associated with this organization
      const { data: users } = await supabase
        .from('organization_users')
        .select('id')
        .eq('organization_id', id)

      if (users && users.length > 0) {
        if (!confirm(`This organization has ${users.length} associated users. Are you sure you want to delete it? This will remove all user associations.`)) {
          return
        }
      }

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Organization deleted successfully",
      })

      loadOrganizations()
    } catch (error) {
      console.error('Error deleting organization:', error)
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      })
    }
  }

  const startEdit = (org: Organization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name,
      description: org.description || '',
      website: org.website || ''
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
              <span className="font-bold">Organizations</span>{" "}
              <span className="italic">management.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage company organizations and settings</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {organizations.length} Organizations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Organizations Management */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Organizations</h2>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
                  <div className="flex flex-col w-full">
                    <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                      <DialogTitle className="text-xl font-bold text-gray-800">Create New Organization</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Organization Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter organization name"
                            className="rounded-full"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter organization description"
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://example.com"
                            className="rounded-full"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                            Create Organization
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

            {/* Organizations List */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">All Organizations ({organizations.length})</span>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading organizations...</div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No organizations found. Create your first organization to get started.
                </div>
              ) : (
                <div className="bg-white rounded-[16px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Description</TableHead>
                        <TableHead className="font-semibold text-gray-700">Website</TableHead>
                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.map((org) => (
                        <TableRow key={org.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.description || '-'}</TableCell>
                          <TableCell>
                            {org.website ? (
                              <a 
                                href={org.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {org.website}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(org.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(org)}
                                className="rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(org.id)}
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
      <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Edit Organization</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Organization Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter organization name"
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter organization description"
                    className="rounded-full"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="rounded-full"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    Update Organization
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditingOrg(null)} className="rounded-full">
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