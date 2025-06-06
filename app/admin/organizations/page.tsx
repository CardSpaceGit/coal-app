"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string; userCount?: number } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
  })
  
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
      showToast("Failed to load organizations", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .trim()

      const { error } = await supabase
        .from('organizations')
        .insert([{
          name: formData.name,
          slug: slug,
          description: formData.description || null,
          website: formData.website || null
        }])

      if (error) throw error

      showToast("Organization created successfully", "success")

      setFormData({ name: '', description: '', website: '' })
      setShowCreateDialog(false)
      loadOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      showToast("Failed to create organization", "error")
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrg) return

    setIsUpdating(true)
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .trim()

              const { error } = await supabase
          .from('organizations')
          .update({
            name: formData.name,
            slug: slug,
            description: formData.description || null,
            website: formData.website || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingOrg.id)

        if (error) throw error

        showToast("Organization updated successfully", "success")

        setEditingOrg(null)
        setFormData({ name: '', description: '', website: '' })
      loadOrganizations()
    } catch (error) {
      console.error('Error updating organization:', error)
      showToast("Failed to update organization", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    // First check if there are users associated with this organization
    const { data: users } = await supabase
      .from('organization_users')
      .select('id')
      .eq('organization_id', id)

    setOrgToDelete({ id, name, userCount: users?.length || 0 })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!orgToDelete) return

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgToDelete.id)

      if (error) throw error

      showToast("Organization deleted successfully", "success")
      setShowDeleteDialog(false)
      setOrgToDelete(null)
      loadOrganizations()
    } catch (error) {
      console.error('Error deleting organization:', error)
      showToast("Failed to delete organization", "error")
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
                          <Button 
                            type="submit" 
                            disabled={isCreating}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCreating ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                                Creating...
                              </>
                            ) : (
                              'Create Organization'
                            )}
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading organizations...</p>
                </div>
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
                                onClick={() => handleDelete(org.id, org.name)}
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
                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Organization'
                    )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Delete Organization</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Are you sure you want to delete this organization?
                  </h3>
                  <p className="text-gray-600">
                    You're about to delete <span className="font-medium">{orgToDelete?.name}</span>. 
                    {orgToDelete?.userCount && orgToDelete.userCount > 0 && (
                      <span className="block mt-2 text-red-600 font-medium">
                        ⚠️ This organization has {orgToDelete.userCount} associated user{orgToDelete.userCount !== 1 ? 's' : ''}. 
                        Deleting it will remove all user associations.
                      </span>
                    )}
                    <span className="block mt-2">This action cannot be undone.</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setOrgToDelete(null)
                  }}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  Delete Organization
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 left-4 right-4 z-[100] flex justify-center">
          <div
            className={`flex items-center gap-3 p-4 rounded-[20px] shadow-lg transition-all duration-300 ease-in-out w-full max-w-sm ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            } ${toast.show ? 'animate-slide-in-from-top' : 'animate-slide-out-to-top'}`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}