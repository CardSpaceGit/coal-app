'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Warehouse, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'

interface CoalYard {
  id: string
  name: string
  code: string
  image_url: string | null
  location: string | null
  organization_ids: string[]
  created_at: string
}

interface Organization {
  id: string
  name: string
}

export default function CoalYardsPage() {
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingYard, setEditingYard] = useState<CoalYard | null>(null)
  const [yardToDelete, setYardToDelete] = useState<{ id: string; name: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    image_url: '',
    location: '',
    organization_ids: [] as string[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 4000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file before setting
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        showToast('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error')
        e.target.value = '' // Clear the input
        return
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('File size too large. Please select an image under 5MB', 'error')
        e.target.value = '' // Clear the input
        return
      }

      setImageFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size too large (max 5MB)')
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please use JPEG, PNG, GIF, or WebP')
      }
      
      // Create unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `coal-yard-${Date.now()}.${fileExt}`
      const filePath = `coal-yards/${fileName}`

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type })

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase storage error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      console.log('Public URL generated:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to upload image: ${errorMessage}`, "error")
      return null
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coalYardsResponse, orgsResponse] = await Promise.all([
        supabase
          .from('coal_yards')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('organizations')
          .select('id, name')
          .order('name')
      ])

      if (coalYardsResponse.error) {
        console.error('Supabase error details:', coalYardsResponse.error)
        throw new Error(`Database error: ${coalYardsResponse.error.message}`)
      }

      setCoalYards((coalYardsResponse.data as unknown as CoalYard[]) || [])
      setOrganizations((orgsResponse.data as unknown as Organization[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to load data: ${errorMessage}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const loadCoalYards = async () => {
    try {
      console.log('Loading coal yards...')
      
      const { data, error } = await supabase
        .from('coal_yards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Coal yards loaded successfully:', data)
      setCoalYards((data as unknown as CoalYard[]) || [])
    } catch (error) {
      console.error('Error loading coal yards:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to load coal yards: ${errorMessage}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showToast("Coal yard name is required", "error")
        return
      }

      if (!formData.code.trim()) {
        showToast("Coal yard code is required", "error")
        return
      }

      if (!(formData.organization_ids || []).length) {
        showToast("Please select at least one organization", "error")
        return
      }

      let imageUrl = formData.image_url

      // Upload image if a file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          // If image upload failed, don't proceed
          return
        }
      }

      console.log('Creating coal yard with data:', {
        name: formData.name,
        code: formData.code,
        image_url: imageUrl,
        location: formData.location
      })

      const { data, error } = await supabase
        .from('coal_yards')
        .insert([{
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          image_url: imageUrl || null,
          location: formData.location?.trim() || null,
          organization_ids: formData.organization_ids
        }])
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Coal yard created successfully:', data)
      showToast("Coal yard created successfully", "success")

      setFormData({ name: '', code: '', image_url: '', location: '', organization_ids: [] })
      setImageFile(null)
      setImagePreview(null)
      setShowCreateDialog(false)
      loadCoalYards()
    } catch (error) {
      console.error('Error creating coal yard:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to create coal yard: ${errorMessage}`, "error")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingYard) return

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showToast("Coal yard name is required", "error")
        return
      }

      if (!formData.code.trim()) {
        showToast("Coal yard code is required", "error")
        return
      }

      if (!(formData.organization_ids || []).length) {
        showToast("Please select at least one organization", "error")
        return
      }

      let imageUrl = formData.image_url

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          // If image upload failed, don't proceed
          return
        }
      }

      console.log('Updating coal yard with data:', {
        id: editingYard.id,
        name: formData.name,
        code: formData.code,
        image_url: imageUrl,
        location: formData.location
      })

      const { data, error } = await supabase
        .from('coal_yards')
        .update({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          image_url: imageUrl || null,
          location: formData.location?.trim() || null,
          organization_ids: formData.organization_ids
        })
        .eq('id', editingYard.id)
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Coal yard updated successfully:', data)
      showToast("Coal yard updated successfully", "success")

      setEditingYard(null)
      setFormData({ name: '', code: '', image_url: '', location: '', organization_ids: [] })
      setImageFile(null)
      setImagePreview(null)
      loadCoalYards()
    } catch (error) {
      console.error('Error updating coal yard:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to update coal yard: ${errorMessage}`, "error")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    setYardToDelete({ id, name })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!yardToDelete) return

    try {
      console.log('Deleting coal yard:', yardToDelete)

      const { data, error } = await supabase
        .from('coal_yards')
        .delete()
        .eq('id', yardToDelete.id)
        .select()

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Coal yard deleted successfully:', data)
      showToast("Coal yard deleted successfully", "success")
      setShowDeleteDialog(false)
      setYardToDelete(null)
      loadCoalYards()
    } catch (error) {
      console.error('Error deleting coal yard:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to delete coal yard: ${errorMessage}`, "error")
    }
  }

  const startEdit = (yard: CoalYard) => {
    setEditingYard(yard)
    setFormData({
      name: yard.name,
      code: yard.code,
      image_url: yard.image_url || '',
      location: yard.location || '',
      organization_ids: yard.organization_ids || []
    })
    setImageFile(null)
    setImagePreview(yard.image_url)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-[20px] shadow-lg animate-slide-in-from-top flex items-center gap-2`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="ml-2 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

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
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-light">
              <span className="font-bold">Coal Yards</span>{" "}
              <span className="italic">management.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage coal yards and locations</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {coalYards.length} Coal Yards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Coal Yards Management */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Coal Yards</h2>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coal Yard
                  </Button>
                </DialogTrigger>
                <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
                  <div className="flex flex-col w-full">
                    <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                      <DialogTitle className="text-xl font-bold text-gray-800">Create New Coal Yard</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                      <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Coal Yard Name</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter coal yard name"
                            className="rounded-full"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Code</Label>
                          <Input
                            id="code"
                            value={formData.code || ''}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Enter unique yard code"
                            className="rounded-full"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Enter location"
                            className="rounded-full"
                          />
                        </div>
                        
                        <div>
                          <Label>Organizations</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto border rounded-full p-3">
                            {organizations.map((org) => (
                              <label key={org.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={(formData.organization_ids || []).includes(org.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        organization_ids: [...(formData.organization_ids || []), org.id]
                                      })
                                    } else {
                                      setFormData({
                                        ...formData,
                                        organization_ids: (formData.organization_ids || []).filter(id => id !== org.id)
                                      })
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm">{org.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="image">Coal Yard Image</Label>
                          <div className="space-y-2">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="rounded-full"
                            />
                            <div className="text-xs text-gray-500">
                              Upload an image or enter URL manually below
                            </div>
                            <Input
                              placeholder="Or enter image URL manually"
                              value={formData.image_url || ''}
                              onChange={(e) => {
                                setFormData({ ...formData, image_url: e.target.value })
                                if (e.target.value && !imageFile) {
                                  setImagePreview(e.target.value)
                                }
                              }}
                              className="rounded-full"
                            />
                            {imagePreview && (
                              <div className="mt-2">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            type="submit" 
                            disabled={uploading}
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full"
                          >
                            {uploading ? "Uploading..." : "Create Coal Yard"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowCreateDialog(false)
                              setFormData({ name: '', code: '', image_url: '', location: '', organization_id: '' })
                              setImageFile(null)
                              setImagePreview(null)
                            }} 
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

            {/* Coal Yards List */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="flex items-center gap-2 mb-4">
                <Warehouse className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">All Coal Yards ({coalYards.length})</span>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading coal yards...</div>
              ) : coalYards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No coal yards found. Create your first coal yard to get started.
                </div>
              ) : (
                <div className="bg-white rounded-[16px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="font-semibold text-gray-700">Image</TableHead>
                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Code</TableHead>
                        <TableHead className="font-semibold text-gray-700">Location</TableHead>
                        <TableHead className="font-semibold text-gray-700">Organization</TableHead>
                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coalYards.map((yard) => (
                        <TableRow key={yard.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            {yard.image_url ? (
                              <img
                                src={yard.image_url}
                                alt={yard.name}
                                className="w-12 h-12 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Warehouse className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{yard.name}</TableCell>
                          <TableCell>
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                              {yard.code}
                            </span>
                          </TableCell>
                          <TableCell>{yard.location || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(yard.organization_ids || []).map((orgId) => {
                                const org = organizations.find(o => o.id === orgId)
                                return org ? (
                                  <Badge key={orgId} variant="outline" className="text-xs">
                                    {org.name}
                                  </Badge>
                                ) : null
                              })}
                              {(yard.organization_ids || []).length === 0 && (
                                <span className="text-gray-400 text-sm">No organizations</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(yard.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(yard)}
                                className="rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(yard.id, yard.name)}
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
      <Dialog open={!!editingYard} onOpenChange={() => setEditingYard(null)}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full h-full max-h-[85vh]">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Edit Coal Yard</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Coal Yard Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter coal yard name"
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-code">Code</Label>
                  <Input
                    id="edit-code"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter unique yard code"
                    className="rounded-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="rounded-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-organizations">Organizations</Label>
                  <div className="bg-gray-50 border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    {organizations.map((org) => (
                      <div key={org.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={(formData.organization_ids || []).includes(org.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                organization_ids: [...(formData.organization_ids || []), org.id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                organization_ids: (formData.organization_ids || []).filter(id => id !== org.id)
                              })
                            }
                          }}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-700">{org.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-image">Coal Yard Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="rounded-full"
                    />
                    <div className="text-xs text-gray-500">
                      Upload a new image or update URL manually below
                    </div>
                    <Input
                      placeholder="Or enter image URL manually"
                      value={formData.image_url || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value })
                        if (e.target.value && !imageFile) {
                          setImagePreview(e.target.value)
                        }
                      }}
                      className="rounded-full"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={uploading}
                      className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full"
                    >
                      {uploading ? "Uploading..." : "Update Coal Yard"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setEditingYard(null)
                        setFormData({ name: '', code: '', image_url: '', location: '', organization_id: '' })
                        setImageFile(null)
                        setImagePreview(null)
                      }} 
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Delete Coal Yard</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Warehouse className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Are you sure you want to delete this coal yard?
                  </h3>
                  <p className="text-gray-600">
                    You're about to delete <span className="font-medium">{yardToDelete?.name}</span>. 
                    <span className="block mt-2">This action cannot be undone.</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setYardToDelete(null)
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
                  Delete Coal Yard
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
