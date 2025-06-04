"use server"

import { supabaseServer } from "@/lib/supabase-server"

interface ContainerData {
  containerNumber: string
  selectedProducts: string[]
  weight: string
  notes: string
}

interface PickupData {
  selectedYard: string
  pickupDate: string
  weighbridgeSlip: string
  containers: ContainerData[]
  userId: string
  organizationId: string
}

export async function createPickup(pickupData: PickupData) {
  try {
    const { selectedYard, pickupDate, weighbridgeSlip, containers, userId, organizationId } = pickupData

    // Validate required fields
    if (!selectedYard || containers.some((c) => !c.containerNumber || !c.weight || c.selectedProducts.length === 0)) {
      return {
        success: false,
        error: "Please fill in all required fields: yard, container numbers, weights, and products.",
      }
    }

    const pickupRecords = []
    let totalWeight = 0

    // Create pickup records for each container-product combination
    for (const container of containers) {
      if (container.containerNumber && container.weight && container.selectedProducts.length > 0) {
        const containerWeight = Number.parseFloat(container.weight)
        const weightPerProduct = containerWeight / container.selectedProducts.length
        totalWeight += containerWeight

        // Create individual pickup records for each product in the container
        for (const productId of container.selectedProducts) {
          const { data: pickupRecord, error: pickupError } = await supabaseServer
            .from("pickup")
            .insert({
              user_id: userId,
              coal_yard_id: selectedYard,
              organization_id: organizationId,
              pickup_date: pickupDate,
              weighbridge_slip: weighbridgeSlip || null,
              container_number: container.containerNumber,
              product_id: productId,
              weight_tons: weightPerProduct,
              notes: container.notes || null,
            })
            .select()
            .single()

          if (pickupError) {
            console.error("Pickup insertion error:", pickupError)
            return {
              success: false,
              error: `Failed to create pickup record for container ${container.containerNumber}. Please try again.`,
            }
          }

          pickupRecords.push(pickupRecord)

          // Update stock (reduce) using the proper RPC function
          const { error: stockError } = await supabaseServer.rpc("update_stock_on_pickup", {
            p_coal_yard_id: selectedYard,
            p_product_id: productId,
            p_organization_id: organizationId,
            p_weight_tons: weightPerProduct,
          })

          if (stockError) {
            console.error("Stock update error:", stockError)
            return {
              success: false,
              error: "Pickup saved but stock update failed. Please check inventory manually.",
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `${containers.length} container(s) with ${totalWeight.toLocaleString()}t total weight have been recorded across ${pickupRecords.length} pickup entries.`,
    }
  } catch (error) {
    console.error("Error creating pickup:", error)
    return {
      success: false,
      error: "Failed to complete pickup. Please try again.",
    }
  }
}
