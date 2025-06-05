"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { Calendar1, Weight, DocumentText } from "iconsax-reactjs"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { CoalYard, Product } from "@/types/database"
import Image from "next/image"

interface DeliveryEntry {
  id: string
  deliveryDate: string
  weighbridgeSlip: string
  weight: string
  productId: string
  yardId: string
  notes: string
}

export default function DeliveriesPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedYard, setSelectedYard] = useState<string>("")
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([
    {
      id: "1",
      deliveryDate: new Date().toISOString().split("T")[0],
      weighbridgeSlip: "",
      weight: "",
      productId: "",
      yardId: "",
      notes: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [currentStock, setCurrentStock] = useState(0)
  const [yardStockData, setYardStockData] = useState<Record<string, Array<{productName: string, stock: number}>>>({})
  const [showStockModal, setShowStockModal] = useState(false)
  const [allStockData, setAllStockData] = useState<Array<{productName: string, totalStock: number, yards: Array<{yardName: string, yardCode: string, stock: number}>}>>([])
  const [productStock, setProductStock] = useState<Record<string, number>>({})
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user) {
      loadData()
    }
  }, [user, authLoading])

  const loadData = async () => {
    try {
      console.log("🔍 Deliveries: Starting loadData...")
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        console.log("❌ Deliveries: No session found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("✅ Deliveries: Session found:", session.user.id)

      const { data: userData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single()

      if (!userData) {
        console.error("❌ Deliveries: User organization not found")
        return
      }

      console.log("✅ Deliveries: User data:", userData)

      // Get organization details to access coal_yard_names
      const { data: orgData } = await supabase
        .from("organizations")
        .select("coal_yard_names")
        .eq("id", (userData as any).organization_id)
        .single()

      if (!orgData?.coal_yard_names) {
        console.error("❌ Deliveries: Organization coal yard names not found")
        return
      }

      console.log("✅ Deliveries: Organization coal yard names:", orgData.coal_yard_names)

      // Load products and yards in a single optimized query
      const [productsResult, allYardsResult] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        
        // Get yards for this organization based on coal_yard_names array
        supabase
          .from("coal_yards")
          .select("*")
          .in("name", orgData.coal_yard_names as string[])
          .order("name")
      ])

      console.log("✅ Deliveries: Products result:", productsResult)
      console.log("✅ Deliveries: Yards result:", allYardsResult)

      if (productsResult.data) setProducts(productsResult.data as unknown as Product[])
      
      if (allYardsResult.data && allYardsResult.data.length > 0) {
        console.log("✅ Deliveries: Setting coal yards:", allYardsResult.data)
        const yards = allYardsResult.data as unknown as CoalYard[]
        setCoalYards(yards)

        // Set first yard as default for the first delivery
        setDeliveries((prev) =>
          prev.map((delivery, index) => (index === 0 ? { ...delivery, yardId: yards[0].id } : delivery)),
        )
        setSelectedYard(yards[0].id)
        loadCurrentStock(yards[0].id)
      } else {
        console.log("❌ Deliveries: No yards data found or empty array")
      }

      // Load stock data for all yards efficiently
      if (allYardsResult.data && allYardsResult.data.length > 0 && productsResult.data) {
        const yards = allYardsResult.data as unknown as CoalYard[]
        const products = productsResult.data as unknown as Product[]
        loadAllYardStockOptimized(yards, products, (userData as any).organization_id)
        loadAllStockOverview(yards, products, (userData as any).organization_id)
      }
    } catch (error) {
      console.error("❌ Deliveries: Error loading data:", error)
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

  const loadAllStockOverview = async (yards: CoalYard[], products: Product[], organizationId: string) => {
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

      const productStockMap: Record<string, {totalStock: number, yards: Array<{yardName: string, yardCode: string, stock: number}>}> = {}

      // Initialize all products
      products.forEach(product => {
        productStockMap[product.name] = {
          totalStock: 0,
          yards: []
        }
      })

      // Group stock data by product
      allStockData?.forEach((stock: any) => {
        const product = products.find(p => p.id === stock.product_id)
        const yard = yards.find(y => y.id === stock.coal_yard_id)
        
        if (product && yard) {
          const stockAmount = Number(stock.current_weight_tons)
          productStockMap[product.name].totalStock += stockAmount
          
          if (stockAmount > 0) {
            productStockMap[product.name].yards.push({
              yardName: yard.name,
              yardCode: yard.code,
              stock: stockAmount
            })
          }
        }
      })

      // Convert to array format
      const stockOverview = Object.entries(productStockMap).map(([productName, data]) => ({
        productName,
        totalStock: data.totalStock,
        yards: data.yards.sort((a, b) => a.yardName.localeCompare(b.yardName))
      }))

      setAllStockData(stockOverview.sort((a, b) => a.productName.localeCompare(b.productName)))
    } catch (error) {
      console.error("Error loading stock overview:", error)
    }
  }

  const addDelivery = () => {
    const newDelivery: DeliveryEntry = {
      id: Date.now().toString(),
      deliveryDate: new Date().toISOString().split("T")[0],
      weighbridgeSlip: "",
      weight: "",
      productId: "",
      yardId: coalYards.length > 0 ? coalYards[0].id : "",
      notes: "",
    }
    setDeliveries([...deliveries, newDelivery])
  }

  const removeDelivery = (id: string) => {
    if (deliveries.length > 1) {
      setDeliveries(deliveries.filter((d) => d.id !== id))
    }
  }

  const updateDelivery = (id: string, field: keyof DeliveryEntry, value: string) => {
    setDeliveries(deliveries.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const handleUpdateStock = async () => {
    if (!user) return

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

      // Insert deliveries and update stock
      for (const delivery of deliveries) {
        if (delivery.weighbridgeSlip && delivery.weight && delivery.productId && delivery.yardId) {
          // Insert delivery record
          const { error: deliveryError } = await supabase.from("deliveries").insert({
            user_id: userData.user_id,
            coal_yard_id: delivery.yardId,
            product_id: delivery.productId,
            delivery_date: delivery.deliveryDate,
            weighbridge_slip: delivery.weighbridgeSlip,
            weight_tons: Number.parseFloat(delivery.weight),
            notes: delivery.notes || null,
            organization_id: userData.organization_id,
          })

          if (deliveryError) {
            console.error("Error inserting delivery:", deliveryError)
            throw new Error(`Failed to save delivery: ${deliveryError.message}`)
          }

          // Update stock using RPC function
          const { error: stockError } = await supabase.rpc("update_stock_on_delivery", {
            p_coal_yard_id: delivery.yardId,
            p_product_id: delivery.productId,
            p_organization_id: userData.organization_id,
            p_weight_tons: Number.parseFloat(delivery.weight),
          })

          if (stockError) {
            console.error("Error updating stock:", stockError)
            throw new Error(`Failed to update stock: ${stockError.message}`)
          }

          console.log(`Successfully updated stock for product ${delivery.productId} with ${delivery.weight}t`)
        }
      }

      console.log("All deliveries processed successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating stock:", error)
      alert(`Error: ${(error as any)?.message || "Failed to update stock"}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedYardData = coalYards.find((y) => y.id === selectedYard)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Deliveries</h1>
          <Button variant="ghost" onClick={() => setShowStockModal(true)}>
            <DocumentText size={56} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Delivery Entries */}
        {deliveries.map((delivery, index) => (
          <Card key={delivery.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Delivery details</h3>
                {deliveries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDelivery(delivery.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Yard Selection for this delivery */}
                <div>
                  <Label className="text-sm text-gray-600 mb-3 block">Select the yard</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {coalYards.map((yard) => (
                      <button
                        key={yard.id}
                        onClick={() => {
                          updateDelivery(delivery.id, "yardId", yard.id)
                          loadCurrentStock(yard.id)
                        }}
                        className={`relative rounded-lg border-2 p-3 transition-all ${
                          delivery.yardId === yard.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
                        }`}
                      >
                        {delivery.yardId === yard.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                        <Image
                          src={yard.image_url || "/placeholder.svg?height=80&width=120&text=" + yard.code}
                          alt={yard.name}
                          width={120}
                          height={80}
                          className="w-full h-16 object-cover rounded mb-2"
                        />
                        <p className="font-semibold text-sm">{yard.code}</p>
                        
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
                  <Label className="text-sm text-gray-600">Delivery Date</Label>
                  <div className="relative mt-1">
                    <Input
                      type="date"
                      value={delivery.deliveryDate}
                      onChange={(e) => updateDelivery(delivery.id, "deliveryDate", e.target.value)}
                      className="pr-10 rounded-full border-gray-300"
                    />
                    <Calendar1 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Weighbridge Slip</Label>
                  <div className="relative mt-1">
                    <Input
                      value={delivery.weighbridgeSlip}
                      onChange={(e) => updateDelivery(delivery.id, "weighbridgeSlip", e.target.value)}
                      placeholder="G67-3748-2930"
                      className="pr-10 rounded-full border-gray-300"
                    />
                    <DocumentText size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Weight</Label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={delivery.weight}
                      onChange={(e) => updateDelivery(delivery.id, "weight", e.target.value)}
                      placeholder="2,000"
                      className="flex h-10 w-full rounded-full border border-gray-300 bg-background px-3 py-2 pr-16 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Weight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">t</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-4 block">Select products</Label>
                  <p className="text-xs text-gray-500 mb-4">Select the product that was delivered.</p>

                  <div className="space-y-3">
                    {products.map((product, index) => {
                      const stockAmount = productStock[product.id] || 0
                      
                      return (
                        <div
                          key={product.id}
                          onClick={() => updateDelivery(delivery.id, "productId", product.id)}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            delivery.productId === product.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                                delivery.productId === product.id ? "border-green-500 bg-green-500" : "border-gray-300"
                              }`}
                            >
                              {delivery.productId === product.id && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>

                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                              <Image
                                src={product.image_url || "/placeholder.svg?height=48&width=48&text=Coal"}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800 text-lg">{product.name}</p>
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
                  <Label className="text-sm text-gray-600">Additional Info</Label>
                  <Textarea
                    value={delivery.notes}
                    onChange={(e) => updateDelivery(delivery.id, "notes", e.target.value)}
                    placeholder="Add Any Additional Notes (Optional)"
                    className="mt-1 rounded-lg border-gray-300 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Another Delivery Button */}
        <Button
          onClick={addDelivery}
          variant="outline"
          className="w-full h-12 rounded-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          ADD ANOTHER DELIVERY
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="font-semibold">{currentStock.toLocaleString()} t</p>
          </div>
          <Button
            onClick={handleUpdateStock}
            disabled={loading || deliveries.some((d) => !d.weighbridgeSlip || !d.weight || !d.productId || !d.yardId)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold px-8 py-3 rounded-full"
          >
            {loading ? "Updating..." : "UPDATE STOCK"}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
