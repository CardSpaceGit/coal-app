"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Calendar, Weight, FileText, X } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { CoalYard, Product } from "@/types/database"
import Image from "next/image"

interface DeliveryData {
  id: string
  delivery_date: string
  weighbridge_slip: string
  weight_tons: number | string
  product_id: string
  coal_yard_id: string
  notes: string | null
}

export default function EditDeliveryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const deliveryId = params.id as string
  
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentStock, setCurrentStock] = useState(0)
  const [yardStockData, setYardStockData] = useState<Record<string, Array<{productName: string, stock: number}>>>({})
  const [showStockModal, setShowStockModal] = useState(false)
  const [allStockData, setAllStockData] = useState<Array<{productName: string, totalStock: number, yards: Array<{yardName: string, yardCode: string, stock: number}>}>>([])
  const [productStock, setProductStock] = useState<Record<string, number>>({})
  
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }
    if (user && deliveryId) {
      loadData()
    }
  }, [user, authLoading, deliveryId])

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

      // Load the specific delivery data
      const { data: delivery, error: deliveryError } = await supabase
        .from("deliveries")
        .select("*")
        .eq("id", deliveryId)
        .eq("organization_id", (userData as any).organization_id)
        .single()

      if (deliveryError || !delivery) {
        console.error("Delivery not found:", deliveryError)
        router.push("/dashboard")
        return
      }

      setDeliveryData(delivery as any)

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

      if (productsResult.data) setProducts(productsResult.data as unknown as Product[])
      
      if (allYardsResult.data && allYardsResult.data.length > 0) {
        setCoalYards(allYardsResult.data as unknown as CoalYard[])
        loadCurrentStock((delivery as any).coal_yard_id as string)
      }

      await loadAllStockData((userData as any).organization_id as string)
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
        const totalStock = stockData.reduce((sum: number, stock: any) => sum + Number(stock.current_weight_tons), 0)
        setCurrentStock(totalStock)

        const stockByProduct = stockData.map((stock: any) => ({
          productName: stock.product?.name || 'Unknown',
          stock: Number(stock.current_weight_tons)
        }))
        
        setYardStockData(prev => ({
          ...prev,
          [yardId]: stockByProduct
        }))

        // Update product stock for individual product display
        const productStockMap: Record<string, number> = {}
        stockData.forEach((stock: any) => {
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

        stockData.forEach((stock: any) => {
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

  const updateDelivery = (field: keyof DeliveryData, value: string | number) => {
    if (!deliveryData) return
    setDeliveryData({ ...deliveryData, [field]: value })
  }

  const handleUpdateDelivery = async () => {
    if (!user || !deliveryData) return

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

      // Update delivery record
      const { error: deliveryError } = await supabase
        .from("deliveries")
        .update({
          coal_yard_id: deliveryData.coal_yard_id,
          product_id: deliveryData.product_id,
          delivery_date: deliveryData.delivery_date,
          weighbridge_slip: deliveryData.weighbridge_slip,
          weight_tons: typeof deliveryData.weight_tons === 'string' ? Number.parseFloat(deliveryData.weight_tons) : deliveryData.weight_tons,
          notes: deliveryData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliveryId)
        .eq("organization_id", (userData as any).organization_id)

      if (deliveryError) {
        console.error("Error updating delivery:", deliveryError)
        throw new Error(`Failed to update delivery: ${deliveryError.message}`)
      }

      console.log("Delivery updated successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating delivery:", error)
      alert(`Error: ${(error as any)?.message || "Failed to update delivery"}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery...</p>
        </div>
      </div>
    )
  }

  if (!deliveryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Delivery not found</p>
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Edit Delivery</h1>
          <Button variant="ghost" onClick={() => setShowStockModal(true)}>
            <FileText className="h-14 w-14" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Delivery Entry */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Delivery details</h3>
            </div>

            <div className="space-y-4">
              {/* Yard Selection */}
              <div>
                <Label className="text-sm text-gray-600 mb-3 block">Select the yard</Label>
                <div className="grid grid-cols-2 gap-3">
                  {coalYards.map((yard) => (
                    <button
                      key={yard.id}
                      onClick={() => {
                        updateDelivery("coal_yard_id", yard.id)
                        loadCurrentStock(yard.id)
                      }}
                      className={`relative rounded-lg border-2 p-3 transition-all ${
                        deliveryData.coal_yard_id === yard.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      {deliveryData.coal_yard_id === yard.id && (
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
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={deliveryData.delivery_date}
                    onChange={(e) => updateDelivery("delivery_date", e.target.value)}
                    className="pl-10 rounded-full border-gray-300"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Weighbridge Slip</Label>
                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={deliveryData.weighbridge_slip}
                    onChange={(e) => updateDelivery("weighbridge_slip", e.target.value)}
                    placeholder="G67-3748-2930"
                    className="pl-10 rounded-full border-gray-300"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Weight</Label>
                <div className="relative mt-1">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={deliveryData.weight_tons}
                    onChange={(e) => updateDelivery("weight_tons", e.target.value)}
                    placeholder="2,000"
                    className="pl-10 rounded-full border-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">t</span>
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
                        onClick={() => updateDelivery("product_id", product.id)}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all cursor-pointer ${
                          deliveryData.product_id === product.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                              deliveryData.product_id === product.id ? "border-green-500 bg-green-500" : "border-gray-300"
                            }`}
                          >
                            {deliveryData.product_id === product.id && <div className="w-3 h-3 bg-white rounded-full" />}
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
                  value={deliveryData.notes || ""}
                  onChange={(e) => updateDelivery("notes", e.target.value)}
                  placeholder="Add Any Additional Notes (Optional)"
                  className="mt-1 rounded-lg border-gray-300 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="font-semibold">{currentStock.toLocaleString()} t</p>
          </div>
          <Button
            onClick={handleUpdateDelivery}
            disabled={loading || !deliveryData.weighbridge_slip || !deliveryData.weight_tons || !deliveryData.product_id || !deliveryData.coal_yard_id}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold px-8 py-3 rounded-full"
          >
            {loading ? "Updating..." : "UPDATE DELIVERY"}
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
                  <p className="text-gray-600 mt-1">Details of all outgoing coal shipments.</p>
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