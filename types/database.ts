export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  organization_id: string
  created_at: string
}

export interface OrganizationUser {
  id: string
  organization_id: string
  user_id: string
  role_id?: string
  full_name: string
  email: string
  cellphone?: string
  avatar_url?: string
  is_active: boolean
  invited_at: string
  joined_at?: string
  created_at: string
  updated_at: string
  role?: Role
  organization?: Organization
}

export interface CoalYard {
  id: string
  name: string
  code: string
  image_url?: string
  location?: string
  organization_id: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
}

export interface Delivery {
  id: string
  user_id: string
  coal_yard_id: string
  product_id: string
  delivery_date: string
  weighbridge_slip: string
  weight_tons: number
  notes?: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Pickup {
  id: string
  user_id: string
  coal_yard_id: string
  pickup_date: string
  weighbridge_slip?: string
  notes?: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface PickupContainer {
  id: string
  pickup_id: string
  container_number: string
  total_weight_tons: number
  notes?: string
  created_at: string
}

export interface PickupContainerProduct {
  id: string
  pickup_container_id: string
  product_id: string
  weight_tons: number
  created_at: string
}

export interface Stock {
  id: string
  coal_yard_id: string
  product_id: string
  current_weight_tons: number
  organization_id: string
  updated_at: string
}

export interface SuperAdmin {
  id: string
  user_id: string
  full_name: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Permission =
  | "manage_organization"
  | "manage_users"
  | "manage_roles"
  | "manage_coal_yards"
  | "manage_products"
  | "manage_deliveries"
  | "manage_pickups"
  | "manage_stock"
  | "view_reports"
