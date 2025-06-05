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
import { Calendar1, Box, Weight, DocumentText, TickSquare } from "iconsax-reactjs"
import { getSupabaseClient } from "@/lib/supabase"
import type { CoalYard, Product } from "@/types/database"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { createPickup } from "@/app/actions/pickup-actions"

interface ContainerEntry {
  id: string
  containerNumber: string
  selectedProducts: string[]
  weight: string
  notes: string
}

export default function PickupsPage() {
  const [selectedYard, setSelectedYard] = useState<string>("")
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split("T")[0])
  const [weighbridgeSlip, setWeighbridgeSlip] = useState("")
  const [coalYards, setCoalYards] = useState<CoalYard[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [containers, setContainers] = useState<ContainerEntry[]>([
    {
      id: "1",
      containerNumber: "",
      selectedProducts: [],
      weight: "",
      notes: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [outgoingLoad, setOutgoingLoad] = useState(0)
  const [showStockModal, setShowStockModal] = useState(false)
  const [allStockData, setAllStockData] = useState<Array<{productName: string, totalStock: number, yards: Array<{yardName: string, yardCode: string, stock: number}>}>>([])
  const containerNumbers = [
    "2685504",
    "2685582",
    "2687693",
    "2687796",
    "2688220",
    "2693818",
    "2688853",
    "2628263",
    "1685417",
    "2678773",
    "2686450",
    "2699950",
    "2679846",
    "2697726",
    "2682794",
    "2681458",
    "2697963",
    "2685474",
    "2678480",
    "2628176",
    "2680153",
    "2694218",
    "2692262",
    "2693309",
    "2697074",
    "2698640",
    "2677798",
    "2695066",
    "2685556",
    "2699272",
    "2692787",
    "2628411",
    "2684523",
    "2684930",
    "2699570",
    "2680301",
    "2686547",
    "2688863",
    "2695699",
    "2685788",
    "2696519",
    "2697264",
    "2677890",
    "2691409",
    "2685670",
    "2681102",
    "1689541",
    "1612093",
    "1686305",
    "2694603",
    "2694028",
    "2697330",
    "2689464",
    "2691332",
    "2696329",
    "2684122",
    "2694199",
    "2692154",
    "2682496",
    "2678855",
    "2682264",
    "2680174",
    "2628387",
    "2690167",
    "2680343",
    "2677289",
    "2686228",
    "2691395",
    "2697048",
    "2679194",
    "2691944",
    "2693525",
    "2678520",
    "2690892",
    "2688792",
    "2683574",
    "2678006",
    "2697578",
    "2692529",
    "2693675",
    "1614460",
    "2698044",
    "2694542",
    "2627020",
    "1610568",
    "1687301",
    "2683300",
    "2687651",
    "1689290",
    "2698511",
    "2697515",
    "2628284",
    "2686090",
    "1678320",
    "2689401",
    "2681226",
    "2687688",
    "2684924",
    "2698717",
    "2682768",
    "2685900",
    "2678053",
    "2627307",
    "2692196",
    "2678650",
    "2686819",
    "2679110",
    "2692895",
    "2691456",
    "2698701",
    "2686589",
    "2696885",
    "2685957",
    "2690948",
    "2696231",
    "2690298",
    "2685730",
    "2697217",
    "2688160",
    "2682602",
    "2628751",
    "2699776",
    "2686721",
    "2682177",
    "2679912",
    "2682135",
    "2680111",
    "2689736",
    "2697500",
    "2693417",
    "2688010",
    "2694455",
    "2682618",
    "2698445",
    "2628366",
    "2679996",
    "2697290",
    "2697259",
    "2689680",
    "2684755",
    "2679975",
    "2691224",
    "2695657",
    "2627729",
    "2691461",
    "2692961",
    "2692684",
    "2691306",
    "2695528",
    "2699708",
    "2696545",
    "2698912",
    "2696648",
    "2693150",
    "2692323",
    "2678182",
    "1682969",
    "2686613",
    "2692909",
    "2680214",
    "2677340",
    "2686790",
    "2685073",
    "2627380",
    "2689485",
    "2687076",
    "2691142",
    "2699056",
    "2689253",
    "2685324",
    "2695261",
    "2693989",
    "2680256",
    "2686402",
    "2686378",
    "2684781",
    "2682963",
    "2689757",
    "2679002",
    "2695997",
    "2692869",
    "2689649",
    "2684035",
    "2678731",
    "2692766",
    "2628710",
    "2695868",
    "2697006",
    "2680560",
    "2685664",
    "2680620",
    "2694408",
    "2697623",
    "2697670",
    "2627143",
    "2682480",
    "2697177",
    "2682731",
    "2679018",
    "2698980",
    "2694286",
    "2627441",
    "2696421",
    "2680066",
    "2692278",
    "2680549",
    "2687348",
    "1601083",
    "1615678",
    "1685150",
    "2697710",
    "1610336",
    "2679682",
    "1610059",
    "2690444",
    "2698147",
    "2694774",
    "2695220",
    "2682412",
    "2678916",
    "2698759",
    "2686315",
    "2677782",
    "2699518",
    "2699328",
    "2687158",
    "2691250",
    "2696680",
    "2693660",
    "2691517",
    "2691965",
    "2693778",
    "2694820",
  ]
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})
  const [filteredSuggestions, setFilteredSuggestions] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { toast } = useToast()
  const [productStock, setProductStock] = useState<Record<string, number>>({})
  const [yardStockData, setYardStockData] = useState<Record<string, Array<{productName: string, stock: number}>>>({})

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Calculate outgoing load
    const total = containers.reduce((sum, container) => {
      return sum + (Number.parseFloat(container.weight) || 0)
    }, 0)
    setOutgoingLoad(total)
  }, [containers])

  const loadData = async () => {
    try {
      console.log("🔍 Starting loadData...")
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        console.log("❌ No session found, redirecting to login")
        router.push("/login")
        return
      }

      console.log("✅ Session found:", session.user.id)

      const { data: userData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .single()

      if (!userData) {
        console.error("❌ User organization not found")
        return
      }

      console.log("✅ User data:", userData)

      // Get organization details to access coal_yard_names
      const { data: orgData } = await supabase
        .from("organizations")
        .select("coal_yard_names")
        .eq("id", (userData as any).organization_id)
        .single()

      if (!orgData?.coal_yard_names) {
        console.error("❌ Organization coal yard names not found")
        return
      }

      console.log("✅ Organization coal yard names:", orgData.coal_yard_names)

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

      console.log("✅ Products result:", productsResult)
      console.log("✅ Yards result:", allYardsResult)

      if (productsResult.data) setProducts(productsResult.data as unknown as Product[])
      
      if (allYardsResult.data && allYardsResult.data.length > 0) {
        console.log("✅ Setting coal yards:", allYardsResult.data)
        setCoalYards(allYardsResult.data as unknown as CoalYard[])

        // Set default yard
        setSelectedYard((allYardsResult.data[0] as unknown as CoalYard).id)
        loadProductStock((allYardsResult.data[0] as unknown as CoalYard).id)
      } else {
        console.log("❌ No yards data found or empty array")
      }

      // Load stock data for all yards efficiently
      if (allYardsResult.data && allYardsResult.data.length > 0 && productsResult.data) {
        loadAllYardStockOptimized(allYardsResult.data as unknown as CoalYard[], productsResult.data as unknown as Product[], (userData as any).organization_id)
        loadAllStockOverview(allYardsResult.data as unknown as CoalYard[], productsResult.data as unknown as Product[], (userData as any).organization_id)
      }
    } catch (error) {
      console.error("❌ Error loading data:", error)
    }
  }

  const loadProductStock = async (yardId: string) => {
    try {
      // Get organization ID from current user
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

      const { data } = await supabase
        .from("stock")
        .select("product_id, current_weight_tons")
        .eq("coal_yard_id", yardId)
        .eq("organization_id", (userData as any).organization_id)

      const stockMap =
        data?.reduce(
          (acc, stock: any) => {
            acc[stock.product_id] = Number(stock.current_weight_tons)
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      setProductStock(stockMap)
    } catch (error) {
      console.error("Error loading product stock:", error)
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
        .gt("current_weight_tons", 0)

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

  const loadAllStockOverview = async (yards: any[], products: any[], organizationId: string) => {
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
      allStockData?.forEach((stock) => {
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

  const addContainer = () => {
    const newContainer: ContainerEntry = {
      id: Date.now().toString(),
      containerNumber: "",
      selectedProducts: [],
      weight: "",
      notes: "",
    }
    setContainers([...containers, newContainer])
  }

  const removeContainer = (id: string) => {
    if (containers.length > 1) {
      setContainers(containers.filter((c) => c.id !== id))
    }
  }

  const updateContainer = (id: string, field: keyof ContainerEntry, value: string | string[]) => {
    setContainers(containers.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const toggleProduct = (containerId: string, productId: string) => {
    const container = containers.find((c) => c.id === containerId)
    if (!container) return

    // Check if product has stock
    const stockAmount = productStock[productId] || 0
    if (stockAmount === 0) return // Don't allow toggling products with zero stock

    const currentProducts = container.selectedProducts
    const newProducts = currentProducts.includes(productId)
      ? currentProducts.filter((p) => p !== productId)
      : [...currentProducts, productId]

    updateContainer(containerId, "selectedProducts", newProducts)
  }

  const calculateMaxAvailableWeight = (selectedProductIds: string[]) => {
    // Sum up the available stock for selected products
    const totalAvailable = selectedProductIds.reduce((sum, productId) => {
      return sum + (productStock[productId] || 0)
    }, 0)

    // Cap at 2,500 tons as specified
    return Math.min(totalAvailable, 2500)
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

  const handleComplete = async () => {
    if (!selectedYard) return

    // Validate that all container numbers are from the list
    const invalidContainers = containers.filter((c) => !containerNumbers.includes(c.containerNumber))
    if (invalidContainers.length > 0) {
      toast({
        title: "Invalid Container Numbers",
        description: "Please select valid container numbers from the dropdown list.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

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
        toast({
          title: "Error",
          description: "User not found or inactive. Please contact your administrator.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      // Call server action
      const result = await createPickup({
        selectedYard,
        pickupDate,
        weighbridgeSlip,
        containers,
        userId: (userData as any).user_id,
        organizationId: (userData as any).organization_id,
      })

      if (result.success) {
        // Show success toast
        toast({
          title: "Pickup Completed Successfully!",
          description: result.message,
          duration: 3000,
        })

        // Wait a moment for the toast to show, then redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error completing pickup:", error)
      toast({
        title: "Error",
        description: "Failed to complete pickup. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Pickups</h1>
          <Button variant="ghost" onClick={() => setShowStockModal(true)}>
            <DocumentText size={56} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Header Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Pick up details</h2>
            <p className="text-sm text-gray-600 mb-4">
              Conveniently manage and verify the details of all outgoing coal shipments.
            </p>

            {/* Yard Selection */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Select the yard</h3>
              <div className="grid grid-cols-2 gap-3">
                {coalYards.map((yard) => (
                  <button
                    key={yard.id}
                    onClick={() => {
                      setSelectedYard(yard.id)
                      loadProductStock(yard.id)
                    }}
                    className={`relative rounded-lg border-2 p-3 transition-all ${
                      selectedYard === yard.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
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

            {/* Pickup Details */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Pick Up Date</Label>
                <div className="relative mt-1">
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="pr-10 rounded-full border-gray-300"
                  />
                                      <Calendar1 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Weighbridge Slip</Label>
                <div className="relative mt-1">
                  <Input
                    value={weighbridgeSlip}
                    onChange={(e) => setWeighbridgeSlip(e.target.value)}
                    placeholder="xxx-xxx-xxxx"
                    className="pr-10 rounded-full border-gray-300"
                  />
                                      <DocumentText size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Container Entries */}
        {containers.map((container, index) => (
          <Card key={container.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{index === 0 ? "Choose a container" : `Choose another container`}</h3>
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
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                      SARU
                    </div>
                    <Input
                      value={container.containerNumber}
                      onChange={(e) => handleContainerNumberChange(container.id, e.target.value)}
                      onFocus={() => {
                        if (container.containerNumber.length > 0) {
                          const filtered = containerNumbers
                            .filter((num) => num.includes(container.containerNumber))
                            .slice(0, 5)
                          setFilteredSuggestions((prev) => ({
                            ...prev,
                            [container.id]: filtered,
                          }))
                          setShowSuggestions((prev) => ({
                            ...prev,
                            [container.id]: filtered.length > 0,
                          }))
                        } else {
                          // Show all options when input is empty
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
                        // Delay hiding to allow click on suggestion
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
                    <Box size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

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

                <div>
                  <Label className="text-sm text-gray-600">Select products</Label>
                  <p className="text-xs text-gray-500 mb-4">Select the products added into the container.</p>

                  <div className="space-y-3">
                    {products.map((product, index) => {
                      const isSelected = container.selectedProducts.includes(product.id)
                      const stockAmount = productStock[product.id] || 0

                      return (
                        <div
                          key={product.id}
                          onClick={() => (stockAmount > 0 ? toggleProduct(container.id, product.id) : null)}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                            stockAmount === 0
                              ? "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                              : isSelected
                                ? "border-gray-800 bg-gray-50 cursor-pointer"
                                : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center ${
                                stockAmount === 0
                                  ? "border-gray-300 bg-gray-200"
                                  : isSelected
                                    ? "border-gray-800 bg-gray-800"
                                    : "border-gray-300"
                              }`}
                            >
                              {isSelected && stockAmount > 0 && (
                                <TickSquare size={16} className="text-white" />
                              )}
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
                  <Label className="text-sm text-gray-600">Enter container/product weight</Label>
                  <p className="text-xs text-gray-500 mb-2">This is the total product weight in the container.</p>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={container.weight}
                      onChange={(e) => updateContainer(container.id, "weight", e.target.value)}
                      placeholder="2,000"
                      className="flex h-10 w-full rounded-full border border-gray-300 bg-background px-3 py-2 pr-16 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Weight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">t</span>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-gray-500">
                      {container.selectedProducts.length > 0
                        ? `Selected products: ${container.selectedProducts.length}`
                        : "No products selected"}
                    </span>
                    <span className="text-gray-500">
                      Max available: {(() => {
                        // Get the total stock for each selected product
                        const selectedProductStocks = container.selectedProducts.map(
                          (productId) => productStock[productId] || 0,
                        )

                        // Sum of all selected product stocks (capped at 2,500 tons)
                        const totalAvailableStock = Math.min(
                          selectedProductStocks.reduce((sum, stock) => sum + stock, 0),
                          2500,
                        )

                        // Calculate already allocated weight for selected products across other containers
                        let allocatedWeight = 0
                        containers.forEach((c) => {
                          if (c.id !== container.id && c.selectedProducts.length > 0 && c.weight) {
                            // For each other container, check if it uses any of the same products
                            const weightPerProduct = Number.parseFloat(c.weight) / c.selectedProducts.length
                            c.selectedProducts.forEach((productId) => {
                              if (container.selectedProducts.includes(productId)) {
                                allocatedWeight += weightPerProduct
                              }
                            })
                          }
                        })

                        // Remaining available is total available minus what's already allocated
                        const remainingAvailable = Math.max(0, totalAvailableStock - allocatedWeight)
                        return remainingAvailable.toLocaleString()
                      })()} t
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Additional Info</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    These notes will be saved with the container record in the pickup_containers table for future
                    reference.
                  </p>
                  <Textarea
                    value={container.notes}
                    onChange={(e) => updateContainer(container.id, "notes", e.target.value)}
                    placeholder="Add container-specific notes (saved to pickup container record)"
                    className="rounded-lg border-gray-300 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Another Container Button */}
        <Button
          onClick={addContainer}
          variant="outline"
          className="w-full h-12 rounded-full border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          ADD ANOTHER CONTAINER
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Outgoing Load Left</p>
            <p className="font-semibold">{outgoingLoad.toLocaleString()} t</p>
          </div>
          <Button
            onClick={handleComplete}
            disabled={
              loading ||
              !selectedYard ||
              !weighbridgeSlip ||
              containers.some((c) => !c.containerNumber || !c.weight || c.selectedProducts.length === 0)
            }
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold px-8 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "COMPLETE"}
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
