"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SlideOutMenu } from "@/components/ui/slide-out-menu"
import { Users, Building2, Shield, Plus, Menu, Warehouse, Package, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"

interface Stats {
  totalUsers: number
  totalOrganizations: number
  totalRoles: number
  totalProducts: number
  totalCoalYards: number
  activeUsers: number
}

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  product_names: string[]
  created_at: string
  updated_at: string
}

interface Product {
  id: string
  name: string
  type: string | null
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

interface CoalYard {
  id: string
  name: string
  code: string
  image_url: string | null
  location: string | null
  organization_ids: string[]
  created_at: string
  updated_at: string
}

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  created_at: string
  updated_at: string
}

interface User {
  id: string
  full_name: string | null
  email: string
  cellphone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Organization and role information from organization_users table
  organization_id?: string
  role_id?: string
  org_name?: string
  role_name?: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrganizations: 0,
    totalRoles: 0,
    totalProducts: 0,
    totalCoalYards: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>("organizations")
  
  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null)
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    description: '',
    website: ''
  })
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false)
  
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)
  const [productFormData, setProductFormData] = useState({
    name: '',
    type: '',
    description: '',
    image_url: '',
    organization_ids: [] as string[]
  })
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false)
  
  // Coal Yards state
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [showCreateYardDialog, setShowCreateYardDialog] = useState(false)
  const [editingYard, setEditingYard] = useState<CoalYard | null>(null)
  const [showDeleteYardDialog, setShowDeleteYardDialog] = useState(false)
  const [yardToDelete, setYardToDelete] = useState<{ id: string; name: string } | null>(null)
  const [yardFormData, setYardFormData] = useState({
    name: '',
    code: '',
    image_url: '',
    location: '',
    organization_ids: [] as string[]
  })
  const [isCreatingYard, setIsCreatingYard] = useState(false)
  const [isUpdatingYard, setIsUpdatingYard] = useState(false)
  
  // Roles state
  const [roles, setRoles] = useState<Role[]>([])
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    cellphone: '',
    password: '',
    organization_id: '',
    role_id: '',
    is_active: true
  })
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  
  // Delete loading states
  const [isDeletingOrg, setIsDeletingOrg] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [isDeletingYard, setIsDeletingYard] = useState(false)
  const [isDeletingRole, setIsDeletingRole] = useState(false)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  
  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // Slide-out menu state
  const [showSideMenu, setShowSideMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 4000)
  }

  // Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      console.log("Logging out user...")
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadOrganizations()
    loadProducts()
    loadCoalYards() 
    loadRoles()
    loadUsers()
  }, [])

  const loadStats = async () => {
    try {
      // Get organization users count
      const { data: orgUsers } = await supabase
        .from('organization_users')
        .select('id, is_active')

      // Get organizations count
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id')

      // Get roles count
      const { data: roles } = await supabase
        .from('roles')
        .select('id')

      // Get products count
      const { data: products } = await supabase
        .from('products')
        .select('id')

      // Get coal yards count
      const { data: coalYards } = await supabase
        .from('coal_yards')
        .select('id')

      setStats({
        totalUsers: orgUsers?.length || 0,
        totalOrganizations: organizations?.length || 0,
        totalRoles: roles?.length || 0,
        totalProducts: products?.length || 0,
        totalCoalYards: coalYards?.length || 0,
        activeUsers: orgUsers?.filter(u => u.is_active).length || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, description, website, product_names, created_at, updated_at')
        .order('name')

      if (error) throw error
      setOrganizations((data as unknown as Organization[]) || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
      showToast("Failed to load organizations", "error")
    }
  }

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts((data as unknown as Product[]) || [])
    } catch (error) {
      console.error('Error loading products:', error)
      showToast("Failed to load products", "error")
    }
  }

  const loadCoalYards = async () => {
    try {
      const { data, error } = await supabase
        .from('coal_yards')
        .select('*')
        .order('name')

      if (error) throw error
      setCoalYards((data as unknown as CoalYard[]) || [])
    } catch (error) {
      console.error('Error loading coal yards:', error)
      showToast("Failed to load coal yards", "error")
    }
  }

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error
      setRoles((data as unknown as Role[]) || [])
    } catch (error) {
      console.error('Error loading roles:', error)
      showToast("Failed to load roles", "error")
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          id,
          full_name,
          email,
          cellphone,
          avatar_url,
          is_active,
          created_at,
          updated_at,
          organization_id,
          role_id,
          org_name,
          role_name
        `)
        .order('full_name')

      if (error) throw error
      setUsers((data as unknown as User[]) || [])
    } catch (error) {
      console.error('Error loading users:', error)
      showToast("Failed to load users", "error")
    }
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingOrg(true)
    try {
      // Generate slug from name
      const slug = orgFormData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .trim()

      const { error } = await supabase
        .from('organizations')
        .insert([{
          name: orgFormData.name,
          slug: slug,
          description: orgFormData.description || null,
          website: orgFormData.website || null
        }])

      if (error) throw error

      showToast("Organization created successfully", "success")

      setOrgFormData({ name: '', description: '', website: '' })
      setShowCreateOrgDialog(false)
      loadOrganizations()
      loadStats()
    } catch (error) {
      console.error('Error creating organization:', error)
      showToast("Failed to create organization", "error")
    } finally {
      setIsCreatingOrg(false)
    }
  }

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrg) return

    setIsUpdatingOrg(true)
    try {
      // Generate slug from name
      const slug = orgFormData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .trim()

      const { error } = await supabase
        .from('organizations')
        .update({
          name: orgFormData.name,
          slug: slug,
          description: orgFormData.description || null,
          website: orgFormData.website || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOrg.id)

      if (error) throw error

      showToast("Organization updated successfully", "success")

      setEditingOrg(null)
      setOrgFormData({ name: '', description: '', website: '' })
      loadOrganizations()
    } catch (error) {
      console.error('Error updating organization:', error)
      showToast("Failed to update organization", "error")
    } finally {
      setIsUpdatingOrg(false)
    }
  }

  const startEditOrg = (org: Organization) => {
    setEditingOrg(org)
    setOrgFormData({
      name: org.name,
      description: org.description || '',
      website: org.website || ''
    })
  }

  const handleDeleteOrg = (id: string, name: string) => {
    setOrgToDelete({ id, name })
    setShowDeleteOrgDialog(true)
  }

  const confirmDeleteOrg = async () => {
    if (!orgToDelete) return

    setIsDeletingOrg(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgToDelete.id)

      if (error) throw error

      showToast("Organization deleted successfully", "success")
      setShowDeleteOrgDialog(false)
      setOrgToDelete(null)
      loadOrganizations()
      loadStats() // Refresh stats after deletion
    } catch (error) {
      console.error('Error deleting organization:', error)
      showToast("Failed to delete organization", "error")
    } finally {
      setIsDeletingOrg(false)
    }
  }

  // Product Creation Function
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingProduct(true)
    
    try {
      // Create the product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: productFormData.name,
          type: productFormData.type || null,
          description: productFormData.description || null,
          image_url: productFormData.image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (productError) throw productError

      // Add product to selected organizations
      for (const orgId of productFormData.organization_ids) {
        const org = organizations.find(o => o.id === orgId)
        if (org) {
          const updatedProductNames = [...(org.product_names || []), productFormData.name]
          
          const { error: orgError } = await supabase
            .from('organizations')
            .update({
              product_names: updatedProductNames,
              updated_at: new Date().toISOString()
            })
            .eq('id', orgId)
          
          if (orgError) throw orgError
        }
      }

      showToast("Product created successfully", "success")
      setShowCreateProductDialog(false)
      setProductFormData({ name: '', type: '', description: '', image_url: '', organization_ids: [] })
      loadProducts()
      loadOrganizations()
      loadStats()
    } catch (error) {
      console.error('Error creating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to create product: ${errorMessage}`, "error")
    } finally {
      setIsCreatingProduct(false)
    }
  }

  // Coal Yard Creation Function
  const handleCreateCoalYard = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingYard(true)
    
    try {
      console.log('Creating coal yard with data:', {
        name: yardFormData.name,
        code: yardFormData.code,
        image_url: yardFormData.image_url || null,
        location: yardFormData.location || null,
        organization_ids: yardFormData.organization_ids,
      })

      // Create the coal yard
      const { data: newYard, error: yardError } = await supabase
        .from('coal_yards')
        .insert({
          name: yardFormData.name,
          code: yardFormData.code,
          image_url: yardFormData.image_url || null,
          location: yardFormData.location || null,
          organization_ids: yardFormData.organization_ids
        })
        .select()
        .single()

      console.log('Supabase response:', { data: newYard, error: yardError })

      if (yardError) {
        console.error('Supabase error details:', yardError)
        throw yardError
      }

      showToast("Coal yard created successfully", "success")
      setShowCreateYardDialog(false)
      setYardFormData({ name: '', code: '', image_url: '', location: '', organization_ids: [] })
      loadCoalYards()
      loadStats()
    } catch (error) {
      console.error('Error creating coal yard:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      let errorMessage = 'Unknown error occurred'
      if (error && typeof error === 'object') {
        if ('message' in error && error.message) {
          errorMessage = error.message
        } else if ('details' in error && error.details) {
          errorMessage = error.details
        } else if ('hint' in error && error.hint) {
          errorMessage = error.hint
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      showToast(`Failed to create coal yard: ${errorMessage}`, "error")
    } finally {
      setIsCreatingYard(false)
    }
  }

  // Coal Yard Edit Functions
  const startEditYard = (yard: CoalYard) => {
    setEditingYard(yard)
    setYardFormData({
      name: yard.name,
      code: yard.code,
      image_url: yard.image_url || '',
      location: yard.location || '',
      organization_ids: yard.organization_ids || []
    })
  }

  const handleUpdateYard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingYard) return

    setIsUpdatingYard(true)
    try {
      console.log('Updating coal yard with data:', {
        name: yardFormData.name,
        code: yardFormData.code,
        image_url: yardFormData.image_url || null,
        location: yardFormData.location || null,
        organization_ids: yardFormData.organization_ids,
      })
      console.log('Editing yard ID:', editingYard.id)

      const { error } = await supabase
        .from('coal_yards')
        .update({
          name: yardFormData.name,
          code: yardFormData.code,
          image_url: yardFormData.image_url || null,
          location: yardFormData.location || null,
          organization_ids: yardFormData.organization_ids
        })
        .eq('id', editingYard.id)

      if (error) throw error

      showToast("Coal yard updated successfully", "success")
      setEditingYard(null)  
      setYardFormData({ name: '', code: '', image_url: '', location: '', organization_ids: [] })
      loadCoalYards()
    } catch (error) {
      console.error('Error updating coal yard:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      let errorMessage = 'Unknown error occurred'
      if (error && typeof error === 'object') {
        if ('message' in error && error.message) {
          errorMessage = error.message
        } else if ('details' in error && error.details) {
          errorMessage = error.details
        } else if ('hint' in error && error.hint) {
          errorMessage = error.hint
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      showToast(`Failed to update coal yard: ${errorMessage}`, "error")
    } finally {
      setIsUpdatingYard(false)
    }
  }

  const handleDeleteYard = (id: string, name: string) => {
    setYardToDelete({ id, name })
    setShowDeleteYardDialog(true)
  }

  const confirmDeleteYard = async () => {
    if (!yardToDelete) return

    setIsDeletingYard(true)
    try {
      const { error } = await supabase
        .from('coal_yards')
        .delete()
        .eq('id', yardToDelete.id)

      if (error) throw error

      showToast("Coal yard deleted successfully", "success")
      setShowDeleteYardDialog(false)
      setYardToDelete(null)
      loadCoalYards()
      loadStats()
    } catch (error) {
      console.error('Error deleting coal yard:', error)
      showToast("Failed to delete coal yard", "error")
    } finally {
      setIsDeletingYard(false)
    }
  }

  // Product Edit/Delete Functions
  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    // Get organization IDs for this product
    const productOrgs = organizations.filter(org => 
      org.product_names && org.product_names.includes(product.name)
    ).map(org => org.id)
    
    setProductFormData({
      name: product.name,
      type: product.type || '',
      description: product.description || '',
      image_url: product.image_url || '',
      organization_ids: productOrgs
    })
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsUpdatingProduct(true)
    try {
      // First update the product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: productFormData.name,
          type: productFormData.type || null,
          description: productFormData.description || null,
          image_url: productFormData.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id)

      if (productError) throw productError

      // Handle organization relationships if product name changed
      if (editingProduct.name !== productFormData.name) {
        // Remove old product name from all organizations
        for (const org of organizations) {
          if (org.product_names && org.product_names.includes(editingProduct.name)) {
            const updatedProductNames = org.product_names.filter(name => name !== editingProduct.name)
            if (productFormData.organization_ids?.includes(org.id)) {
              updatedProductNames.push(productFormData.name)
            }
            
            const { error: orgError } = await supabase
              .from('organizations')
              .update({
                product_names: updatedProductNames,
                updated_at: new Date().toISOString()
              })
              .eq('id', org.id)
            
            if (orgError) throw orgError
          }
        }
        
        // Add new product name to selected organizations
        for (const orgId of productFormData.organization_ids || []) {
          const org = organizations.find(o => o.id === orgId)
          if (org && (!org.product_names || !org.product_names.includes(productFormData.name))) {
            const updatedProductNames = [...(org.product_names || []), productFormData.name]
            
            const { error: orgError } = await supabase
              .from('organizations')
              .update({
                product_names: updatedProductNames,
                updated_at: new Date().toISOString()
              })
              .eq('id', orgId)
            
            if (orgError) throw orgError
          }
        }
      } else {
        // Product name didn't change, just update organization relationships
        // Remove product from organizations that are no longer selected
        const currentOrgIds = organizations
          .filter(org => org.product_names && org.product_names.includes(productFormData.name))
          .map(org => org.id)
        
        for (const orgId of currentOrgIds) {
          if (!productFormData.organization_ids?.includes(orgId)) {
            const org = organizations.find(o => o.id === orgId)
            if (org) {
              const updatedProductNames = org.product_names.filter(name => name !== productFormData.name)
              
              const { error: orgError } = await supabase
                .from('organizations')
                .update({
                  product_names: updatedProductNames,
                  updated_at: new Date().toISOString()
                })
                .eq('id', orgId)
              
              if (orgError) throw orgError
            }
          }
        }
        
        // Add product to newly selected organizations
        for (const orgId of productFormData.organization_ids || []) {
          if (!currentOrgIds.includes(orgId)) {
            const org = organizations.find(o => o.id === orgId)
            if (org) {
              const updatedProductNames = [...(org.product_names || []), productFormData.name]
              
              const { error: orgError } = await supabase
                .from('organizations')
                .update({
                  product_names: updatedProductNames,
                  updated_at: new Date().toISOString()
                })
                .eq('id', orgId)
              
              if (orgError) throw orgError
            }
          }
        }
      }

      showToast("Product updated successfully", "success")
      setEditingProduct(null)
      setProductFormData({ name: '', type: '', description: '', image_url: '', organization_ids: [] })
      loadProducts()
      loadOrganizations() // Reload organizations to reflect changes
    } catch (error) {
      console.error('Error updating product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showToast(`Failed to update product: ${errorMessage}`, "error")
    } finally {
      setIsUpdatingProduct(false)
    }
  }

  const handleDeleteProduct = (id: string, name: string) => {
    setProductToDelete({ id, name })
    setShowDeleteProductDialog(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    setIsDeletingProduct(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      showToast("Product deleted successfully", "success")
      setShowDeleteProductDialog(false)
      setProductToDelete(null)
      loadProducts()
      loadStats()
    } catch (error) {
      console.error('Error deleting product:', error)
      showToast("Failed to delete product", "error")
    } finally {
      setIsDeletingProduct(false)
    }
  }

  // Role Edit/Delete Functions
  const startEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    })
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    setIsUpdatingRole(true)
    try {
      const { error } = await supabase
        .from('roles')
        .update({
          name: roleFormData.name,
          description: roleFormData.description || null,
          permissions: roleFormData.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRole.id)

      if (error) throw error

      showToast("Role updated successfully", "success")
      setEditingRole(null)
      setRoleFormData({ name: '', description: '', permissions: [] })
      loadRoles()
    } catch (error) {
      console.error('Error updating role:', error)
      showToast("Failed to update role", "error")
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleDeleteRole = (id: string, name: string) => {
    setRoleToDelete({ id, name })
    setShowDeleteRoleDialog(true)
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    setIsDeletingRole(true)
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleToDelete.id)

      if (error) throw error

      showToast("Role deleted successfully", "success")
      setShowDeleteRoleDialog(false)
      setRoleToDelete(null)
      loadRoles()
      loadStats()
    } catch (error) {
      console.error('Error deleting role:', error)
      showToast("Failed to delete role", "error")
    } finally {
      setIsDeletingRole(false)
    }
  }

  // User Edit/Delete Functions
  const startEditUser = (user: User) => {
    setEditingUser(user)
    setUserFormData({
      full_name: user.full_name || '',
      email: user.email,
      cellphone: user.cellphone || '',
      password: '', // Empty for edit mode - we don't show passwords for security
      organization_id: user.organization_id || '',
      role_id: user.role_id || '',
      is_active: user.is_active
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setIsUpdatingUser(true)
    try {
      const { error } = await supabase
        .from('organization_users')
        .update({
          full_name: userFormData.full_name || null,
          email: userFormData.email,
          cellphone: userFormData.cellphone || null,
          organization_id: userFormData.organization_id,
          role_id: userFormData.role_id,
          is_active: userFormData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (error) throw error

      showToast("User updated successfully", "success")
      setEditingUser(null)
      setUserFormData({ 
        full_name: '', 
        email: '', 
        cellphone: '', 
        password: '',
        organization_id: '',
        role_id: '',
        is_active: true 
      })
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      showToast("Failed to update user", "error")
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)
    
    try {
      console.log('Creating user with admin API:', {
        full_name: userFormData.full_name,
        email: userFormData.email,
        cellphone: userFormData.cellphone || null,
        organization_id: userFormData.organization_id,
        role_id: userFormData.role_id,
        is_active: userFormData.is_active,
        password: '[HIDDEN]'
      })

      // Create user using admin API route that bypasses email verification
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userFormData.email,
          password: userFormData.password,
          full_name: userFormData.full_name,
          organization_id: userFormData.organization_id,
          role_id: userFormData.role_id,
          cellphone: userFormData.cellphone || null,
          is_active: userFormData.is_active
        }),
      })

      const result = await response.json()
      console.log('Admin API response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }

      console.log('User created successfully via admin API:', result.user)

      showToast("User created successfully", "success")
      setShowCreateUserDialog(false)
      setUserFormData({ 
        full_name: '', 
        email: '', 
        cellphone: '', 
        password: '',
        organization_id: '',
        role_id: '',
        is_active: true 
      })
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Error creating user:', error)
      
      let errorMessage = 'Unknown error occurred'
      if (error && typeof error === 'object') {
        if ('message' in error && error.message) {
          errorMessage = error.message
        } else if ('details' in error && error.details) {
          errorMessage = error.details
        } else if ('hint' in error && error.hint) {
          errorMessage = error.hint
        } else if ('code' in error && error.code) {
          errorMessage = `Database error (${error.code})`
        } else {
          errorMessage = JSON.stringify(error)
        }
      }
      
      showToast(`Failed to create user: ${errorMessage}`, "error")
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleDeleteUser = (id: string, name: string) => {
    setUserToDelete({ id, name })
    setShowDeleteUserDialog(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeletingUser(true)
    try {
      const { error } = await supabase
        .from('organization_users')
        .delete()
        .eq('id', userToDelete.id)

      if (error) throw error

      showToast("User deleted successfully", "success")
      setShowDeleteUserDialog(false)
      setUserToDelete(null)
      loadUsers()
      loadStats()
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast("Failed to delete user", "error")
    } finally {
      setIsDeletingUser(false)
    }
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
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setShowSideMenu(true)}>
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
              <span className="font-bold">Admin</span>{" "}
              <span className="italic">dashboard.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">Manage organizations, roles, and users</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">System:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  Administrative Control
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Statistics Overview */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">System Overview</h2>
            </div>

            {/* Stats Grid */}
            <div className="bg-gray-50 p-4 rounded-[20px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Organizations</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalOrganizations}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Products</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalProducts}
                      </p>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Coal Yards</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalCoalYards}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Warehouse className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Roles</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalRoles}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></span>
                        ) : stats.totalUsers}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Sections */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Management</h2>
            </div>

            <div className="flex space-x-8 mb-8">
              <button
                onClick={() => setActiveTab("organizations")}
                className={`text-xl pb-1 transition-all ${
                  activeTab === "organizations"
                    ? "font-bold text-gray-800 border-b-2 border-gray-800"
                    : "font-light text-gray-500 hover:text-gray-700"
                }`}
              >
                Organizations
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`text-xl pb-1 transition-all ${
                  activeTab === "users"
                    ? "font-bold text-gray-800 border-b-2 border-gray-800"
                    : "font-light text-gray-500 hover:text-gray-700"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab("coal-yards")}
                className={`text-xl pb-1 transition-all ${
                  activeTab === "coal-yards"
                    ? "font-bold text-gray-800 border-b-2 border-gray-800"
                    : "font-light text-gray-500 hover:text-gray-700"
                }`}
              >
                Coal Yards
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`text-xl pb-1 transition-all ${
                  activeTab === "products"
                    ? "font-bold text-gray-800 border-b-2 border-gray-800"
                    : "font-light text-gray-500 hover:text-gray-700"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`text-xl pb-1 transition-all ${
                  activeTab === "roles"
                    ? "font-bold text-gray-800 border-b-2 border-gray-800"
                    : "font-light text-gray-500 hover:text-gray-700"
                }`}
              >
                Roles
              </button>
                    </div>

            {activeTab === "organizations" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Organizations</h3>
                  <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col h-full w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Create New Organization</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 p-6">
                          <form onSubmit={handleCreateOrg} className="space-y-4">
                        <div>
                          <Label htmlFor="org-name">Organization Name</Label>
                          <Input
                            id="org-name"
                            value={orgFormData.name}
                            onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                            placeholder="Enter organization name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="org-description">Description</Label>
                          <Input
                            id="org-description"
                            value={orgFormData.description}
                            onChange={(e) => setOrgFormData({ ...orgFormData, description: e.target.value })}
                            placeholder="Enter description (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="org-website">Website</Label>
                          <Input
                            id="org-website"
                            value={orgFormData.website}
                            onChange={(e) => setOrgFormData({ ...orgFormData, website: e.target.value })}
                            placeholder="Enter website URL (optional)"
                          />
                        </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isCreatingOrg} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                {isCreatingOrg ? "Creating..." : "Create Organization"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateOrgDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>{org.description || '-'}</TableCell>
                          <TableCell>
                            {org.website ? (
                              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {org.website}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditOrg(org)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOrg(org.id, org.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {organizations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No organizations found. Create your first organization above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Edit Organization Dialog */}
                <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col h-full w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit Organization</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <form onSubmit={handleUpdateOrg} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-org-name">Organization Name</Label>
                        <Input
                          id="edit-org-name"
                          value={orgFormData.name}
                          onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-org-description">Description</Label>
                        <Input
                          id="edit-org-description"
                          value={orgFormData.description}
                          onChange={(e) => setOrgFormData({ ...orgFormData, description: e.target.value })}
                          placeholder="Enter description (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-org-website">Website</Label>
                        <Input
                          id="edit-org-website"
                          value={orgFormData.website}
                          onChange={(e) => setOrgFormData({ ...orgFormData, website: e.target.value })}
                          placeholder="Enter website URL (optional)"
                        />
                      </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isUpdatingOrg} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                              {isUpdatingOrg ? "Updating..." : "Update Organization"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingOrg(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Organization Confirmation Dialog */}
                <Dialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
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
                              You're about to delete <span className="font-medium">"{orgToDelete?.name}"</span>. 
                              <span className="block mt-2">This action cannot be undone.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteOrgDialog(false)}
                            className="flex-1 rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmDeleteOrg}
                            disabled={isDeletingOrg}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            {isDeletingOrg ? "Deleting..." : "Delete Organization"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {activeTab === "products" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Products</h3>
                  <Dialog open={showCreateProductDialog} onOpenChange={setShowCreateProductDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col h-full w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Create New Product</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 p-6">
                          <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div>
                          <Label htmlFor="product-name">Product Name</Label>
                          <Input
                            id="product-name"
                            value={productFormData.name}
                            onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                            placeholder="Enter product name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-type">Type</Label>
                          <Input
                            id="product-type"
                            value={productFormData.type}
                            onChange={(e) => setProductFormData({ ...productFormData, type: e.target.value })}
                            placeholder="Enter product type (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-description">Description</Label>
                          <Input
                            id="product-description"
                            value={productFormData.description}
                            onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                            placeholder="Enter description (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="product-image">Image URL</Label>
                          <Input
                            id="product-image"
                            value={productFormData.image_url}
                            onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                            placeholder="Enter image URL (optional)"
                          />
                        </div>
                        <div>
                          <Label>Organizations</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {organizations.map((org) => (
                              <div key={org.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`product-org-${org.id}`}
                                  checked={productFormData.organization_ids?.includes(org.id) || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setProductFormData({
                                        ...productFormData,
                                        organization_ids: [...productFormData.organization_ids, org.id]
                                      })
                                    } else {
                                      setProductFormData({
                                        ...productFormData,
                                        organization_ids: productFormData.organization_ids.filter(id => id !== org.id)
                                      })
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`product-org-${org.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {org.name}
                                </Label>
                              </div>
                            ))}
                            {organizations.length === 0 && (
                              <p className="text-sm text-gray-500">No organizations available</p>
                            )}
                          </div>
                        </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isCreatingProduct} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                {isCreatingProduct ? "Creating..." : "Create Product"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateProductDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Organizations</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {product.name}
                    </span>
                          </TableCell>
                          <TableCell>{product.type || '-'}</TableCell>
                          <TableCell>{product.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {organizations.filter(org => 
                                org.product_names && org.product_names.includes(product.name)
                              ).map((org) => (
                                <span key={org.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {org.name}
                    </span>
                              ))}
                              {organizations.filter(org => 
                                org.product_names && org.product_names.includes(product.name)
                              ).length === 0 && (
                                <span className="text-gray-400 text-sm">No organizations</span>
                              )}
                  </div>
                          </TableCell>
                          <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                  <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditProduct(product)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {products.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No products found. Create your first product above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                      </div>

                {/* Edit Product Dialog */}
                <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col h-full w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit Product</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-product-name">Product Name</Label>
                        <Input
                          id="edit-product-name"
                          value={productFormData.name}
                          onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-type">Type</Label>
                        <Input
                          id="edit-product-type"
                          value={productFormData.type}
                          onChange={(e) => setProductFormData({ ...productFormData, type: e.target.value })}
                          placeholder="Enter product type (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-description">Description</Label>
                        <Input
                          id="edit-product-description"
                          value={productFormData.description}
                          onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                          placeholder="Enter description (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-product-image">Image URL</Label>
                        <Input
                          id="edit-product-image"
                          value={productFormData.image_url}
                          onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                          placeholder="Enter image URL (optional)"
                        />
                      </div>
                      <div>
                        <Label>Organizations</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {organizations.map((org) => (
                            <div key={org.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-product-org-${org.id}`}
                                checked={productFormData.organization_ids?.includes(org.id) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setProductFormData({
                                      ...productFormData,
                                      organization_ids: [...productFormData.organization_ids, org.id]
                                    })
                                  } else {
                                    setProductFormData({
                                      ...productFormData,
                                      organization_ids: productFormData.organization_ids.filter(id => id !== org.id)
                                    })
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`edit-product-org-${org.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {org.name}
                              </Label>
                            </div>
                          ))}
                          {organizations.length === 0 && (
                            <p className="text-sm text-gray-500">No organizations available</p>
                          )}
                        </div>
                      </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isUpdatingProduct} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                              {isUpdatingProduct ? "Updating..." : "Update Product"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Product Confirmation Dialog */}
                <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Delete Product</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Are you sure you want to delete this product?
                            </h3>
                            <p className="text-gray-600">
                              You're about to delete <span className="font-medium">"{productToDelete?.name}"</span>. 
                              <span className="block mt-2">This action cannot be undone.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteProductDialog(false)}
                            className="flex-1 rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmDeleteProduct}
                            disabled={isDeletingProduct}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            {isDeletingProduct ? "Deleting..." : "Delete Product"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {activeTab === "coal-yards" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Coal Yards</h3>
                  <Dialog open={showCreateYardDialog} onOpenChange={setShowCreateYardDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Coal Yard
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col h-full w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Create New Coal Yard</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 p-6">
                          <form onSubmit={handleCreateCoalYard} className="space-y-4">
                        <div>
                          <Label htmlFor="yard-name">Coal Yard Name</Label>
                          <Input
                            id="yard-name"
                            value={yardFormData.name}
                            onChange={(e) => setYardFormData({ ...yardFormData, name: e.target.value })}
                            placeholder="Enter coal yard name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="yard-code">Code</Label>
                          <Input
                            id="yard-code"
                            value={yardFormData.code}
                            onChange={(e) => setYardFormData({ ...yardFormData, code: e.target.value })}
                            placeholder="Enter yard code"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="yard-image">Image URL</Label>
                          <Input
                            id="yard-image"
                            value={yardFormData.image_url}
                            onChange={(e) => setYardFormData({ ...yardFormData, image_url: e.target.value })}
                            placeholder="Enter image URL (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="yard-location">Location</Label>
                          <Input
                            id="yard-location"
                            value={yardFormData.location}
                            onChange={(e) => setYardFormData({ ...yardFormData, location: e.target.value })}
                            placeholder="Enter location (optional)"
                          />
                        </div>
                        <div>
                          <Label>Organizations</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {organizations.map((org) => (
                              <div key={org.id} className="flex items-center space-x-2">
                                                              <Checkbox
                                id={`yard-org-${org.id}`}
                                checked={yardFormData.organization_ids?.includes(org.id) || false}
                                                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setYardFormData({
                                      ...yardFormData,
                                      organization_ids: [...(yardFormData.organization_ids || []), org.id]
                                    })
                                  } else {
                                    setYardFormData({
                                      ...yardFormData,
                                      organization_ids: (yardFormData.organization_ids || []).filter(id => id !== org.id)
                                    })
                                  }
                                }}
                                />
                                <Label
                                  htmlFor={`yard-org-${org.id}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {org.name}
                                </Label>
                              </div>
                            ))}
                            {organizations.length === 0 && (
                              <p className="text-sm text-gray-500">No organizations available</p>
                            )}
                          </div>
                        </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isCreatingYard} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                {isCreatingYard ? "Creating..." : "Create Coal Yard"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateYardDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Organizations</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coalYards.map((yard) => (
                        <TableRow key={yard.id}>
                          <TableCell>
                            {yard.image_url ? (
                              <img 
                                src={yard.image_url} 
                                alt={yard.name}
                                className="w-12 h-12 object-cover rounded-lg"
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
                              {yard.organization_ids && Array.isArray(yard.organization_ids) && yard.organization_ids.length > 0 && 
                                organizations.filter(org => yard.organization_ids?.includes(org.id)).map((org) => (
                                  <span key={org.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {org.name}
                                  </span>
                                ))
                              }
                              {(!yard.organization_ids || !Array.isArray(yard.organization_ids) || yard.organization_ids.length === 0) && (
                                <span className="text-gray-400 text-sm">No organizations</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(yard.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditYard(yard)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                  </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteYard(yard.id, yard.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {coalYards.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No coal yards found. Create your first coal yard above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Edit Coal Yard Dialog */}
                <Dialog open={!!editingYard} onOpenChange={() => setEditingYard(null)}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col h-full w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit Coal Yard</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <form onSubmit={handleUpdateYard} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-yard-name">Coal Yard Name</Label>
                        <Input
                          id="edit-yard-name"
                          value={yardFormData.name}
                          onChange={(e) => setYardFormData({ ...yardFormData, name: e.target.value })}
                          placeholder="Enter coal yard name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-yard-code">Code</Label>
                        <Input
                          id="edit-yard-code"
                          value={yardFormData.code}
                          onChange={(e) => setYardFormData({ ...yardFormData, code: e.target.value })}
                          placeholder="Enter yard code"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-yard-image">Image URL</Label>
                        <Input
                          id="edit-yard-image"
                          value={yardFormData.image_url}
                          onChange={(e) => setYardFormData({ ...yardFormData, image_url: e.target.value })}
                          placeholder="Enter image URL (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-yard-location">Location</Label>
                        <Input
                          id="edit-yard-location"
                          value={yardFormData.location}
                          onChange={(e) => setYardFormData({ ...yardFormData, location: e.target.value })}
                          placeholder="Enter location (optional)"
                        />
                      </div>
                      <div>
                        <Label>Organizations</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {organizations.map((org) => (
                            <div key={org.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-yard-org-${org.id}`}
                                checked={yardFormData.organization_ids?.includes(org.id) || false}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setYardFormData({
                                      ...yardFormData,
                                      organization_ids: [...(yardFormData.organization_ids || []), org.id]
                                    })
                                  } else {
                                    setYardFormData({
                                      ...yardFormData,
                                      organization_ids: (yardFormData.organization_ids || []).filter(id => id !== org.id)
                                    })
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`edit-yard-org-${org.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {org.name}
                              </Label>
                </div>
              ))}
                          {organizations.length === 0 && (
                            <p className="text-sm text-gray-500">No organizations available</p>
                          )}
            </div>
                      </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isUpdatingYard} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                              {isUpdatingYard ? "Updating..." : "Update Coal Yard"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingYard(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Coal Yard Confirmation Dialog */}
                <Dialog open={showDeleteYardDialog} onOpenChange={setShowDeleteYardDialog}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
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
                              You're about to delete <span className="font-medium">"{yardToDelete?.name}"</span>. 
                              <span className="block mt-2">This action cannot be undone.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteYardDialog(false)}
                            className="flex-1 rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmDeleteYard}
                            disabled={isDeletingYard}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            {isDeletingYard ? "Deleting..." : "Delete Coal Yard"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {activeTab === "roles" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Roles</h3>
                  <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col h-full w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Create New Role</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 p-6">
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            showToast("Role creation functionality coming soon", "success")
                          }} className="space-y-4">
                        <div>
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input
                            id="role-name"
                            value={roleFormData.name}
                            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                            placeholder="Enter role name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role-description">Description</Label>
                          <Input
                            id="role-description"
                            value={roleFormData.description}
                            onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                            placeholder="Enter description (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role-permissions">Permissions</Label>
                          <Input
                            id="role-permissions"
                            value={roleFormData.permissions.join(', ')}
                            onChange={(e) => setRoleFormData({ 
                              ...roleFormData, 
                              permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                            })}
                            placeholder="Enter permissions separated by commas (optional)"
                          />
                        </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isCreatingRole} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                {isCreatingRole ? "Creating..." : "Create Role"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || '-'}</TableCell>
                          <TableCell>
                            {role.permissions && role.permissions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.map((permission, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditRole(role)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {roles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No roles found. Create your first role above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Edit Role Dialog */}
                <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col h-full w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit Role</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                    <form onSubmit={handleUpdateRole} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-role-name">Role Name</Label>
                        <Input
                          id="edit-role-name"
                          value={roleFormData.name}
                          onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                          placeholder="Enter role name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-role-description">Description</Label>
                        <Input
                          id="edit-role-description"
                          value={roleFormData.description}
                          onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                          placeholder="Enter description (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-role-permissions">Permissions</Label>
                        <Input
                          id="edit-role-permissions"
                          value={roleFormData.permissions.join(', ')}
                          onChange={(e) => setRoleFormData({ 
                            ...roleFormData, 
                            permissions: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                          })}
                          placeholder="Enter permissions separated by commas (optional)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={isUpdatingRole} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                          {isUpdatingRole ? "Updating..." : "Update Role"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingRole(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Role Confirmation Dialog */}
                <Dialog open={showDeleteRoleDialog} onOpenChange={setShowDeleteRoleDialog}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Delete Role</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Shield className="w-8 h-8 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Are you sure you want to delete this role?
                            </h3>
                            <p className="text-gray-600">
                              You're about to delete <span className="font-medium">"{roleToDelete?.name}"</span>. 
                              <span className="block mt-2">This action cannot be undone.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteRoleDialog(false)}
                            className="flex-1 rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmDeleteRole}
                            disabled={isDeletingRole}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            {isDeletingRole ? "Deleting..." : "Delete Role"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {activeTab === "users" && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">Users</h3>
                  <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col h-full w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Create New User</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 p-6">
                          <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                          <Label htmlFor="user-name">Full Name</Label>
                          <Input
                            id="user-name"
                            value={userFormData.full_name}
                            onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-email">Email</Label>
                          <Input
                            id="user-email"
                            type="email"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-cellphone">Cellphone</Label>
                          <Input
                            id="user-cellphone"
                            value={userFormData.cellphone}
                            onChange={(e) => setUserFormData({ ...userFormData, cellphone: e.target.value })}
                            placeholder="Enter cellphone number (optional)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-password">Password</Label>
                          <Input
                            id="user-password"
                            type="password"
                            value={userFormData.password}
                            onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                            placeholder="Enter password"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-organization">Organization</Label>
                          <select
                            id="user-organization"
                            value={userFormData.organization_id}
                            onChange={(e) => setUserFormData({ ...userFormData, organization_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          >
                            <option value="">Select an organization</option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="user-role">Role</Label>
                          <select
                            id="user-role"
                            value={userFormData.role_id}
                            onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                          >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="user-active"
                            checked={userFormData.is_active}
                            onCheckedChange={(checked) => setUserFormData({ ...userFormData, is_active: !!checked })}
                          />
                          <Label htmlFor="user-active" className="text-sm font-normal cursor-pointer">
                            User is active
                          </Label>
                        </div>
                            <div className="flex gap-2">
                              <Button type="submit" disabled={isCreatingUser} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                                {isCreatingUser ? "Creating..." : "Create User"}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowCreateUserDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Cellphone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.org_name || '-'}</TableCell>
                          <TableCell>{user.role_name || '-'}</TableCell>
                          <TableCell>{user.cellphone || '-'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditUser(user)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No users found. Create your first user above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Edit User Dialog */}
                <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col h-full w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Edit User</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-user-name">Full Name</Label>
                        <Input
                          id="edit-user-name"
                          value={userFormData.full_name}
                          onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-user-email">Email</Label>
                        <Input
                          id="edit-user-email"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-user-cellphone">Cellphone</Label>
                        <Input
                          id="edit-user-cellphone"
                          value={userFormData.cellphone}
                          onChange={(e) => setUserFormData({ ...userFormData, cellphone: e.target.value })}
                          placeholder="Enter cellphone number (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-user-organization">Organization</Label>
                        <select
                          id="edit-user-organization"
                          value={userFormData.organization_id}
                          onChange={(e) => setUserFormData({ ...userFormData, organization_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        >
                          <option value="">Select an organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="edit-user-role">Role</Label>
                        <select
                          id="edit-user-role"
                          value={userFormData.role_id}
                          onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        >
                          <option value="">Select a role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-user-active"
                          checked={userFormData.is_active}
                          onCheckedChange={(checked) => setUserFormData({ ...userFormData, is_active: !!checked })}
                        />
                        <Label htmlFor="edit-user-active" className="text-sm font-normal cursor-pointer">
                          User is active
                        </Label>
                      </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isUpdatingUser} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                              {isUpdatingUser ? "Updating..." : "Update User"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete User Confirmation Dialog */}
                <Dialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
                  <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                    <div className="flex flex-col w-full">
                      <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                        <DialogTitle className="text-xl font-bold text-gray-800">Delete User</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Are you sure you want to delete this user?
                            </h3>
                            <p className="text-gray-600">
                              You're about to delete <span className="font-medium">"{userToDelete?.name}"</span>. 
                              <span className="block mt-2">This action cannot be undone.</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteUserDialog(false)}
                            className="flex-1 rounded-full"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmDeleteUser}
                            disabled={isDeletingUser}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          >
                            {isDeletingUser ? "Deleting..." : "Delete User"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Slide-out Menu */}
      <SlideOutMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
} 