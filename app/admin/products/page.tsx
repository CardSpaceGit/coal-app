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
import { Package, Plus, Edit, Trash2, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Product {
  id: string
  name: string
  type: string | null
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

interface Organization {
  id: string
  name: string
  product_names: string[]
}

export default function ProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    image_url: '',
    organizationIds: [] as string[]
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
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

  // Image handling functions
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      setFormData({ ...formData, image_url: '' }) // Clear URL when file is selected
    }
  }

  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsResponse, orgsResponse] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('name'),
        supabase
          .from('organizations')
          .select('id, name, product_names')
          .order('name')
      ])

      setProducts((productsResponse.data as unknown as Product[]) || [])
      setOrganizations((orgsResponse.data as unknown as Organization[]) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      showToast("Failed to load data", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      console.log('Starting product creation with form data:', formData)
      
      if (!formData.name.trim()) {
        showToast("Product name is required", "error")
        return
      }

      // Handle image upload if file is selected
      let imageUrl = null
      if (imageFile) {
        console.log('Uploading image file...')
        const uploadedUrl = await uploadImageFile(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
          console.log('Image uploaded successfully:', imageUrl)
        } else {
          showToast("Failed to upload image", "error")
          return
        }
      } else {
        console.log('No image file selected')
      }

      // Create the product
      console.log('Creating product in database with data:', {
        name: formData.name,
        type: formData.type || null,
        description: formData.description || null,
        image_url: imageUrl || null
      })
      
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          type: formData.type || null,
          description: formData.description || null,
          image_url: imageUrl || null
        }])
        .select()
        .single()

      if (productError) {
        console.error('Product creation error:', productError)
        throw new Error(`Failed to create product: ${productError.message || JSON.stringify(productError)}`)
      }
      
      console.log('Product created successfully:', newProduct)

      // Update organizations to include this product
      console.log('Updating organization assignments. Selected organization IDs:', formData.organizationIds)
      if ((formData.organizationIds || []).length > 0) {
        const updatePromises = (formData.organizationIds || []).map(async (orgId) => {
          const org = organizations.find(o => o.id === orgId)
          if (org) {
            const updatedProductNames = [...(org.product_names || []), formData.name]
            console.log(`Adding product to organization ${org.name}, new product_names:`, updatedProductNames)
            
            const { error } = await supabase
              .from('organizations')
              .update({ product_names: updatedProductNames })
              .eq('id', orgId)
              
            if (error) {
              console.error(`Error updating organization ${org.name}:`, error)
              throw new Error(`Failed to update organization ${org.name}: ${error.message || JSON.stringify(error)}`)
            }
          } else {
            console.warn(`Organization with ID ${orgId} not found`)
          }
        })
        await Promise.all(updatePromises)
        console.log('Successfully updated all organizations')
      } else {
        console.log('No organizations selected for this product')
      }

      showToast("Product created successfully", "success")
      setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
      setImageFile(null)
      setImagePreview(null)
      setShowCreateDialog(false)
      loadData()
    } catch (error) {
      console.error('Error creating product:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        errorObject: error
      })
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to create product: ${errorMessage}`, "error")
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsUpdating(true)
    try {
      // Handle image upload if file is selected  
      let imageUrl = editingProduct.image_url // Keep existing image if no new file
      if (imageFile) {
        const uploadedUrl = await uploadImageFile(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          showToast("Failed to upload image", "error")
          return
        }
      }

      console.log('Updating product in database with data:', {
        name: formData.name,
        type: formData.type || null,
        description: formData.description || null,
        image_url: imageUrl || null,
        productId: editingProduct.id
      })

      const { error: productError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          type: formData.type || null,
          description: formData.description || null,
          image_url: imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id)

      if (productError) {
        console.error('Product update error:', productError)
        throw new Error(`Failed to update product: ${productError.message || JSON.stringify(productError)}`)
      }

      console.log('Product updated successfully in database')

      // Update organization assignments
      try {
        console.log('Updating organization assignments for product:', formData.name)
        console.log('Selected organization IDs:', formData.organizationIds)
        
        // First, remove the product from all organizations
        const allOrgsWithProduct = organizations.filter(org => 
          org.product_names && org.product_names.includes(editingProduct.name)
        )

        console.log('Organizations that previously had this product:', allOrgsWithProduct.map(o => o.name))

        // Remove product from organizations that previously had it
        if (allOrgsWithProduct.length > 0) {
          const removePromises = allOrgsWithProduct.map(async (org) => {
            const updatedProductNames = org.product_names.filter(name => name !== editingProduct.name)
            console.log(`Removing product from ${org.name}, new product_names:`, updatedProductNames)
            
            const { error } = await supabase
              .from('organizations')
              .update({ product_names: updatedProductNames })
              .eq('id', org.id)
              
            if (error) {
              console.error(`Error removing product from organization ${org.name}:`, error)
              throw new Error(`Failed to remove product from ${org.name}: ${error.message || JSON.stringify(error)}`)
            }
          })

          await Promise.all(removePromises)
          console.log('Successfully removed product from all previous organizations')
        }

              // Add product to selected organizations
      if ((formData.organizationIds || []).length > 0) {
          const addPromises = (formData.organizationIds || []).map(async (orgId) => {
            const org = organizations.find(o => o.id === orgId)
            if (org) {
              const updatedProductNames = [...(org.product_names || []), formData.name]
              console.log(`Adding product to ${org.name}, new product_names:`, updatedProductNames)
              
              const { error } = await supabase
                .from('organizations')
                .update({ product_names: updatedProductNames })
                .eq('id', org.id)
                
              if (error) {
                console.error(`Error adding product to organization ${org.name}:`, error)
                throw new Error(`Failed to add product to ${org.name}: ${error.message || JSON.stringify(error)}`)
              }
            } else {
              console.warn(`Organization with ID ${orgId} not found`)
            }
          })

          await Promise.all(addPromises)
          console.log('Successfully added product to all selected organizations')
        }
      } catch (orgError) {
        console.error('Error in organization update process:', orgError)
        throw new Error(`Organization update failed: ${orgError instanceof Error ? orgError.message : JSON.stringify(orgError)}`)
      }

      showToast("Product updated successfully", "success")
      setEditingProduct(null)
      setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
      setImageFile(null)
      setImagePreview(null)
      loadData()
    } catch (error) {
      console.error('Error updating product:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        errorObject: error
      })
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to update product: ${errorMessage}`, "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    setProductToDelete({ id, name })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      // Remove product from all organizations first
      const orgsWithProduct = organizations.filter(org => 
        org.product_names && org.product_names.includes(productToDelete.name)
      )

      const updatePromises = orgsWithProduct.map(async (org) => {
        const updatedProductNames = org.product_names.filter(name => name !== productToDelete.name)
        await supabase
          .from('organizations')
          .update({ product_names: updatedProductNames })
          .eq('id', org.id)
      })

      await Promise.all(updatePromises)

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      showToast("Product deleted successfully", "success")
      setShowDeleteDialog(false)
      setProductToDelete(null)
      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast("Failed to delete product", "error")
    }
  }

  const startEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      type: product.type || '',
      description: product.description || '',
      image_url: product.image_url || '',
      organizationIds: organizations
        .filter(org => org.product_names && org.product_names.includes(product.name))
        .map(org => org.id) || []
    })
    setImagePreview(product.image_url)
    setImageFile(null)
  }

  const getProductOrganizations = (productName: string) => {
    return organizations.filter(org => 
      org.product_names && org.product_names.includes(productName)
    )
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
              <span className="font-bold">Products</span>{" "}
              <span className="italic">management.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage coal products and organization assignments</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {products.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Products Management */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Products & Organization Links</h2>
              
              <Dialog open={showCreateDialog} onOpenChange={(open) => {
                setShowCreateDialog(open)
                if (!open) {
                  setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
                  setImageFile(null)
                  setImagePreview(null)
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
                  <div className="p-6 pb-8 bg-white rounded-t-3xl">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-xl font-bold text-gray-900">Create New Product</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                      <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Duff, Peas, Nuts"
                            className="rounded-[16px]"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="type">Product Type</Label>
                          <Input
                            id="type"
                            value={formData.type || ''}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            placeholder="e.g., Coal, Anthracite"
                            className="rounded-[16px]"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Product description"
                            className="rounded-[16px]"
                          />
                        </div>

                        {/* Image Upload Section */}
                        <div>
                          <Label>Product Image</Label>
                          <div className="space-y-3">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="rounded-[16px]"
                            />

                            {imagePreview && (
                              <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                <Image
                                  src={imagePreview}
                                  alt="Preview"
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Link to Organizations</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                            {organizations.map((org) => (
                              <label key={org.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={(formData.organizationIds || []).includes(org.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        organizationIds: [...(formData.organizationIds || []), org.id]
                                      })
                                    } else {
                                      setFormData({
                                        ...formData,
                                        organizationIds: (formData.organizationIds || []).filter(id => id !== org.id)
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
                              'Create Product'
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => {
                            setShowCreateDialog(false)
                            setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
                            setImageFile(null)
                            setImagePreview(null)
                          }} className="rounded-full">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products List */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">All Products ({products.length})</span>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found. Create your first product to get started.
                </div>
              ) : (
                <div className="bg-white rounded-[16px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100">
                        <TableHead className="font-semibold text-gray-700">Image</TableHead>
                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="font-semibold text-gray-700">Type</TableHead>
                        <TableHead className="font-semibold text-gray-700">Description</TableHead>
                        <TableHead className="font-semibold text-gray-700">Organizations</TableHead>
                        <TableHead className="font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="border-gray-100 hover:bg-gray-50">
                          <TableCell>
                            {product.image_url ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.type || '-'}</TableCell>
                          <TableCell>{product.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getProductOrganizations(product.name).map((org) => (
                                <Badge key={org.id} variant="outline" className="text-xs">
                                  {org.name}
                                </Badge>
                              ))}
                              {getProductOrganizations(product.name).length === 0 && (
                                <span className="text-gray-400 text-sm">No organizations</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(product.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(product)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id, product.name)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

        {/* Edit Product Dialog */}
        <Dialog open={editingProduct !== null} onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null)
            setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
            setImageFile(null)
            setImagePreview(null)
          }
        }}>
          <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
            <div className="p-6 pb-8 bg-white rounded-t-3xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-gray-900">Edit Product</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Duff, Peas, Nuts"
                      className="rounded-[16px]"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-type">Product Type</Label>
                    <Input
                      id="edit-type"
                      value={formData.type || ''}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="e.g., Coal, Anthracite"
                      className="rounded-[16px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description"
                      className="rounded-[16px]"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <Label>Product Image</Label>
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="rounded-[16px]"
                      />

                      {imagePreview && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Link to Organizations</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {organizations.map((org) => (
                        <label key={org.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(formData.organizationIds || []).includes(org.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  organizationIds: [...(formData.organizationIds || []), org.id]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  organizationIds: (formData.organizationIds || []).filter(id => id !== org.id)
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
                        'Update Product'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setEditingProduct(null)
                      setFormData({ name: '', type: '', description: '', image_url: '', organizationIds: [] })
                      setImageFile(null)
                      setImagePreview(null)
                    }} className="rounded-full">
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
          <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0">
            <div className="p-6 pb-8 bg-white rounded-t-3xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-red-600">Delete Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete the product "{productToDelete?.name}"?
                </p>
                <p className="text-sm text-red-600">
                  This will remove the product from all organizations and cannot be undone.
                </p>
                <div className="flex gap-2 pt-4">
                  <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-full">
                    Delete Product
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 