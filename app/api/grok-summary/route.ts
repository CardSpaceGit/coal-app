import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, data } = await request.json()

    // Check if we have Grok API key configured
    const grokApiKey = process.env.GROK_API_KEY
    
    if (!grokApiKey) {
      console.log('No Grok API key found, using smart mock summary')
      const summary = generateMockSummary(data)
      return NextResponse.json({ summary })
    }

    // Call actual Grok API
    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an AI assistant specializing in coal yard operations analysis. Provide concise, professional summaries of operational data in 2-3 sentences, focusing on key insights, trends, and actionable information."
            },
            {
              role: "user",
              content: `${prompt}\n\nData to analyze:\n${JSON.stringify(data, null, 2)}`
            }
          ],
          model: "grok-beta",
          stream: false,
          temperature: 0.7
        })
      })

      if (!grokResponse.ok) {
        throw new Error(`Grok API error: ${grokResponse.status}`)
      }

      const grokResult = await grokResponse.json()
      const summary = grokResult.choices?.[0]?.message?.content || "Unable to generate summary from Grok API."
      
      return NextResponse.json({ summary })
    } catch (grokError) {
      console.error('Grok API failed, falling back to mock summary:', grokError)
      const summary = generateMockSummary(data)
      return NextResponse.json({ summary })
    }

  } catch (error) {
    console.error('Error generating Grok summary:', error)
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}

function generateMockSummary(data: any): string {
  const { dateRange, deliveries, pickups, currentStock, organization, auditTrail } = data
  
  // Calculate daily averages
  const dailyDeliveryAvg = deliveries.total > 0 ? Math.round(deliveries.totalWeight / dateRange.days) : 0
  const dailyPickupAvg = pickups.total > 0 ? Math.round(pickups.totalWeight / dateRange.days) : 0
  const netFlow = deliveries.totalWeight - pickups.totalWeight

  // Find peak days
  const deliveryDays = Object.keys(deliveries.byDay).length
  const pickupDays = Object.keys(pickups.byDay).length
  
  // Find most active product
  const topDeliveryProduct = Object.entries(deliveries.products)
    .sort(([,a], [,b]) => (b as any).weight - (a as any).weight)[0]
  const topPickupProduct = Object.entries(pickups.products)
    .sort(([,a], [,b]) => (b as any).weight - (a as any).weight)[0]

  let summary = ""

  // Generate real-time operational analysis
  if (deliveries.total === 0 && pickups.total === 0) {
    summary = `Live monitoring: No operational activity detected for ${organization} in the current ${dateRange.days}-day period. Current stock level: ${currentStock.toLocaleString()}t.`
  } else if (deliveries.total > 0 && pickups.total === 0) {
    summary = `${organization} received ${deliveries.total} deliveries totaling ${deliveries.totalWeight.toLocaleString()}t over ${dateRange.days} days (${dailyDeliveryAvg}t/day average). `
    if (topDeliveryProduct) {
      summary += `${topDeliveryProduct[0]} was the primary commodity with ${(topDeliveryProduct[1] as any).weight.toLocaleString()}t delivered. `
    }
    summary += `With no pickups, stock levels increased to ${currentStock.toLocaleString()}t.`
  } else if (deliveries.total === 0 && pickups.total > 0) {
    summary = `${organization} processed ${pickups.total} pickups totaling ${pickups.totalWeight.toLocaleString()}t over ${dateRange.days} days (${dailyPickupAvg}t/day average). `
    if (topPickupProduct) {
      summary += `${topPickupProduct[0]} was the primary commodity shipped with ${(topPickupProduct[1] as any).weight.toLocaleString()}t. `
    }
    summary += `With no new deliveries, current stock decreased to ${currentStock.toLocaleString()}t.`
  } else {
    // Both deliveries and pickups
    const trend = netFlow > 0 ? "increased" : netFlow < 0 ? "decreased" : "remained stable"
    const trendAmount = Math.abs(netFlow)
    
    summary = `${organization} handled ${deliveries.total} deliveries (${deliveries.totalWeight.toLocaleString()}t) and ${pickups.total} pickups (${pickups.totalWeight.toLocaleString()}t) over ${dateRange.days} days. `
    
    if (dailyDeliveryAvg > dailyPickupAvg) {
      summary += `Daily averages show higher inbound activity (${dailyDeliveryAvg}t/day) than outbound (${dailyPickupAvg}t/day). `
    } else if (dailyPickupAvg > dailyDeliveryAvg) {
      summary += `Daily averages show higher outbound activity (${dailyPickupAvg}t/day) than inbound (${dailyDeliveryAvg}t/day). `
    } else {
      summary += `Balanced daily averages with ${dailyDeliveryAvg}t/day in both directions. `
    }
    
    if (trendAmount > 100) {
      summary += `Net stock ${trend} by ${trendAmount.toLocaleString()}t to ${currentStock.toLocaleString()}t total.`
    } else {
      summary += `Stock levels remained relatively stable at ${currentStock.toLocaleString()}t.`
    }
  }

  // Add audit trail analysis
  if (auditTrail && auditTrail.totalEdits > 0) {
    const editors = Object.keys(auditTrail.editors)
    const mostActiveEditor = editors.reduce((max, editor) => 
      auditTrail.editors[editor].count > auditTrail.editors[max].count ? editor : max, editors[0])
    
    const mostEditedField = Object.entries(auditTrail.mostEditedFields)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]

    summary += ` Data integrity note: ${auditTrail.totalEdits} record modification${auditTrail.totalEdits > 1 ? 's' : ''} detected`
    
    if (editors.length === 1) {
      summary += ` by ${mostActiveEditor}.`
    } else {
      summary += ` by ${editors.length} users, with ${mostActiveEditor} making ${auditTrail.editors[mostActiveEditor].count} change${auditTrail.editors[mostActiveEditor].count > 1 ? 's' : ''}.`
    }
    
    if (mostEditedField) {
      summary += ` Most frequently modified field: ${mostEditedField[0].replace(/_/g, ' ')} (${mostEditedField[1]} time${(mostEditedField[1] as number) > 1 ? 's' : ''}).`
    }
  } else {
    summary += ` Live monitoring: Data integrity excellent with no record modifications detected.`
  }

  return summary
} 