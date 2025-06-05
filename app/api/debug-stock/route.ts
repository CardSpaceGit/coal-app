import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    // Get all stock data to see what's actually in the database
    const { data: allStock, error: stockError } = await supabase
      .from('stock')
      .select(`
        *,
        coal_yard:coal_yards(name, code),
        product:products(name, type)
      `)
      .limit(10)

    console.log('All stock records (first 10):', allStock)
    console.log('Stock query error:', stockError)

    // Get organization counts
    const { data: orgCount } = await supabase
      .from('stock')
      .select('organization_id', { count: 'exact' })

    console.log('Stock count by organization:', orgCount)

    return NextResponse.json({
      success: true,
      allStock: allStock || [],
      stockError,
      totalRecords: allStock?.length || 0,
      organizationCounts: orgCount
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
} 