"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Menu, Plus, ChevronDown, Search } from "lucide-react"
import { Calendar1, Weight, Box, Edit, DocumentDownload, DocumentText, Archive, Refresh, MoreSquare, Setting4, CloseSquare, Trash, ArrowRight } from "iconsax-reactjs"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { Stock, Product, CoalYard } from "@/types/database"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SlideOutMenu } from "@/components/ui/slide-out-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Remove this import since we're not using Tabs components anymore

interface DashboardStats {
  totalDeliveries: number
  totalPickups: number
  totalDeliveryWeight: number
  totalPickupWeight: number
  totalStock: number
}

interface StockWithDetails extends Stock {
  product: Product
  coal_yard: CoalYard
}

export default function DashboardPage() {
  const { user, superAdmin, loading: authLoading, hasPermission } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [stockData, setStockData] = useState<StockWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYardFilter, setSelectedYardFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [recordType, setRecordType] = useState<'delivery' | 'pickup'>('delivery')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showDropdownModal, setShowDropdownModal] = useState(false)
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [weeklyActivityData, setWeeklyActivityData] = useState<Record<string, { deliveries: any[]; pickups: any[] }>>(
    {},
  )
  const [deliveryData, setDeliveryData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"deliveries" | "pickups">("deliveries")
  const [pickupData, setPickupData] = useState<any[]>([])
  const [stockActivityTab, setStockActivityTab] = useState<"stock" | "activity">("stock")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [showSideMenu, setShowSideMenu] = useState(false)
  const [grokSummary, setGrokSummary] = useState<string>("")
  const [loadingGrokSummary, setLoadingGrokSummary] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
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

  // Add this near the top of the component, after the existing useEffect
  // useEffect(() => {
  //   // This will refresh the data when the component is focused (e.g., when navigating back from deliveries)
  //   const handleFocus = () => {
  //     if (!authLoading && user) {
  //       loadDashboardData()
  //       loadCoalYards()
  //       loadWeeklyActivityData()
  //       loadDeliveryData()
  //       loadPickupData()
  //     }
  //   }

  //   window.addEventListener("focus", handleFocus)

  //   return () => {
  //     window.removeEventListener("focus", handleFocus)
  //   }
  // }, [authLoading, user])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
        return
      }
      loadDashboardData()
      loadCoalYards()
      loadWeeklyActivityData()
      loadDeliveryData()
      loadPickupData()
      loadAllProducts()
    }
  }, [authLoading, user, selectedYardFilter, dateRange])

  // Generate real-time Grok analysis when ANY operational activity occurs
  useEffect(() => {
    if (deliveryData.length > 0 || pickupData.length > 0) {
      generateGrokSummary()
    }
  }, [deliveryData, pickupData, stats, selectedYardFilter, dateRange])

  // Also trigger when specific data points change (for real-time monitoring)
  useEffect(() => {
    const hasAnyActivity = deliveryData.length > 0 || pickupData.length > 0
    const hasAnyEdits = [...deliveryData, ...pickupData].some(record => 
      record.audit_logs && record.audit_logs.length > 0
    )
    
    if (hasAnyActivity || hasAnyEdits) {
      // Small delay to ensure all data is loaded
      const timeoutId = setTimeout(generateGrokSummary, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [
    deliveryData.map(d => d.id).join(','), // Re-trigger if delivery IDs change
    pickupData.map(p => p.id).join(','),   // Re-trigger if pickup IDs change
    deliveryData.map(d => d.audit_logs?.length || 0).join(','), // Re-trigger if edits change
    pickupData.map(p => p.audit_logs?.length || 0).join(',')    // Re-trigger if edits change
  ])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-dropdown="export"]')) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const loadDashboardData = async () => {
    if (!user?.organization?.id) return

    try {
      setLoading(true)

      // Use date range for filtering
      const startDate = dateRange.start
      const endDate = dateRange.end

      let deliveriesQuery = supabase
        .from("deliveries")
        .select("weight_tons, coal_yard_id")
        .eq("organization_id", user.organization.id)
        .gte("delivery_date", startDate)
        .lte("delivery_date", endDate)

      let pickupsQuery = supabase
        .from("pickup")
        .select("weight_tons, coal_yard_id")
        .eq("organization_id", user.organization.id)
        .gte("pickup_date", startDate)
        .lte("pickup_date", endDate)

      let stockQuery = supabase
        .from("stock")
        .select("*")
        .eq("organization_id", user.organization.id)

      // Apply coal yard filter if not "all"
      if (selectedYardFilter !== "all") {
        deliveriesQuery = deliveriesQuery.eq("coal_yard_id", selectedYardFilter)
        pickupsQuery = pickupsQuery.eq("coal_yard_id", selectedYardFilter)
        stockQuery = stockQuery.eq("coal_yard_id", selectedYardFilter)
      }

      const [deliveries, pickups, stock] = await Promise.all([deliveriesQuery, pickupsQuery, stockQuery])

      // Get product and coal yard details separately to populate stock data
      const productIds = [...new Set(stock.data?.map(s => s.product_id) || [])]
      const coalYardIds = [...new Set(stock.data?.map(s => s.coal_yard_id) || [])]

      const [products, coalYardsData] = await Promise.all([
        supabase.from("products").select("*").in("id", productIds),
        supabase.from("coal_yards").select("*").in("id", coalYardIds)
      ])

      // Combine stock data with product and coal yard details
      const stockWithDetails = stock.data?.map(s => ({
        ...s,
        product: products.data?.find(p => p.id === s.product_id) || null,
        coal_yard: coalYardsData.data?.find(cy => cy.id === s.coal_yard_id) || null
      })) || []

      // Calculate stats
      const totalDeliveryWeight = deliveries.data?.reduce((sum, d) => sum + Number(d.weight_tons), 0) || 0
      const totalPickupWeight = pickups.data?.reduce((sum, p) => sum + Number(p.weight_tons), 0) || 0
      const totalStock = stock.data?.reduce((sum, s) => sum + Number(s.current_weight_tons), 0) || 0

      setStats({
        totalDeliveries: deliveries.data?.length || 0,
        totalPickups: pickups.data?.length || 0,
        totalDeliveryWeight,
        totalPickupWeight,
        totalStock,
      })

      setStockData(stockWithDetails as any)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCoalYards = async () => {
    if (!user?.organization?.id) return
    
    try {
      console.log("🔍 Dashboard: Loading coal yards for organization:", user.organization.id)
      
      // Get organization details to access coal_yard_names
      const { data: orgData } = await supabase
        .from("organizations")
        .select("coal_yard_names")
        .eq("id", user.organization.id)
        .single()

      if (!orgData?.coal_yard_names) {
        console.error("❌ Dashboard: Organization coal yard names not found")
        setCoalYards([])
        return
      }

      console.log("✅ Dashboard: Organization coal yard names:", orgData.coal_yard_names)

      // Get yards for this organization based on coal_yard_names array
      const { data } = await supabase
        .from("coal_yards")
        .select("*")
        .in("name", orgData.coal_yard_names as string[])
        .order("name")
      
      console.log("✅ Dashboard: Loaded coal yards:", data)
      
      if (data) setCoalYards(data as unknown as CoalYard[])
    } catch (error) {
      console.error("❌ Dashboard: Error loading coal yards:", error)
    }
  }

  const loadWeeklyActivityData = async () => {
    if (!user?.organization?.id) return

    try {
      const startDate = dateRange.start
      const endDate = dateRange.end

      // Get coal yards that have stock for this organization (independent of coalYards state)
      const { data: stockData } = await supabase
        .from("stock")
        .select("coal_yard_id")
        .eq("organization_id", user.organization.id)
      
      if (!stockData || stockData.length === 0) {
        setWeeklyActivityData({})
        return
      }

      const coalYardIds = [...new Set(stockData.map(s => s.coal_yard_id))]
      
      const { data: yards } = await supabase
        .from("coal_yards")
        .select("*")
        .in("id", coalYardIds)
        .order("name")

      // Get deliveries for the date range with organization filter
      const { data: deliveries } = await supabase
        .from("deliveries")
        .select("delivery_date, weight_tons, coal_yard_id")
        .eq("organization_id", user.organization.id)
        .gte("delivery_date", startDate)
        .lte("delivery_date", endDate)

      // Get pickups for the date range with organization filter (updated for new structure)
      const { data: pickups } = await supabase
        .from("pickup")
        .select("pickup_date, weight_tons, coal_yard_id")
        .eq("organization_id", user.organization.id)
        .gte("pickup_date", startDate)
        .lte("pickup_date", endDate)

      // Group data by coal yard
      const activityByYard: Record<string, { deliveries: any[]; pickups: any[] }> = {}

      const yardsArray = yards as unknown as CoalYard[]
      yardsArray?.forEach((yard) => {
        activityByYard[yard.id] = { deliveries: [], pickups: [] }
      })

      deliveries?.forEach((delivery: any) => {
        if (activityByYard[delivery.coal_yard_id]) {
          activityByYard[delivery.coal_yard_id].deliveries.push(delivery)
        }
      })

      pickups?.forEach((pickup: any) => {
        if (activityByYard[pickup.coal_yard_id]) {
          activityByYard[pickup.coal_yard_id].pickups.push(pickup)
        }
      })

      setWeeklyActivityData(activityByYard)
    } catch (error) {
      console.error("Error loading weekly activity data:", error)
    }
  }

  const loadDeliveryData = async () => {
    if (!user?.organization?.id) return

    try {
      // First check if any deliveries exist for this organization
      const { count } = await supabase
        .from("deliveries")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", user.organization.id)

      console.log("Total deliveries for organization:", count)

      // First try a simpler query to see if data exists
      const { data: deliveries, error } = await supabase
        .from("deliveries")
        .select(`
          *,
          coal_yard:coal_yards(name, code),
          product:products(name, image_url)
        `)
        .eq("organization_id", user.organization.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error in delivery query:", error)
        return
      }

      // Fetch audit logs separately
      if (deliveries && deliveries.length > 0) {
        const deliveryIds = deliveries.map((d: any) => d.id)
        console.log("🔍 Fetching audit logs for delivery IDs:", deliveryIds)
        
        const { data: auditLogs, error: auditError } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("table_name", "deliveries")
          .in("record_id", deliveryIds)
          .order("created_at", { ascending: false })

        console.log("🔍 Audit logs query result:", { auditLogs, auditError })

        // Get user information separately
        let auditLogsWithUsers = auditLogs || []
        if (auditLogs && auditLogs.length > 0) {
          const userIds = [...new Set(auditLogs.map(log => log.changed_by))]
          const { data: users } = await supabase
            .from("organization_users")
            .select("user_id, full_name")
            .in("user_id", userIds)

          auditLogsWithUsers = auditLogs.map(log => ({
            ...log,
            user: { full_name: users?.find(u => u.user_id === log.changed_by)?.full_name || 'Unknown User' }
          }))
        }

        // Attach audit logs to deliveries
        const deliveriesWithAudit = deliveries.map((delivery: any) => ({
          ...delivery,
          audit_logs: auditLogsWithUsers?.filter(log => log.record_id === delivery.id) || []
        }))

        console.log("🔍 Deliveries with audit attached:", deliveriesWithAudit.map((d: any) => ({
          id: d.id,
          audit_count: d.audit_logs?.length || 0
        })))

        setDeliveryData(deliveriesWithAudit)
      } else {
        console.log("Delivery data loaded:", deliveries?.length || 0, "records")
        setDeliveryData(deliveries || [])
      }
    } catch (error) {
      console.error("Error loading delivery data:", error)
    }
  }

  const loadPickupData = async () => {
    if (!user?.organization?.id) return

    try {
      // First check if any pickups exist for this organization
      const { count } = await supabase
        .from("pickup")
        .select("*", { count: 'exact', head: true })
        .eq("organization_id", user.organization.id)

      console.log("Total pickups for organization:", count)

      // First try a simpler query to see if data exists
      const { data: pickups, error } = await supabase
        .from("pickup")
        .select(`
          *,
          coal_yard:coal_yards(name, code),
          product:products(name, image_url)
        `)
        .eq("organization_id", user.organization.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error in pickup query:", error)
        return
      }

      // Fetch audit logs separately
      if (pickups && pickups.length > 0) {
        const pickupIds = pickups.map((p: any) => p.id)
        console.log("🔍 Fetching audit logs for pickup IDs:", pickupIds)
        
        const { data: auditLogs, error: auditError } = await supabase
          .from("audit_logs")
          .select("*")
          .eq("table_name", "pickup")
          .in("record_id", pickupIds)
          .order("created_at", { ascending: false })

        console.log("🔍 Pickup audit logs query result:", { auditLogs, auditError })

        // Get user information separately
        let auditLogsWithUsers = auditLogs || []
        if (auditLogs && auditLogs.length > 0) {
          const userIds = [...new Set(auditLogs.map((log: any) => log.changed_by))]
          const { data: users } = await supabase
            .from("organization_users")
            .select("user_id, full_name")
            .in("user_id", userIds)

          auditLogsWithUsers = auditLogs.map((log: any) => ({
            ...log,
            user: { full_name: users?.find((u: any) => u.user_id === log.changed_by)?.full_name || 'Unknown User' }
          }))
        }

        // Attach audit logs to pickups
        const pickupsWithAudit = pickups.map((pickup: any) => ({
          ...pickup,
          audit_logs: auditLogsWithUsers?.filter((log: any) => log.record_id === pickup.id) || []
        }))

        console.log("🔍 Pickups with audit attached:", pickupsWithAudit.map((p: any) => ({
          id: p.id,
          audit_count: p.audit_logs?.length || 0
        })))

        setPickupData(pickupsWithAudit)
      } else {
        console.log("Pickup data loaded:", pickups?.length || 0, "records")
        setPickupData(pickups || [])
      }
    } catch (error) {
      console.error("Error loading pickup data:", error)
    }
  }

  const loadAllProducts = async () => {
    if (!user?.organization?.id) return
    
    try {
      console.log("🔍 Dashboard: Loading products for organization:", user.organization.id)
      
      // Get organization details to access product_names
      const { data: orgData } = await supabase
        .from("organizations")
        .select("product_names")
        .eq("id", user.organization.id)
        .single()

      if (!orgData?.product_names) {
        console.error("❌ Dashboard: Organization product names not found")
        setAllProducts([])
        return
      }

      console.log("✅ Dashboard: Organization product names:", orgData.product_names)

      // Get products for this organization based on product_names array
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("name", orgData.product_names as string[])
        .order("name")
      
      console.log("✅ Dashboard: Loaded products:", products?.map(p => p.name) || [])
      
      if (products) setAllProducts(products as unknown as Product[])
    } catch (error) {
      console.error("Error loading all products:", error)
    }
  }

  const generateGrokSummary = async () => {
    if (!deliveryData.length && !pickupData.length) {
      setGrokSummary("No operational activity detected. Monitoring for new deliveries, pickups, or record modifications...")
      return
    }

    setLoadingGrokSummary(true)
    try {
      // Analyze audit logs for edits
      const allAuditLogs = [
        ...deliveryData.flatMap(d => d.audit_logs || []),
        ...pickupData.flatMap(p => p.audit_logs || [])
      ]

      const editAnalysis = {
        totalEdits: allAuditLogs.length,
        editedRecords: {
          deliveries: deliveryData.filter(d => d.audit_logs && d.audit_logs.length > 0).length,
          pickups: pickupData.filter(p => p.audit_logs && p.audit_logs.length > 0).length
        },
        editors: allAuditLogs.reduce((acc, log) => {
          const editor = log.user?.full_name || 'Unknown User'
          if (!acc[editor]) acc[editor] = { count: 0, records: [] }
          acc[editor].count += 1
          acc[editor].records.push({
            type: log.table_name,
            recordId: log.record_id,
            changes: Object.keys(log.new_values || {}).filter(field => 
              field !== 'coal_yard_id' && log.old_values?.[field] !== log.new_values?.[field]
            ),
            date: log.created_at
          })
          return acc
        }, {} as Record<string, { count: number; records: any[] }>),
        recentEdits: allAuditLogs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(log => ({
            editor: log.user?.full_name || 'Unknown User',
            type: log.table_name,
            changes: Object.keys(log.new_values || {}).filter(field => 
              field !== 'coal_yard_id' && log.old_values?.[field] !== log.new_values?.[field]
            ),
            date: new Date(log.created_at).toLocaleDateString()
          })),
        mostEditedFields: allAuditLogs.reduce((acc, log) => {
          Object.keys(log.new_values || {}).forEach(field => {
            if (field !== 'coal_yard_id' && log.old_values?.[field] !== log.new_values?.[field]) {
              acc[field] = (acc[field] || 0) + 1
            }
          })
          return acc
        }, {} as Record<string, number>)
      }

      // Prepare data for Grok analysis
      const summaryData = {
        dateRange: {
          start: dateRange.start,
          end: dateRange.end,
          days: Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1
        },
        deliveries: {
          total: deliveryData.length,
          totalWeight: deliveryData.reduce((sum, d) => sum + Number(d.weight_tons || 0), 0),
          byDay: deliveryData.reduce((acc, d) => {
            const date = d.delivery_date
            if (!acc[date]) acc[date] = { count: 0, weight: 0 }
            acc[date].count += 1
            acc[date].weight += Number(d.weight_tons || 0)
            return acc
          }, {} as Record<string, { count: number; weight: number }>),
          products: deliveryData.reduce((acc, d) => {
            const product = d.product?.name || 'Unknown'
            if (!acc[product]) acc[product] = { count: 0, weight: 0 }
            acc[product].count += 1
            acc[product].weight += Number(d.weight_tons || 0)
            return acc
          }, {} as Record<string, { count: number; weight: number }>)
        },
        pickups: {
          total: pickupData.length,
          totalWeight: pickupData.reduce((sum, p) => sum + Number(p.weight_tons || 0), 0),
          byDay: pickupData.reduce((acc, p) => {
            const date = p.pickup_date
            if (!acc[date]) acc[date] = { count: 0, weight: 0 }
            acc[date].count += 1
            acc[date].weight += Number(p.weight_tons || 0)
            return acc
          }, {} as Record<string, { count: number; weight: number }>),
          products: pickupData.reduce((acc, p) => {
            const product = p.product?.name || 'Unknown'
            if (!acc[product]) acc[product] = { count: 0, weight: 0 }
            acc[product].count += 1
            acc[product].weight += Number(p.weight_tons || 0)
            return acc
          }, {} as Record<string, { count: number; weight: number }>)
        },
        currentStock: stats?.totalStock || 0,
        organization: user?.organization?.name || 'Coal Yard',
        auditTrail: editAnalysis
      }

      // Call Grok API for analysis
      const response = await fetch('/api/grok-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analyze this real-time coal yard operations data and provide an immediate operational update in 3-4 sentences. Include: 1) Current activity status and any notable operational patterns, 2) ANY record edits or modifications - specifically identify WHO made changes and WHAT was edited, 3) Real-time data integrity alerts and recommendations. Focus on immediate actionable insights and flag any urgent patterns or issues requiring attention.`,
          data: summaryData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const result = await response.json()
      setGrokSummary(result.summary || "Unable to generate summary at this time.")
    } catch (error) {
      console.error("Error generating Grok summary:", error)
      setGrokSummary("Unable to generate summary. Please try again later.")
    } finally {
      setLoadingGrokSummary(false)
    }
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Calculate product stock by type, including all products (even those with 0 stock)
  const productStockByType = allProducts.reduce(
    (acc, product) => {
      const productName = product.name
      const stockForProduct = stockData.filter(stock => stock.product.name === productName)
      const totalStock = stockForProduct.reduce((sum, stock) => sum + Number(stock.current_weight_tons), 0)
      acc[productName] = { weight: totalStock, product }
      return acc
    },
    {} as Record<string, { weight: number; product: Product }>,
  )

  const toggleContainer = (containerId: string) => {
    setExpandedContainers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(containerId)) {
        newSet.delete(containerId)
      } else {
        newSet.add(containerId)
      }
      return newSet
    })
  }

  // Filter function for search
  const filterRecords = (records: any[], searchTerm: string) => {
    if (!searchTerm.trim()) return records
    
    const lowercaseSearch = searchTerm.toLowerCase().trim()
    
    return records.filter((record: any) => {
      // Search in weighbridge slip/number
      const weighbridgeNumber = (record.weighbridge_slip || record.id || "").toString().toLowerCase()
      
      // Search in container number (for pickups)
      const containerNumber = (record.container_number || "").toString().toLowerCase()
      
      // Search in product name
      const productName = (record.product?.name || "").toLowerCase()
      
      return weighbridgeNumber.includes(lowercaseSearch) ||
             containerNumber.includes(lowercaseSearch) ||
             productName.includes(lowercaseSearch)
    })
  }

  // Get filtered data
  const filteredDeliveryData = filterRecords(deliveryData, searchTerm)
  const filteredPickupData = filterRecords(pickupData, searchTerm)

  const handleDeleteRecord = async () => {
    if (!selectedRecord || !user) return

    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase
        .from("organization_users")
        .select("user_id, organization_id")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single()

      if (!userData) {
        console.error("User not found or inactive")
        return
      }

      if (recordType === 'delivery') {
        // First reverse the stock that was added by this delivery
        const { error: stockError } = await supabase.rpc("update_stock_on_pickup", {
          p_coal_yard_id: selectedRecord.coal_yard_id,
          p_product_id: selectedRecord.product_id,
          p_organization_id: (userData as any).organization_id,
          p_weight_tons: selectedRecord.weight_tons,
        })

        if (stockError) {
          console.error("Error reversing stock:", stockError)
          throw new Error(`Failed to reverse stock: ${stockError.message}`)
        }

        // Then delete the delivery record
        const { error: deleteError } = await supabase
          .from("deliveries")
          .delete()
          .eq("id", selectedRecord.id)
          .eq("organization_id", (userData as any).organization_id)

        if (deleteError) {
          console.error("Error deleting delivery:", deleteError)
          throw new Error(`Failed to delete delivery: ${deleteError.message}`)
        }

        console.log("Delivery deleted successfully")
      } else if (recordType === 'pickup') {
        // For pickups, add back the stock that was taken out for this specific record
        const { error: stockError } = await supabase.rpc("update_stock_on_delivery", {
          p_coal_yard_id: selectedRecord.coal_yard_id,
          p_product_id: selectedRecord.product_id,
          p_organization_id: (userData as any).organization_id,
          p_weight_tons: selectedRecord.weight_tons,
        })

        if (stockError) {
          console.error("Error adding back stock:", stockError)
          throw new Error(`Failed to add back stock for product ${selectedRecord.product_id}: ${stockError.message}`)
        }

        // Then delete only this specific pickup record
        const { error: deleteError } = await supabase
          .from("pickup")
          .delete()
          .eq("id", selectedRecord.id)
          .eq("organization_id", (userData as any).organization_id)

        if (deleteError) {
          console.error("Error deleting pickup record:", deleteError)
          throw new Error(`Failed to delete pickup record: ${deleteError.message}`)
        }

        console.log("Pickup record deleted successfully")
      }

      // Close modal and refresh data
      setShowDeleteModal(false)
      setSelectedRecord(null)
      
      // Show success toast
      showToast(
        `${recordType === 'delivery' ? 'Delivery' : 'Pickup'} record deleted successfully`,
        'success'
      )
      
      // Reload all dashboard data
      await Promise.all([
        loadDashboardData(),
        loadDeliveryData(),
        loadPickupData()
      ])

    } catch (error) {
      console.error("Error deleting record:", error)
      showToast(
        `Failed to delete ${recordType} record: ${(error as any)?.message || "Unknown error"}`,
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'zip') => {
    if (!user?.id || !user?.organization?.id) return

    try {
      setLoadingExport(true)
      setOpenDropdown(null)

      // Get the auth session
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        },
        body: JSON.stringify({
          format,
          userId: user.id,
          organizationId: user.organization.id,
          dateRange,
          coalYardFilter: selectedYardFilter
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the filename from the response header
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `export-${format}-${new Date().toISOString().split('T')[0]}.${format}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      // You could add a toast notification here
    } finally {
      setLoadingExport(false)
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
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">{user.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl font-light">
              Hi <span className="font-bold">{user.full_name}</span>,{" "}
              <span className="italic">here's what's happening.</span>
            </h1>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-sm text-gray-300">{user.organization?.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Role:</span>
                <span className="text-xs bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
                  {user.role?.name || 'No Role Assigned'}
                </span>
              </div>
              {/* Debugging info */}

            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2 pb-24">
        {/* Current Stock Gauge */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

              <div className="flex items-center gap-3">
                <Select value={selectedYardFilter} onValueChange={setSelectedYardFilter}>
                  <SelectTrigger className="w-32 h-10 rounded-full border-2 border-gray-300 bg-white">
                    <div className="flex items-center gap-2">
                      <SelectValue placeholder="All">
                        {selectedYardFilter === "all"
                          ? "All"
                          : coalYards.find((yard) => yard.id === selectedYardFilter)?.code || "All"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {coalYards.map((yard) => (
                      <SelectItem key={yard.id} value={yard.id}>
                        {yard.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter and Edit Buttons */}
                <div className="flex items-center gap-2">
                  <Dialog open={showDateFilter} onOpenChange={setShowDateFilter}>

                    <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
                      <div className="flex flex-col w-full">
                        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                          <DialogTitle className="text-xl font-bold text-gray-800">Filter by Date Range</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Select start and end dates to filter your delivery and pickup records
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                          <div>
                            <Label className="text-sm font-medium">Start Date</Label>
                            <div className="relative mt-1">
                              <Input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                                className="cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                style={{ colorScheme: 'light' }}
                              />
                              <Calendar1 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">End Date</Label>
                            <div className="relative mt-1">
                              <Input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                                className="cursor-pointer pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                style={{ colorScheme: 'light' }}
                              />
                              <Calendar1 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDateFilter(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                loadDashboardData()
                                setShowDateFilter(false)
                              }}
                              className="bg-yellow-500 hover:bg-yellow-600 text-gray-800"
                            >
                              Apply Filter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>


                </div>
              </div>
            </div>

            {/* Date Range Display with Export Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-gray-600 mb-6 bg-gray-50 p-3 rounded-[20px]">
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar1 size={16} />
                  <span className="text-sm">
                    {new Date(dateRange.start).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-gray-400 hidden md:inline">|</span>
                <div className="flex items-center gap-2">
                  <Calendar1 size={16} />
                  <span className="text-sm">
                    {new Date(dateRange.end).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              
              {/* Edit Date Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDateFilter(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-600 hover:text-gray-800 self-start md:self-auto w-full md:w-auto"
              >
                <Edit size={16} />
                Edit
              </Button>
              
              {/* Export Button */}
              <div className="relative hidden" data-dropdown="export">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingExport}
                  onClick={() => setOpenDropdown(openDropdown === 'export' ? null : 'export')}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
                >
                  {loadingExport ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-gray-600"></div>
                  ) : (
                    <DocumentDownload size={16} />
                  )}
                  {loadingExport ? 'Exporting...' : 'Export'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {openDropdown === 'export' && !loadingExport && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <button
                        onClick={() => handleExport('csv')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <DocumentText size={16} />
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <DocumentText size={16} />
                        PDF
                      </button>
                      <button
                        onClick={() => handleExport('zip')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                      >
                        <Archive size={16} />
                        ZIP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grok AI Summary */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-[24px] border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[16px] flex items-center justify-center">
                  <Image
                    src="/images/grok.png"
                    alt="Live Operations Monitor"
                    width={20}
                    height={20}
                    className="w-10 h-10 rounded-[16px]"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Live Operations Monitor</h3>
                  <p className="text-xs text-gray-600">Real-time insights powered by Grok AI</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {loadingGrokSummary ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600">Analyzing live operations data...</span>
                  </div>
                ) : grokSummary ? (
                  <p>{grokSummary}</p>
                                 ) : (
                   <p className="text-gray-500 italic">Monitoring for operational activity... Analysis will appear when deliveries, pickups, or edits are detected.</p>
                 )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex space-x-8 mb-6 mt-10">
                <button
                  onClick={() => setStockActivityTab("stock")}
                  className={`text-xl pb-1 transition-all ${
                    stockActivityTab === "stock"
                      ? "font-bold text-gray-800 border-b-2 border-gray-800"
                      : "font-light text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Current Stock
                </button>
                <button
                  onClick={() => setStockActivityTab("activity")}
                  className={`text-xl pb-1 transition-all ${
                    stockActivityTab === "activity"
                      ? "font-bold text-gray-800 border-b-2 border-gray-800"
                      : "font-light text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Weekly Activity
                </button>
              </div>

              {/* Current Stock Content */}
              {stockActivityTab === "stock" && (
                <div className="mt-0">
                  {/* Current Stock Content */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-[280px] h-[280px] md:w-[400px] md:h-[400px]">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#374151"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(stats?.totalStock || 0) / 100} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-sm md:text-md text-gray-600 mb-2">Total available stock</p>
                        <p className="text-2xl md:text-4xl font-bold text-gray-800">{stats?.totalStock.toLocaleString() || 0} t</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Metrics */}
                  <div className="grid grid-cols-2 gap-0 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stats?.totalDeliveryWeight.toLocaleString() || 0} t
                      </p>
                      <p className="text-xs text-gray-500 md:inline block">
                        <span className="md:inline block">Last updated:</span>
                        <span className="md:inline block md:ml-1">{new Date().toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Pickups</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stats?.totalPickupWeight.toLocaleString() || 0} t
                      </p>
                      <p className="text-xs text-gray-500 md:inline block">
                        <span className="md:inline block">Last updated:</span>
                        <span className="md:inline block md:ml-1">{new Date().toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Product Stock Chart */}
                                    <div className="space-y-4">
                    <div className="flex justify-center">
                      <div 
                        className="grid grid-cols-2 md:grid-cols-none gap-24 my-12 justify-center items-center max-w-6xl mx-auto"
                        style={{ 
                          '--mobile-cols': '2',
                          '--desktop-cols': Math.min(Object.keys(productStockByType).length, 6),
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
                        } as React.CSSProperties & { '--mobile-cols': string, '--desktop-cols': number }}
                      >
                        <style jsx>{`
                          @media (min-width: 768px) {
                            div {
                              grid-template-columns: repeat(var(--desktop-cols), minmax(0, 1fr)) !important;
                            }
                          }
                        `}</style>
                        {Object.entries(productStockByType).map(([productName, { weight, product }]) => {
                          const maxWeight = 80000
                          const rawPercentage = maxWeight > 0 ? (weight / maxWeight) * 100 : 0
                          // Set minimum visible height of 8% if there's any stock, otherwise 0%
                          const percentage = weight > 0 ? Math.max(rawPercentage, 8) : 0
                          const stockpileNumber = allProducts.findIndex(p => p.name === productName) + 1

                          return (
                            <div key={productName} className="flex flex-col items-center">
                              {/* Weight Display */}
                              <div className="text-lg font-bold text-gray-800 mb-2">{weight.toLocaleString()} t</div>

                              {/* Vertical Bar */}
                              <div className="w-16 h-48 bg-gray-200 rounded-[24px] flex items-end mb-3">
                                <div
                                  className="w-full bg-gray-800 rounded-[24px] transition-all duration-300"
                                  style={{ height: `${percentage}%` }}
                                />
                              </div>

                              {/* Product Image */}
                              <div className="w-20 h-20">
                                <Image
                                  src={product?.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                  alt={productName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>

                              {/* Product Name and Stockpile */}
                              <div className="text-center">
                                <p className="font-semibold text-gray-800 text-sm">{productName}</p>
                                <p className="text-xs text-gray-500">Stockpile {stockpileNumber}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stockActivityTab === "activity" && (
                <div className="mt-12 mb-2">
                  <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-24 mb-0">
                    {/* Deliveries Section */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Deliveries</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600"># of Deliveries:</span>
                          <span className="font-bold text-lg ml-2">{stats?.totalDeliveries || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total delivered weight:</span>
                          <span className="font-bold text-lg ml-2">
                            {stats?.totalDeliveryWeight.toLocaleString() || 0} t
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pickups Section */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Pickups</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600"># of Pickups:</span>
                          <span className="font-bold text-lg ml-2">{stats?.totalPickups || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total pickup weight:</span>
                          <span className="font-bold text-lg ml-2">
                            {stats?.totalPickupWeight.toLocaleString() || 0} t
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-12 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Pick up</span>
                    </div>
                  </div>

                  {/* Weekly Activity Grid */}
                  <div className="space-y-4">
                    {coalYards.map((yard) => {
                      const yardActivity = weeklyActivityData[yard.id] || { deliveries: [], pickups: [] }

                                              return (
                          <div key={yard.id} className="bg-gray-50 rounded-[32px] p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                                {yard.image_url ? (
                                  <Image
                                    src={yard.image_url}
                                    alt={yard.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{yard.code}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-800">{yard.name}</h5>
                                <p className="text-sm text-gray-500">{yard.code}</p>
                              </div>
                            </div>

                          {/* Desktop Grid Layout */}
                          <div className="hidden md:block">
                            <div className="grid grid-cols-7 gap-1 mb-3">
                              {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date(dateRange.start)
                                date.setDate(date.getDate() + i)
                                return (
                                  <div key={i} className="text-center">
                                    <div className="text-xs text-gray-500 mb-1">
                                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-600">{date.getDate()}</div>
                                  </div>
                                )
                              })}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date(dateRange.start)
                                date.setDate(date.getDate() + i)
                                const dateString = date.toISOString().split("T")[0]

                                // Get deliveries for this date
                                const dayDeliveries = yardActivity.deliveries.filter(
                                  (d) => d.delivery_date === dateString,
                                )
                                const deliveryWeight = dayDeliveries.reduce((sum, d) => sum + Number(d.weight_tons), 0)

                                // Get pickups for this date
                                const dayPickups = yardActivity.pickups.filter((p) => p.pickup_date === dateString)
                                const pickupWeight = dayPickups.reduce((sum, p) => sum + Number(p.weight_tons), 0)

                                const hasDelivery = deliveryWeight > 0
                                const hasPickup = pickupWeight > 0

                                return (
                                  <div key={i} className="flex flex-col space-y-1">
                                    {hasDelivery && (
                                      <div className="bg-green-500 text-white text-xs font-medium px-1 py-1 rounded-xl text-center min-h-[24px] flex items-center justify-center">
                                        <span className="block">+{Math.round(deliveryWeight)}t</span>
                                      </div>
                                    )}
                                    {hasPickup && (
                                      <div className="bg-red-500 text-white text-xs font-medium px-1 py-1 rounded-xl text-center min-h-[24px] flex items-center justify-center">
                                        <span className="block">-{Math.round(pickupWeight)}t</span>
                                      </div>
                                    )}
                                    {!hasDelivery && !hasPickup && (
                                      <div className="bg-gray-200 text-gray-400 text-xs font-medium px-1 py-1 rounded-xl text-center h-6 flex items-center justify-center">
                                        —
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Mobile Vertical Layout */}
                          <div className="md:hidden space-y-3">
                            {Array.from({ length: 7 }, (_, i) => {
                              const date = new Date(dateRange.start)
                              date.setDate(date.getDate() + i)
                              const dateString = date.toISOString().split("T")[0]

                              // Get deliveries for this date
                              const dayDeliveries = yardActivity.deliveries.filter(
                                (d) => d.delivery_date === dateString,
                              )
                              const deliveryWeight = dayDeliveries.reduce((sum, d) => sum + Number(d.weight_tons), 0)

                              // Get pickups for this date
                              const dayPickups = yardActivity.pickups.filter((p) => p.pickup_date === dateString)
                              const pickupWeight = dayPickups.reduce((sum, p) => sum + Number(p.weight_tons), 0)

                              const hasDelivery = deliveryWeight > 0
                              const hasPickup = pickupWeight > 0
                              const hasActivity = hasDelivery || hasPickup

                              return (
                                <div key={i} className={`rounded-xl p-3 border ${hasActivity ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                                  {/* Date Header */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className={`text-sm font-semibold ${hasActivity ? 'text-gray-800' : 'text-gray-500'}`}>
                                      {date.toLocaleDateString("en-US", { weekday: "short" })} {date.getDate()}
                                    </div>
                                  </div>

                                  {/* Activity Indicators */}
                                  <div className="space-y-2">
                                    {hasDelivery && (
                                      <div className="bg-green-500 text-white text-sm font-medium px-3 py-2 rounded-lg w-full text-center">
                                        <span>Delivery: +{Math.round(deliveryWeight)}t</span>
                                      </div>
                                    )}
                                    {hasPickup && (
                                      <div className="bg-red-500 text-white text-sm font-medium px-3 py-2 rounded-lg w-full text-center">
                                        <span>Pickup: -{Math.round(pickupWeight)}t</span>
                                      </div>
                                    )}
                                    {!hasActivity && (
                                      <div className="bg-gray-200 text-gray-500 text-sm font-medium px-3 py-2 rounded-lg w-full text-center">
                                        No activity
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Summary for this yard */}
                          <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600">
                                {Math.round(yardActivity.deliveries.reduce((sum, d) => sum + Number(d.weight_tons), 0))}
                                t delivered
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-gray-600">
                                {Math.round(
                                  yardActivity.pickups.reduce((sum, p) => sum + Number(p.weight_tons), 0)
                                )}
                                t picked up
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deliveries and Pickups Tables */}
        <Card className="bg-white rounded-[32px]">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("deliveries")}
                  className={`text-xl pb-1 transition-all ${
                    activeTab === "deliveries"
                      ? "font-bold text-gray-800 border-b-2 border-gray-800"
                      : "font-light text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Deliveries
                </button>
                <button
                  onClick={() => setActiveTab("pickups")}
                  className={`text-xl pb-1 transition-all ${
                    activeTab === "pickups"
                      ? "font-bold text-gray-800 border-b-2 border-gray-800"
                      : "font-light text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pickups
                </button>
              </div>
              
              {/* Search Input */}
              <div className="relative w-full md:w-auto">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by container, weighbridge, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-96 pl-12 pr-10 py-2 rounded-full border-2 border-gray-200 focus:border-yellow-500 focus:ring-0"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <CloseSquare size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === "deliveries" ? (
                // Deliveries content
                <>
                  {Object.entries(
                    (filteredDeliveryData as any[]).reduce(
                      (groups: Record<string, any[]>, delivery: any) => {
                        const date = new Date(delivery.delivery_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        if (!groups[date]) groups[date] = []
                        groups[date].push(delivery)
                        return groups
                      },
                      {} as Record<string, any[]>,
                    ),
                  )
                  .sort(([dateA], [dateB]) => {
                    // Sort by date, newest first
                    return new Date(dateB).getTime() - new Date(dateA).getTime()
                  })
                  .map(([date, deliveries]: [string, any[]]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gray-100 p-2 rounded-2xl">
                          <Calendar1 size={20} className="text-gray-700" />
                        </div>
                        <h3 className="text-md font-bold text-gray-800">{date}</h3>
                      </div>

                      <div className="space-y-3">
                        {deliveries.map((delivery: any) => {
                          const isExpanded = expandedContainers.has(delivery.id)
                                                      return (
                              <div key={delivery.id} className={`bg-white rounded-[24px] p-4 border transition-all ${isExpanded ? 'border-gray-600' : 'border-gray-100 hover:bg-gray-50 hover:border-gray-300'}`}>
                                <div
                                  className="cursor-pointer"
                                  onClick={() => toggleContainer(delivery.id)}
                                >
                                  {/* Mobile Layout */}
                                  <div className="md:hidden">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <Image
                                          src="/delivery.jpg"
                                          alt="Delivery"
                                          width={24}
                                          height={24}
                                          className="w-10 h-10 object-cover rounded-[20px] flex-shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-gray-800 text-sm">
                                            Weighbridge #:
                                          </p>
                                          <p className="text-gray-800 text-sm font-medium truncate">
                                            {delivery.weighbridge_slip || delivery.id || "N/A"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedRecord(delivery)
                                            setRecordType('delivery')
                                            setShowDropdownModal(true)
                                          }}
                                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                                        >
                                          <MoreSquare size={18} className="text-gray-500" />
                                        </button>
                                        <ChevronDown
                                          className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-gray-600 text-sm">
                                          {delivery.product?.name || "Mixed Products"}
                                        </p>
                                        {delivery.audit_logs && delivery.audit_logs.length > 0 && (
                                          <span className="inline-flex items-center bg-blue-100 px-2 py-1 rounded-full mt-1">
                                            <span className="text-xs font-medium text-blue-600">Edited</span>
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-md font-bold text-gray-800">{delivery.weight_tons?.toLocaleString()}t</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Desktop Layout */}
                                  <div className="hidden md:flex md:items-center md:justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="rounded-2xl">
                                        <Image
                                          src="/delivery.jpg"
                                          alt="Delivery"
                                          width={24}
                                          height={24}
                                          className="w-12 h-12 object-cover rounded-[24px]"
                                        />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-800 text-md">
                                          Weighbridge Number: {delivery.weighbridge_slip || delivery.id || "N/A"}
                                          {/* Edit indicator - will show when audit system is implemented */}
                                          {delivery.audit_logs && delivery.audit_logs.length > 0 && (
                                            <span className="ml-2 inline-flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                              <span className="text-xs font-medium text-blue-600">Edited</span>
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1">
                                          {delivery.product?.name || "Mixed Products"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="text-md font-bold text-gray-800">{delivery.weight_tons?.toLocaleString()}t</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedRecord(delivery)
                                          setRecordType('delivery')
                                          setShowDropdownModal(true)
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                      >
                                        <MoreSquare size={20} className="text-gray-500" />
                                      </button>
                                      <ChevronDown
                                        className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                      />
                                    </div>
                                  </div>
                                </div>

                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="font-semibold text-gray-800 mb-4">Products:</p>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                      <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[24px] flex items-center justify-center">
                                          <Image
                                            src={delivery.product?.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                            alt={delivery.product?.name || "Product"}
                                            width={48}
                                            height={48}
                                            className="w-16 h-16 object-cover rounded-[24px]"
                                          />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-gray-800">{delivery.product?.name || "Product Name Unavailable"}</p>
                                          <p className="text-sm text-gray-500">Stockpile 1</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-md font-bold text-gray-800">{delivery.weight_tons?.toLocaleString()} t</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Coal Yard:</span>
                                      <span className="font-medium">{delivery.coal_yard?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Date:</span>
                                      <span className="font-medium">{new Date(delivery.delivery_date).toLocaleDateString()}</span>
                                    </div>
                                    {delivery.notes && (
                                      <div className="mt-3">
                                        <span className="text-gray-600">Notes:</span>
                                        <p className="text-gray-700 mt-1">{delivery.notes}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Audit Trail Section */}
                                  {delivery.audit_logs && delivery.audit_logs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Edit size={16} className="text-blue-500" />
                                        <span className="font-semibold text-gray-800 text-sm">Edit History</span>
                                      </div>
                                      <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {delivery.audit_logs.map((audit: any, index: number) => (
                                          <div key={audit.id} className="bg-blue-50 rounded-[20px] p-3 border border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                                                {audit.action || 'EDIT'}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(audit.created_at).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-700 mb-2">
                                              <span className="font-medium">Edited by:</span> {audit.user?.full_name || 'Unknown User'}
                                            </div>
                                            {audit.old_values && audit.new_values && (
                                              <div className="space-y-1 text-xs">
                                                {Object.keys(audit.new_values).map((field: string) => {
                                                  const oldValue = audit.old_values[field]
                                                  const newValue = audit.new_values[field]
                                                  if (oldValue === newValue) return null
                                                  
                                                  // Skip coal_yard_id (users don't need to see raw database IDs)
                                                  if (field === 'coal_yard_id') return null
                                                  
                                                  // Skip complex objects like containers
                                                  if (typeof oldValue === 'object' || typeof newValue === 'object') {
                                                    return null
                                                  }
                                                  
                                                  // Special handling for product_id - show product names instead of IDs
                                                  if (field === 'product_id') {
                                                    const oldProduct = allProducts.find(p => p.id === oldValue)
                                                    const newProduct = allProducts.find(p => p.id === newValue)
                                                    return (
                                                      <div key={field} className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-600 capitalize">
                                                          Product Type:
                                                        </span>
                                                        <span className="text-red-600 line-through">
                                                          {oldProduct?.name || 'Unknown Product'}
                                                        </span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-green-600 font-medium">
                                                          {newProduct?.name || 'Unknown Product'}
                                                        </span>
                                                      </div>
                                                    )
                                                  }
                                                  
                                                  return (
                                                    <div key={field} className="flex items-center gap-2">
                                                      <span className="font-medium text-gray-600 capitalize">
                                                        {field.replace(/_/g, ' ')}:
                                                      </span>
                                                      <span className="text-red-600 line-through">
                                                        {field.includes('weight') ? `${oldValue}t` : String(oldValue || '')}
                                                      </span>
                                                      <span className="text-gray-400">→</span>
                                                      <span className="text-green-600 font-medium">
                                                        {field.includes('weight') ? `${newValue}t` : String(newValue || '')}
                                                      </span>
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {filteredDeliveryData.length === 0 && (
                    <div className="text-center py-8">
                      {/* Empty state image */}
                      <div className="mb-6">
                        <div className="w-300 h-300 flex items-center justify-center mx-auto mb-4">
                          <Image
                            src="/images/empty.png"
                            alt="No deliveries"
                            width={300}
                            height={300}
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>
                                              <p className="text-gray-500 text-lg">
                          {searchTerm ? `No deliveries found matching "${searchTerm}"` : "No deliveries found"}
                        </p>
                    </div>
                  )}
                </>
              ) : (
                // Pickups content
                <>
                  {Object.entries(
                    (filteredPickupData as any[]).reduce(
                      (groups: Record<string, any[]>, pickup: any) => {
                        const date = new Date(pickup.pickup_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        if (!groups[date]) groups[date] = []
                        groups[date].push(pickup)
                        return groups
                      },
                      {} as Record<string, any[]>,
                    ),
                  )
                  .sort(([dateA], [dateB]) => {
                    // Sort by date, newest first
                    return new Date(dateB).getTime() - new Date(dateA).getTime()
                  })
                  .map(([date, pickups]: [string, any[]]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gray-100 p-2 rounded-[24px]">
                          <Calendar1 size={20} className="text-gray-700" />
                        </div>
                        <h3 className="text-md font-bold text-gray-800">{date}</h3>
                      </div>

                      <div className="space-y-3">
                        {pickups.map((pickup: any) => {
                          const isExpanded = expandedContainers.has(pickup.id)
                          const totalWeight = pickup.weight_tons || 0
                          const containerCount = pickup.pickup_containers?.length || 1

                          return (
                            <div key={pickup.id} className={`bg-white rounded-[24px] p-4 border transition-all ${isExpanded ? 'border-gray-600' : 'border-gray-100 hover:bg-gray-50 hover:border-gray-300'}`}>
                              <div
                                className="cursor-pointer"
                                onClick={() => toggleContainer(pickup.id)}
                              >
                                {/* Mobile Layout */}
                                <div className="md:hidden">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Image
                                        src="/pickups.jpg"
                                        alt="Pickup"
                                        width={24}
                                        height={24}
                                        className="w-10 h-10 object-cover rounded-[20px] flex-shrink-0"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-800 text-sm">
                                          Container SARU:
                                        </p>
                                        <p className="text-gray-800 text-sm font-medium truncate">
                                          {pickup.container_number || pickup.weighbridge_slip || pickup.id || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedRecord(pickup)
                                          setRecordType('pickup')
                                          setShowDropdownModal(true)
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                                      >
                                        <MoreSquare size={18} className="text-gray-500" />
                                      </button>
                                      <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-gray-600 text-sm">
                                        {pickup.product?.name || "Mixed Products"}
                                      </p>
                                      {pickup.audit_logs && pickup.audit_logs.length > 0 && (
                                        <span className="inline-flex items-center bg-blue-100 px-2 py-1 rounded-full mt-1">
                                          <span className="text-xs font-medium text-blue-600">Edited</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-md font-bold text-gray-800">{totalWeight?.toLocaleString()}t</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden md:flex md:items-center md:justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="rounded-2xl">
                                      <Image
                                        src="/pickups.jpg"
                                        alt="Pickup"
                                        width={24}
                                        height={24}
                                        className="w-12 h-12 object-cover rounded-[24px]"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-800 text-md">
                                        Container SARU | {pickup.container_number || pickup.weighbridge_slip || pickup.id || "N/A"}
                                        {/* Edit indicator - will show when audit system is implemented */}
                                        {pickup.audit_logs && pickup.audit_logs.length > 0 && (
                                          <span className="ml-2 inline-flex items-center bg-blue-100 px-2 py-1 rounded-full">
                                            <span className="text-xs font-medium text-blue-600">Edited</span>
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-gray-600 text-sm mt-1">
                                        {pickup.product?.name || "Mixed Products"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="text-md font-bold text-gray-800">{totalWeight?.toLocaleString()}t</p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedRecord(pickup)
                                        setRecordType('pickup')
                                        setShowDropdownModal(true)
                                      }}
                                      className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                      <MoreSquare size={20} className="text-gray-500" />
                                    </button>
                                    <ChevronDown
                                      className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                  </div>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="font-semibold text-gray-800 mb-4">Products:</p>
                                  
                                  <div className="space-y-3">
                                    {pickup.pickup_containers?.map((container: any, index: number) => 
                                      container.pickup_container_products?.map((containerProduct: any, productIndex: number) => (
                                        <div key={`${container.id}-${productIndex}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                          <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-[24px] flex items-center justify-center">
                                              <Image
                                                src={containerProduct.product?.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                                alt={containerProduct.product?.name || "Product"}
                                                width={48}
                                                height={48}
                                                className="w-16 h-16 object-cover rounded-[24px]"
                                              />
                                            </div>
                                            <div>
                                              <p className="font-semibold text-gray-800">{containerProduct.product?.name}</p>
                                              <p className="text-sm text-gray-500">Stockpile {productIndex + 1}</p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-md font-bold text-gray-800">{containerProduct.weight_tons?.toLocaleString()} t</p>
                                          </div>
                                        </div>
                                      ))
                                    ) || (
                                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center">
                                            <Image
                                              src={pickup.product?.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                              alt={pickup.product?.name || "Product"}
                                              width={48}
                                              height={48}
                                              className="w-16 h-16 object-cover rounded-[24px]"
                                            />
                                          </div>
                                          <div>
                                            <p className="font-semibold text-gray-800">{pickup.product?.name}</p>
                                            <p className="text-sm text-gray-500">Stockpile 1</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-md font-bold text-gray-800">{totalWeight?.toLocaleString()} t</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Coal Yard:</span>
                                      <span className="font-medium">{pickup.coal_yard?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Date:</span>
                                      <span className="font-medium">{new Date(pickup.pickup_date).toLocaleDateString()}</span>
                                    </div>
                                    {pickup.weighbridge_slip && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Weighbridge Slip:</span>
                                        <span className="font-medium">{pickup.weighbridge_slip}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Audit Trail Section */}
                                  {pickup.audit_logs && pickup.audit_logs.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Edit size={16} className="text-blue-500" />
                                        <span className="font-semibold text-gray-800 text-sm">Edit History</span>
                                      </div>
                                      <div className="space-y-3 max-h-48 overflow-y-auto">
                                        {pickup.audit_logs.map((audit: any, index: number) => (
                                          <div key={audit.id} className="bg-blue-50 rounded-[20px] p-3 border border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                                                {audit.action || 'EDIT'}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {new Date(audit.created_at).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-700 mb-2">
                                              <span className="font-medium">Edited by:</span> {audit.user?.full_name || 'Unknown User'}
                                            </div>
                                            {audit.old_values && audit.new_values && (
                                              <div className="space-y-1 text-xs">
                                                {Object.keys(audit.new_values).map((field: string) => {
                                                  const oldValue = audit.old_values[field]
                                                  const newValue = audit.new_values[field]
                                                  if (oldValue === newValue) return null
                                                  
                                                  // Skip coal_yard_id (users don't need to see raw database IDs)
                                                  if (field === 'coal_yard_id') return null
                                                  
                                                  // Skip complex objects like containers
                                                  if (typeof oldValue === 'object' || typeof newValue === 'object') {
                                                    return null
                                                  }
                                                  
                                                  return (
                                                    <div key={field} className="flex items-center gap-2">
                                                      <span className="font-medium text-gray-600 capitalize">
                                                        {field.replace(/_/g, ' ')}:
                                                      </span>
                                                      <span className="text-red-600 line-through">
                                                        {field.includes('weight') ? `${oldValue}t` : String(oldValue || '')}
                                                      </span>
                                                      <span className="text-gray-400">→</span>
                                                      <span className="text-green-600 font-medium">
                                                        {field.includes('weight') ? `${newValue}t` : String(newValue || '')}
                                                      </span>
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {filteredPickupData.length === 0 && (
                    <div className="text-center py-8">
                      {/* Empty state image */}
                      <div className="mb-6">
                        <div className="w-64 h-64 flex items-center justify-center mx-auto mb-4">
                          <Image
                            src="/images/empty.png"
                            alt="No pickups"
                            width={250}
                            height={250}
                            className="w-64 h-64 object-contain"
                          />
                        </div>
                      </div>
                                              <p className="text-gray-500 text-lg">
                          {searchTerm ? `No pickups found matching "${searchTerm}"` : "No pickups found"}
                        </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

              {/* Floating Action Button */}
        <div className="fixed bottom-4 right-4 md:bottom-12 md:right-12 z-50">
          <Button
            size="lg"
            className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-yellow-500 hover:bg-yellow-600 text-gray-800 shadow-lg"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="!h-6 !w-6 md:!h-8 md:!w-8" style={{ width: '24px', height: '24px' }} />
          </Button>
        </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Add new deliveries or pick ups</DialogTitle>
              <DialogDescription className="text-gray-600">
                Choose whether to record new deliveries coming in or pickups going out
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <Button
                variant="outline"
                className="w-full h-20 justify-start border-[1px] border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-[24px]"
                onClick={() => {
                  setShowAddModal(false)
                  router.push("/deliveries")
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl flex items-center justify-center">
                    <Image
                      src="/delivery.jpg"
                      alt="Delivery"
                      width={24}
                      height={24}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 text-lg">Add Deliveries</h3>
                    <p className="text-sm text-gray-500">Load coming in to the yard</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 justify-start border-[1px] border-gray-100 hover:border-gray-200 hover:bg-gray-50 rounded-[24px]"
                onClick={() => {
                  setShowAddModal(false)
                  router.push("/pickups")
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg flex items-center justify-center">
                    <Image
                      src="/pickups.jpg"
                      alt="Pickup"
                      width={24}
                      height={24}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 text-lg">Add Pickups</h3>
                    <p className="text-sm text-gray-500">Load going out of the yard</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slide-out Menu */}
      <SlideOutMenu
        isOpen={showSideMenu}
        onClose={() => setShowSideMenu(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Edit Record Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[80vh] rounded-t-[24px] !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">
                Edit {recordType === 'delivery' ? 'Delivery' : 'Pickup'} Record
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Modify the details of this {recordType} record
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 p-6">
              <p className="text-gray-600 mb-4">
                Editing functionality will be implemented here. Selected record ID: {selectedRecord?.id}
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement edit functionality
                    setShowEditModal(false)
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-800"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Record Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[70vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">
                Delete {recordType === 'delivery' ? 'Delivery' : 'Pickup'} Record
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Permanently remove this {recordType} record from your system
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {recordType} record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteRecord}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dropdown Menu Modal */}
      <Dialog open={showDropdownModal} onOpenChange={setShowDropdownModal}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[50vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
          <div className="flex flex-col w-full">
            <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 pb-3 sm:pb-4 border-b border-gray-200">
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 text-center">
                {recordType === 'delivery' ? 'Delivery' : 'Pickup'} Options
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600 text-center mt-1">
                Choose an action to perform on this {recordType} record
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
              <Button
                onClick={() => {
                  setShowDropdownModal(false)
                  if (recordType === 'delivery') {
                    router.push(`/deliveries/edit/${selectedRecord?.id}`)
                  } else {
                    router.push(`/pickups/edit/${selectedRecord?.id}`)
                  }
                }}
                variant="outline"
                className="w-full h-14 sm:h-16 rounded-[24px] sm:rounded-[24px] justify-start text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl sm:rounded-[24px] flex items-center justify-center flex-shrink-0">
                    <Edit size={20} className="sm:size-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg truncate">Edit record</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Modify this {recordType} record</p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => {
                  setShowDropdownModal(false)
                  setShowDeleteModal(true)
                }}
                variant="outline"
                className="w-full h-14 sm:h-16 rounded-[24px] sm:rounded-[24px] justify-start text-left border-red-200 hover:border-red-300 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 w-full">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl sm:rounded-[24px] flex items-center justify-center flex-shrink-0">
                    <Trash size={20} className="sm:size-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-red-600 text-base sm:text-lg truncate">Delete record</h3>
                    <p className="text-xs sm:text-sm text-red-500 truncate">Permanently remove this {recordType} record</p>
                  </div>
                </div>
              </Button>
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
