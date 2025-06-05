import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      format, 
      userId, 
      organizationId, 
      dateRange, 
      coalYardFilter 
    } = await request.json()

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Export request:', { format, userId, organizationId, dateRange, coalYardFilter })

    const supabase = getSupabaseClient()

    // Use the organization ID from the authenticated user session
    // (The frontend already verified the user has access to this organization)
    console.log('Using organization ID:', organizationId)

    // Build queries based on filters
    let deliveriesQuery = supabase
      .from('deliveries')
      .select(`
        *,
        coal_yard:coal_yards(name, code),
        product:products(name, type)
      `)
      .eq('organization_id', organizationId)

    let pickupsQuery = supabase
      .from('pickup')
      .select(`
        *,
        coal_yard:coal_yards(name, code),
        product:products(name, type)
      `)
      .eq('organization_id', organizationId)

    let stockQuery = supabase
      .from('stock')
      .select(`
        *,
        coal_yard:coal_yards(name, code),
        product:products(name, type)
      `)
      .eq('organization_id', organizationId)
      .gt('current_weight_tons', 0) // Only include stock with actual weight

    // Apply date range filter
    if (dateRange?.start && dateRange?.end) {
      deliveriesQuery = deliveriesQuery
        .gte('delivery_date', dateRange.start)
        .lte('delivery_date', dateRange.end)
      
      pickupsQuery = pickupsQuery
        .gte('pickup_date', dateRange.start)
        .lte('pickup_date', dateRange.end)
    }

    // Apply coal yard filter
    if (coalYardFilter && coalYardFilter !== 'all') {
      deliveriesQuery = deliveriesQuery.eq('coal_yard_id', coalYardFilter)
      pickupsQuery = pickupsQuery.eq('coal_yard_id', coalYardFilter)
      stockQuery = stockQuery.eq('coal_yard_id', coalYardFilter)
    }

    // Fetch all data
    console.log('Executing queries...')
    const [deliveriesResult, pickupsResult, stockResult] = await Promise.all([
      deliveriesQuery,
      pickupsQuery,
      stockQuery
    ])

    console.log('Query results:', {
      deliveries: deliveriesResult.data?.length || 0,
      pickups: pickupsResult.data?.length || 0,
      stock: stockResult.data?.length || 0,
      deliveriesError: deliveriesResult.error,
      pickupsError: pickupsResult.error,
      stockError: stockResult.error
    })

    // Log sample data to help debug
    if (stockResult.data && stockResult.data.length > 0) {
      console.log('Sample stock data:', stockResult.data[0])
    }
    if (deliveriesResult.data && deliveriesResult.data.length > 0) {
      console.log('Sample delivery data:', deliveriesResult.data[0])
    }
    if (pickupsResult.data && pickupsResult.data.length > 0) {
      console.log('Sample pickup data:', pickupsResult.data[0])
    }

    const deliveries = deliveriesResult.data || []
    const pickups = pickupsResult.data || []
    const stock = stockResult.data || []

    if (format === 'csv') {
      return generateCSV(deliveries, pickups, stock)
    } else if (format === 'pdf') {
      return await generatePDF(deliveries, pickups, stock, dateRange || {})
    } else if (format === 'zip') {
      return await generateZIP(deliveries, pickups, stock, dateRange || {})
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function generateCSV(deliveries: any[], pickups: any[], stock: any[]) {
  let csvContent = ''

  // Deliveries section
  csvContent += 'DELIVERIES\n'
  csvContent += 'Date,Coal Yard,Product,Weight (tons),Vehicle Number,Driver Name,Driver Contact\n'
  
  deliveries.forEach(delivery => {
    const row = [
      delivery.delivery_date,
      delivery.coal_yard?.name || 'Unknown',
      delivery.product?.name || 'Unknown',
      delivery.weight_tons,
      delivery.vehicle_number || '',
      delivery.driver_name || '',
      delivery.driver_contact || ''
    ].map(field => `"${field}"`).join(',')
    csvContent += row + '\n'
  })

  csvContent += '\n'

  // Pickups section
  csvContent += 'PICKUPS\n'
  csvContent += 'Date,Coal Yard,Product,Weight (tons),Vehicle Number,Driver Name,Driver Contact\n'
  
  pickups.forEach(pickup => {
    const row = [
      pickup.pickup_date,
      pickup.coal_yard?.name || 'Unknown',
      pickup.product?.name || 'Unknown',
      pickup.weight_tons,
      pickup.vehicle_number || '',
      pickup.driver_name || '',
      pickup.driver_contact || ''
    ].map(field => `"${field}"`).join(',')
    csvContent += row + '\n'
  })

  csvContent += '\n'

  // Stock section - removed max_capacity_tons field
  csvContent += 'CURRENT STOCK\n'
  csvContent += 'Coal Yard,Product,Current Weight (tons),Last Updated\n'
  
  stock.forEach(stockItem => {
    const row = [
      stockItem.coal_yard?.name || 'Unknown',
      stockItem.product?.name || 'Unknown',
      stockItem.current_weight_tons || 0,
      stockItem.updated_at || ''
    ].map(field => `"${field}"`).join(',')
    csvContent += row + '\n'
  })

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="coal-data-export-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}

async function generatePDF(deliveries: any[], pickups: any[], stock: any[], dateRange: any) {
  // Dynamic import to avoid webpack issues
  const { jsPDF } = await import('jspdf')
  
  const doc = new jsPDF()
  let yPos = 20

  // Title
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Coal Management Export Report', 20, yPos)
  yPos += 15

  // Date range
  if (dateRange?.start && dateRange?.end) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 20, yPos)
    yPos += 10
  }

  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos)
  yPos += 20

  // Summary section
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Summary', 20, yPos)
  yPos += 10

  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`Total Deliveries: ${deliveries.length}`, 20, yPos)
  yPos += 6
  doc.text(`Total Pickups: ${pickups.length}`, 20, yPos)
  yPos += 6
  doc.text(`Current Stock Items: ${stock.length}`, 20, yPos)
  yPos += 6

  const totalDeliveryWeight = deliveries.reduce((sum, d) => sum + Number(d.weight_tons), 0)
  const totalPickupWeight = pickups.reduce((sum, p) => sum + Number(p.weight_tons), 0)
  const totalStockWeight = stock.reduce((sum, s) => sum + Number(s.current_weight_tons), 0)

  doc.text(`Total Delivery Weight: ${totalDeliveryWeight.toLocaleString()} tons`, 20, yPos)
  yPos += 6
  doc.text(`Total Pickup Weight: ${totalPickupWeight.toLocaleString()} tons`, 20, yPos)
  yPos += 6
  doc.text(`Total Stock Weight: ${totalStockWeight.toLocaleString()} tons`, 20, yPos)
  yPos += 20

  // Add more detailed tables if needed (truncated for brevity)
  // You can add table generation logic here using jsPDF-autotable if needed

  const pdfBytes = doc.output('arraybuffer')

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="coal-data-export-${new Date().toISOString().split('T')[0]}.pdf"`
    }
  })
}

async function generateZIP(deliveries: any[], pickups: any[], stock: any[], dateRange: any) {
  // Dynamic import to avoid webpack issues
  const JSZip = (await import('jszip')).default
  
  const zip = new JSZip()
  const dateStr = new Date().toISOString().split('T')[0]

  // Generate CSV content for each section
  let deliveriesCSV = 'Date,Coal Yard,Product,Weight (tons),Vehicle Number,Driver Name,Driver Contact\n'
  deliveries.forEach(delivery => {
    const row = [
      delivery.delivery_date,
      delivery.coal_yard?.name || 'Unknown',
      delivery.product?.name || 'Unknown',
      delivery.weight_tons,
      delivery.vehicle_number || '',
      delivery.driver_name || '',
      delivery.driver_contact || ''
    ].map(field => `"${field}"`).join(',')
    deliveriesCSV += row + '\n'
  })

  let pickupsCSV = 'Date,Coal Yard,Product,Weight (tons),Vehicle Number,Driver Name,Driver Contact\n'
  pickups.forEach(pickup => {
    const row = [
      pickup.pickup_date,
      pickup.coal_yard?.name || 'Unknown',
      pickup.product?.name || 'Unknown',
      pickup.weight_tons,
      pickup.vehicle_number || '',
      pickup.driver_name || '',
      pickup.driver_contact || ''
    ].map(field => `"${field}"`).join(',')
    pickupsCSV += row + '\n'
  })

  // Stock CSV - removed max_capacity_tons field
  let stockCSV = 'Coal Yard,Product,Current Weight (tons),Last Updated\n'
  stock.forEach(stockItem => {
    const row = [
      stockItem.coal_yard?.name || 'Unknown',
      stockItem.product?.name || 'Unknown',
      stockItem.current_weight_tons || 0,
      stockItem.updated_at || ''
    ].map(field => `"${field}"`).join(',')
    stockCSV += row + '\n'
  })

  // Create summary report
  const summaryContent = `Coal Management Export Report
Generated: ${new Date().toLocaleDateString()}
${dateRange?.start && dateRange?.end ? `Date Range: ${dateRange.start} to ${dateRange.end}` : ''}

SUMMARY:
Total Deliveries: ${deliveries.length}
Total Pickups: ${pickups.length}
Current Stock Items: ${stock.length}

Total Delivery Weight: ${deliveries.reduce((sum, d) => sum + Number(d.weight_tons), 0).toLocaleString()} tons
Total Pickup Weight: ${pickups.reduce((sum, p) => sum + Number(p.weight_tons), 0).toLocaleString()} tons
Total Stock Weight: ${stock.reduce((sum, s) => sum + Number(s.current_weight_tons), 0).toLocaleString()} tons
`

  // Add files to ZIP
  zip.file(`deliveries-${dateStr}.csv`, deliveriesCSV)
  zip.file(`pickups-${dateStr}.csv`, pickupsCSV)
  zip.file(`stock-${dateStr}.csv`, stockCSV)
  zip.file(`summary-${dateStr}.txt`, summaryContent)

  const zipBlob = await zip.generateAsync({ type: 'arraybuffer' })

  return new NextResponse(zipBlob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="coal-data-export-${dateStr}.zip"`
    }
  })
} 