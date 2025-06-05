"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Users, X } from "lucide-react"
import { Calendar1, Weight, DocumentText } from "iconsax-reactjs"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { CoalYard, Product } from "@/types/database"
import Image from "next/image"

interface PickupRecord {
  id: string
  pickup_date: string
  weighbridge_slip?: string
  weight_tons: number
  coal_yard_id: string
  container_number: string
  product_id: string
  notes?: string
  product?: Product
}

interface ContainerEntry {
  id: string
  containerNumber: string
  products: Array<{
    id: string
    productId: string
    weight: string
    pickupRecordId: string
  }>
}

export default function EditPickupPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const pickupId = params.id as string
  
  const [selectedYard, setSelectedYard] = useState<string>("")
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [pickupRecords, setPickupRecords] = useState<PickupRecord[]>([])
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split("T")[0])
  const [weighbridgeSlip, setWeighbridgeSlip] = useState("")
  const [notes, setNotes] = useState("")
  const [containers, setContainers] = useState<ContainerEntry[]>([])
  const [originalContainers, setOriginalContainers] = useState<ContainerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentStock, setCurrentStock] = useState(0)
  const [yardStockData, setYardStockData] = useState<Record<string, Array<{productName: string, stock: number}>>>({})
  const [showStockModal, setShowStockModal] = useState(false)
  const [allStockData, setAllStockData] = useState<Array<{productName: string, totalStock: number, yards: Array<{yardName: string, yardCode: string, stock: number}>}>>([])
  const [productStock, setProductStock] = useState<Record<string, number>>({})
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})
  const [filteredSuggestions, setFilteredSuggestions] = useState<Record<string, string[]>>({})
  
  const containerNumbers = [
    "2685504", "2685582", "2687693", "2687796", "2688220", "2693818", "2688853", "2628263", "1685417", "2678773",
    "2686450", "2699950", "2679846", "2697726", "2682794", "2681458", "2697963", "2685474", "2678480", "2628176",
    "2680153", "2694218", "2692262", "2693309", "2697074", "2698640", "2677798", "2695066", "2685556", "2699272",
    "2692787", "2628411", "2684523", "2684930", "2699570", "2680301", "2686547", "2688863", "2695699", "2685788",
    "2696519", "2697264", "2677890", "2691409", "2685670", "2681102", "1689541", "1612093", "1686305", "2694603"
  ]
  
  const supabase = getSupabaseClient()

  // Audit logging function
  const logAuditTrail = async (action: string, oldValues: any, newValues: any, organizationId: string, newPickupIds: string[]) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      if (!session) return

      // Log audit trail for each new pickup record
      for (const recordId of newPickupIds) {
        await supabase
          .from("audit_logs")
          .insert({
            table_name: "pickup",
            record_id: recordId,
            action: action,
            old_values: oldValues,
            new_values: newValues,
            changed_by: session.user.id,
            organization_id: organizationId
          })
      }
    } catch (error) {
      console.error("Error logging audit trail:", error)
      // Don't throw error - audit logging shouldn't break the main operation
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user && pickupId) {
      loadData()
    }
  }, [user, authLoading, pickupId])

  const loadData = async () => {
    try {
      setInitialLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single()

      if (!userData) {
        console.error("User organization not found")
        return
      }

      // Get organization details to access coal_yard_names
      const { data: orgData } = await supabase
        .from("organizations")
        .select("coal_yard_names")
        .eq("id", (userData as any).organization_id)
        .single()

      if (!orgData?.coal_yard_names) {
        console.error("Organization coal yard names not found")
        return
      }

      // Get pickup data
      const { data: pickups, error: pickupError } = await supabase
        .from("pickup")
        .select(`
          *,
          product:products (*)
        `)
        .eq("id", pickupId)
        .eq("organization_id", (userData as any).organization_id)

      if (pickupError || !pickups || pickups.length === 0) {
        console.error("Pickup not found:", pickupError)
        router.push("/dashboard")
        return
      }

      setPickupRecords(pickups as any[])
      
      // Use data from the first record since they should all have same base info
      const firstRecord = pickups[0] as any
      setPickupDate(firstRecord.pickup_date || new Date().toISOString().split("T")[0])
      setWeighbridgeSlip(firstRecord.weighbridge_slip || "")
      setNotes(firstRecord.notes || "")
      setSelectedYard(firstRecord.coal_yard_id || "")

      // Group records by container number and convert to containers format
      const containerMap = new Map<string, ContainerEntry>()
      
      ;(pickups as any[]).forEach((record: any, index: number) => {
        const containerNumber = record.container_number || ""
        
        if (!containerMap.has(containerNumber)) {
          containerMap.set(containerNumber, {
            id: `container-${containerNumber}`,
            containerNumber: containerNumber,
            products: []
          })
        }
        
        const container = containerMap.get(containerNumber)!
        container.products.push({
          id: `product-${record.id}`,
          productId: record.product_id || "",
          weight: (record.weight_tons || 0).toString(),
          pickupRecordId: record.id || ""
        })
      })

      const containersArray = Array.from(containerMap.values())
      setContainers(containersArray)
      setOriginalContainers(JSON.parse(JSON.stringify(containersArray))) // Deep copy for comparison

      // Load products and yards
      const [productsResult, allYardsResult] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        
        // Get yards for this organization based on coal_yard_names array
        supabase
          .from("coal_yards")
          .select("*")
          .in("name", orgData.coal_yard_names as string[])
          .order("name")
      ])

      if (productsResult.data) setProducts(productsResult.data as any)
      
      if (allYardsResult.data && allYardsResult.data.length > 0) {
        const yards = allYardsResult.data as any
        const products = productsResult.data as any
        setCoalYards(yards)
        
        // Load current stock for the pickup's yard
        const pickupYardId = firstRecord.coal_yard_id
        if (pickupYardId) {
          loadCurrentStock(pickupYardId)
        }
        
        // Load stock data for all yards efficiently (needed for yard cards display)
        loadAllYardStockOptimized(yards, products, (userData as any).organization_id)
      }

      await loadAllStockData((userData as any).organization_id)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setInitialLoading(false)
    }
  }

  const loadCurrentStock = async (yardId: string) => {
    if (!user) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return

      const { data: userData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single()

      if (!userData) return

      const { data: stockData } = await supabase
        .from("stock")
        .select(`
          current_weight_tons,
          product_id,
          product:products(name)
        `)
        .eq("coal_yard_id", yardId)
        .eq("organization_id", (userData as any).organization_id)

      if (stockData) {
        const totalStock = (stockData as any[]).reduce((sum: number, stock: any) => sum + Number(stock.current_weight_tons), 0)
        setCurrentStock(totalStock)

        const stockByProduct = (stockData as any[]).map((stock: any) => ({
          productName: stock.product?.name || 'Unknown',
          stock: Number(stock.current_weight_tons)
        }))
        
        setYardStockData(prev => ({
          ...prev,
          [yardId]: stockByProduct
        }))

        // Update product stock for individual product display
        const productStockMap: Record<string, number> = {}
        ;(stockData as any[]).forEach((stock: any) => {
          if (stock.product_id) {
            productStockMap[stock.product_id] = Number(stock.current_weight_tons)
          }
        })
        setProductStock(productStockMap)
      }
    } catch (error) {
      console.error("Error loading current stock:", error)
    }
  }

  const loadAllYardStockOptimized = async (yards: CoalYard[], products: Product[], organizationId: string) => {
    try {
      // Get all stock data for this organization in a single query
      const { data: allStockData } = await supabase
        .from("stock")
        .select(`
          coal_yard_id,
          product_id,
          current_weight_tons
        `)
        .eq("organization_id", organizationId)

      const stockData: Record<string, Array<{productName: string, stock: number}>> = {}

      // Initialize all yards
      yards.forEach((yard) => {
        stockData[yard.id] = []
      })

      // Group stock data by yard
      allStockData?.forEach((stock: any) => {
        const product = products.find(p => p.id === stock.product_id)
        if (product && stockData[stock.coal_yard_id]) {
          stockData[stock.coal_yard_id].push({
            productName: product.name,
            stock: Number(stock.current_weight_tons)
          })
        }
      })

      // Sort products within each yard
      Object.keys(stockData).forEach(yardId => {
        stockData[yardId].sort((a, b) => a.productName.localeCompare(b.productName))
      })

      setYardStockData(stockData)
    } catch (error) {
      console.error("Error loading yard stock data:", error)
    }
  }

  const loadAllStockData = async (organizationId: string) => {
    try {
      const { data: stockData } = await supabase
        .from("stock")
        .select(`
          current_weight_tons,
          product:products(name),
          coal_yard:coal_yards(name, code)
        `)
        .eq("organization_id", organizationId)
        .gt("current_weight_tons", 0)

      if (stockData) {
        const productStockMap = new Map()

        ;(stockData as any[]).forEach((stock: any) => {
          const productName = stock.product?.name || 'Unknown'
          if (!productStockMap.has(productName)) {
            productStockMap.set(productName, {
              productName,
              totalStock: 0,
              yards: []
            })
          }

          const productData = productStockMap.get(productName)
          productData.totalStock += Number(stock.current_weight_tons)
          productData.yards.push({
            yardName: stock.coal_yard?.name || 'Unknown',
            yardCode: stock.coal_yard?.code || 'N/A',
            stock: Number(stock.current_weight_tons)
          })
        })

        setAllStockData(Array.from(productStockMap.values()))
      }
    } catch (error) {
      console.error("Error loading all stock data:", error)
    }
  }

  const addContainer = () => {
    const newContainer: ContainerEntry = {
      id: Date.now().toString(),
      containerNumber: "",
      products: [{ id: `${Date.now()}-0`, productId: "", weight: "", pickupRecordId: "" }],
    }
    setContainers([...containers, newContainer])
  }

  const removeContainer = (containerId: string) => {
    if (containers.length > 1) {
      setContainers(containers.filter((c) => c.id !== containerId))
    }
  }

  const updateContainer = (containerId: string, field: string, value: string) => {
    setContainers(containers.map((c) => (c.id === containerId ? { ...c, [field]: value } : c)))
  }

  const addProductToContainer = (containerId: string) => {
    setContainers(
      containers.map((c) =>
        c.id === containerId
          ? { ...c, products: [...c.products, { id: `${Date.now()}-${c.products.length}`, productId: "", weight: "", pickupRecordId: "" }] }
          : c,
      ),
    )
  }

  const removeProductFromContainer = (containerId: string, productId: string) => {
    setContainers(
      containers.map((c) =>
        c.id === containerId
          ? { ...c, products: c.products.filter((p) => p.id !== productId) }
          : c,
      ),
    )
  }

  const updateProductInContainer = (containerId: string, productId: string, field: string, value: string) => {
    setContainers(
      containers.map((c) =>
        c.id === containerId
          ? {
              ...c,
              products: c.products.map((p) => (p.id === productId ? { ...p, [field]: value } : p)),
            }
          : c,
      ),
    )
  }

  const handleContainerNumberChange = (containerId: string, value: string) => {
    // Remove any non-numeric characters and any "SARU" prefix if accidentally typed
    const numericValue = value.replace(/[^\d]/g, "")

    updateContainer(containerId, "containerNumber", numericValue)

    if (numericValue.length > 0) {
      // Filter suggestions based on the numeric part
      const filtered = containerNumbers.filter((num) => num.includes(numericValue)).slice(0, 5)

      setFilteredSuggestions((prev) => ({
        ...prev,
        [containerId]: filtered,
      }))
      setShowSuggestions((prev) => ({
        ...prev,
        [containerId]: filtered.length > 0,
      }))
    } else {
      // Show first 5 options when input is empty
      setFilteredSuggestions((prev) => ({
        ...prev,
        [containerId]: containerNumbers.slice(0, 5),
      }))
      setShowSuggestions((prev) => ({
        ...prev,
        [containerId]: true,
      }))
    }
  }

  const selectContainerNumber = (containerId: string, number: string) => {
    updateContainer(containerId, "containerNumber", number)
    setShowSuggestions((prev) => ({
      ...prev,
      [containerId]: false,
    }))
  }

  const handleUpdatePickup = async () => {
    if (!user || pickupRecords.length === 0) return

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

      // First, reverse the stock changes from the original pickup records
      for (const record of pickupRecords) {
        const { error: reverseStockError } = await supabase.rpc("update_stock_on_delivery", {
          p_coal_yard_id: record.coal_yard_id,
          p_product_id: record.product_id,
          p_organization_id: userData.organization_id,
          p_weight_tons: record.weight_tons,
        })

        if (reverseStockError) {
          console.error("Error reversing original pickup stock:", reverseStockError)
          throw new Error(`Failed to reverse original pickup stock: ${reverseStockError.message}`)
        }
      }

      // Then delete all existing pickup records for this pickup
      const pickupRecordIds = pickupRecords.map(r => r.id)
      const { error: deleteError } = await supabase
        .from("pickup")
        .delete()
        .in("id", pickupRecordIds)

      if (deleteError) {
        console.error("Error deleting pickup records:", deleteError)
        throw new Error(`Failed to delete pickup records: ${deleteError.message}`)
      }

      // Create new pickup records for each container-product combination
      const newPickupIds: string[] = []
      for (const container of containers) {
        if (container.containerNumber && container.products.some(p => p.productId && p.weight)) {
          for (const product of container.products) {
            if (product.productId && product.weight) {
              const { data: insertedData, error: insertError } = await supabase
                .from("pickup")
                .insert({
                  user_id: userData.user_id,
                  coal_yard_id: selectedYard,
                  organization_id: userData.organization_id,
                  pickup_date: pickupDate,
                  weighbridge_slip: weighbridgeSlip || null,
                  container_number: container.containerNumber,
                  product_id: product.productId,
                  weight_tons: Number.parseFloat(product.weight),
                  notes: notes || null,
                })
                .select('id')
                .single()

              if (insertError) {
                console.error("Error inserting pickup record:", insertError)
                throw new Error(`Failed to save pickup record: ${insertError.message}`)
              }

              if (insertedData && (insertedData as any).id) {
                newPickupIds.push((insertedData as any).id)
              }

              // Update stock using RPC function
              const { error: stockError } = await supabase.rpc("update_stock_on_pickup", {
                p_coal_yard_id: selectedYard,
                p_product_id: product.productId,
                p_organization_id: userData.organization_id,
                p_weight_tons: Number.parseFloat(product.weight),
              })

              if (stockError) {
                console.error("Error updating stock:", stockError)
                throw new Error(`Failed to update stock: ${stockError.message}`)
              }
            }
          }
        }
      }

      // Create detailed audit trail comparing original vs new data
      const originalData: any = {
        pickup_date: pickupRecords[0]?.pickup_date || pickupDate,
        weighbridge_slip: pickupRecords[0]?.weighbridge_slip || weighbridgeSlip,
        notes: pickupRecords[0]?.notes || notes,
        coal_yard_id: pickupRecords[0]?.coal_yard_id || selectedYard,
      }

      const newData: any = {
        pickup_date: pickupDate,
        weighbridge_slip: weighbridgeSlip,
        notes: notes,
        coal_yard_id: selectedYard,
      }

      // Add detailed container and product information
      originalContainers.forEach((container, containerIndex) => {
        container.products.forEach((product, productIndex) => {
          const key = `container_${containerIndex + 1}_product_${productIndex + 1}`
          
          // Find the product name
          const productInfo = products.find(p => p.id === product.productId)
          const productName = productInfo?.name || 'Unknown Product'
          
          originalData[`${key}_container_number`] = container.containerNumber
          originalData[`${key}_product`] = productName
          originalData[`${key}_weight_tons`] = product.weight
        })
      })

      containers.forEach((container, containerIndex) => {
        container.products.forEach((product, productIndex) => {
          const key = `container_${containerIndex + 1}_product_${productIndex + 1}`
          
          // Find the product name
          const productInfo = products.find(p => p.id === product.productId)
          const productName = productInfo?.name || 'Unknown Product'
          
          newData[`${key}_container_number`] = container.containerNumber
          newData[`${key}_product`] = productName
          newData[`${key}_weight_tons`] = product.weight
        })
      })

      await logAuditTrail("UPDATE", originalData, newData, userData.organization_id as string, newPickupIds)

      console.log("Pickup updated successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating pickup:", error)
      alert(`Error: ${(error as any)?.message || "Failed to update pickup"}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pickup...</p>
        </div>
      </div>
    )
  }

  if (pickupRecords.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pickup not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="rounded-full" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Pickup</h1>
          <Button variant="ghost" className="rounded-full" onClick={() => setShowStockModal(true)}>
            <DocumentText size={56} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-48 rounded-[24px]">
        {/* Pickup Details Card */}
        <Card className="rounded-[32px]">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-0">Pickup details</h3>

            <div className="space-y-4">
              {/* Yard Selection */}
              <div>
                <Label className="text-md text-gray-600 mb-3 block">Select the yard</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {coalYards.map((yard) => (
                    <button
                      key={yard.id}
                      onClick={() => {
                        setSelectedYard(yard.id)
                        loadCurrentStock(yard.id)
                      }}
                      className={`relative rounded-[32px] border-2 p-3 transition-all ${
                        selectedYard === yard.id ? "border-yellow-500 bg-yellow-50" : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {selectedYard === yard.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                      <Image
                        src={yard.image_url || "/placeholder.svg?height=80&width=120&text=" + yard.code}
                        alt={yard.name}
                        width={120}
                        height={80}
                        className="w-full h-48 object-cover rounded-[24px] mb-2"
                      />
                      <p className="font-semibold text-md">{yard.code}</p>
                      
                      {/* Stock Information */}
                      <div className="mt-2 text-xs text-gray-600">
                        {yardStockData[yard.id] && yardStockData[yard.id].length > 0 ? (
                          <div className="space-y-1">
                            {yardStockData[yard.id].map((stock, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{stock.productName}</span>
                                <span className="font-medium">{stock.stock.toLocaleString()}t</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No stock</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Pickup Date</Label>
                <div className="relative mt-1">
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="pr-10 rounded-full border-gray-300"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <Calendar1 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Weighbridge Slip (Optional)</Label>
                <div className="relative mt-1">
                  <Input
                    value={weighbridgeSlip}
                    onChange={(e) => setWeighbridgeSlip(e.target.value)}
                    placeholder="G67-3748-2930"
                    className="pr-10 rounded-full border-gray-300"
                  />
                  <DocumentText size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Additional Info</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add Any Additional Notes (Optional)"
                  className="mt-1 rounded-[16px] border-gray-300 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Container Entries */}
        {containers.map((container, containerIndex) => (
          <Card key={container.id} className="rounded-[32px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-0">
                <h3 className="font-semibold text-lg">Container {containerIndex + 1}</h3>
                {containers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContainer(container.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Container Number</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">SARU</span>
                    <Input
                      value={container.containerNumber}
                      onChange={(e) => handleContainerNumberChange(container.id, e.target.value)}
                      onFocus={() => {
                        // Show suggestions when focusing on empty input
                        if (!container.containerNumber) {
                          setFilteredSuggestions((prev) => ({
                            ...prev,
                            [container.id]: containerNumbers.slice(0, 5),
                          }))
                          setShowSuggestions((prev) => ({
                            ...prev,
                            [container.id]: true,
                          }))
                        }
                      }}
                      onBlur={() => {
                        // Hide suggestions after a short delay to allow selection
                        setTimeout(() => {
                          setShowSuggestions((prev) => ({
                            ...prev,
                            [container.id]: false,
                          }))
                        }, 200)
                      }}
                      placeholder="2685504"
                      className="pl-16 pr-10 rounded-full border-gray-300"
                    />
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    {/* Suggestions Dropdown */}
                    {showSuggestions[container.id] && filteredSuggestions[container.id]?.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredSuggestions[container.id].map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                            onMouseDown={(e) => {
                              e.preventDefault() // Prevent input blur
                              selectContainerNumber(container.id, suggestion)
                            }}
                          >
                            <span className="text-gray-500">SARU</span>
                            <span className="font-medium">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Products in this container */}
                <div>
                  <Label className="text-sm text-gray-600 mb-4 block">Select products for this container</Label>
                  <p className="text-xs text-gray-500 mb-4">Select the products that are in this container.</p>

                  <div className="space-y-4">
                    {container.products.map((product, productIndex) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Product {productIndex + 1}</h4>
                          {container.products.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProductFromContainer(container.id, product.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-lg font-semibold text-gray-800 mt-8 block">Product Type</Label>
                            <div className="space-y-3">
                              {products.map((productOption, index) => {
                                const stockAmount = productStock[productOption.id] || 0
                                
                                return (
                                  <div
                                    key={productOption.id}
                                    onClick={() => updateProductInContainer(container.id, product.id, "productId", productOption.id)}
                                    className={`flex items-center justify-between p-4 border-2 rounded-[24px] transition-all cursor-pointer ${
                                      product.productId === productOption.id
                                                                                  ? "border-yellow-500 bg-yellow-50"
                                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                                          product.productId === productOption.id ? "border-yellow-500 bg-yellow-500" : "border-gray-300"
                                        }`}
                                      >
                                        {product.productId === productOption.id && <div className="w-3 h-3 bg-white rounded-full" />}
                                      </div>

                                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                                        <Image
                                          src={productOption.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                          alt={productOption.name}
                                          width={48}
                                          height={48}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      </div>

                                      <div>
                                        <p className="font-semibold text-gray-800 text-lg">{productOption.name}</p>
                                        <p className="text-sm text-gray-500">Stockpile {index + 1}</p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className={`text-xl font-bold ${stockAmount === 0 ? "text-red-500" : "text-gray-800"}`}>
                                        {stockAmount.toLocaleString()} t
                                      </p>
                                      {stockAmount === 0 && <p className="text-xs text-red-500">Out of stock</p>}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm text-gray-600">Weight for this product</Label>
                            <div className="relative mt-1">
                              <Input
                                type="number"
                                step="any"
                                value={product.weight}
                                onChange={(e) => updateProductInContainer(container.id, product.id, "weight", e.target.value)}
                                placeholder="1,000"
                                className="pr-16 rounded-full border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Weight className="h-4 w-4 text-gray-400" />
                                <span className="text-md text-gray-500">t</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="font-semibold">{currentStock.toLocaleString()} t</p>
          </div>
          <Button
            onClick={handleUpdatePickup}
            disabled={
              loading ||
              !selectedYard ||
              containers.some((c) => !c.containerNumber || c.products.some((p) => !p.productId || !p.weight))
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold px-8 py-3 rounded-full"
          >
            {loading ? "Updating..." : "UPDATE PICKUP"}
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>

      {/* Stock Overview Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="!fixed !inset-x-0 !bottom-0 !top-auto !left-0 !right-0 !transform-none !translate-x-0 !translate-y-0 mx-0 max-w-none !w-screen h-auto max-h-[85vh] rounded-t-3xl !rounded-b-none border-0 p-0 m-0 animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full [&>button]:hidden">
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-800">Total available stock</DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Details of all outgoing coal shipments.
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowStockModal(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </DialogHeader>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {allStockData.map((productData, index) => {
                  const maxStock = Math.max(...allStockData.map(p => p.totalStock))
                  const percentage = maxStock > 0 ? (productData.totalStock / maxStock) * 100 : 0
                  const product = products.find(p => p.name === productData.productName)

                  return (
                    <div key={productData.productName} className="flex flex-col items-center text-center">
                      {/* Weight Display */}
                      <div className="text-lg font-bold text-gray-800 mb-3">
                        {productData.totalStock.toLocaleString()} t
                      </div>

                      {/* Vertical Bar */}
                      <div className="w-16 h-32 bg-gray-200 rounded-lg flex items-end mb-3">
                        <div
                          className="w-full bg-gray-800 rounded-lg transition-all duration-300"
                          style={{ height: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>

                      {/* Product Image */}
                      <div className="w-12 h-12 mb-3">
                        <Image
                          src={product?.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                          alt={productData.productName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Name and Stockpile */}
                      <div className="text-center">
                        <p className="font-semibold text-gray-800 text-sm">{productData.productName}</p>
                        <p className="text-xs text-gray-500">Stockpile {index + 1}</p>
                      </div>

                      {/* Yard Breakdown */}
                      {productData.yards.length > 0 && (
                        <div className="mt-3 w-full">
                          <div className="text-xs text-gray-500 mb-2">Available at:</div>
                          <div className="space-y-1">
                            {productData.yards.map((yard, yardIndex) => (
                              <div key={yardIndex} className="flex justify-between text-xs">
                                <span className="text-gray-600 truncate">{yard.yardCode}</span>
                                <span className="font-medium text-gray-800">{yard.stock.toLocaleString()}t</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {productData.totalStock === 0 && (
                        <div className="mt-3 text-xs text-gray-400">No stock available</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 