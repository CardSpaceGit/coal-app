import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Extract name from email if fullName not provided
    const autoName = fullName || email.split('@')[0].replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase() + email.split('@')[0].replace(/[^a-zA-Z]/g, '').slice(1)

    // Create user using Supabase Admin API with metadata
    const { data: authUser, error: authError } = await supabaseServer.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: autoName,
        organization_id: '550e8400-e29b-41d4-a716-446655440000', // FT Coal Supply
        role_id: '660e8400-e29b-41d4-a716-446655440001', // Admin
        is_active: true
      }
    })

    console.log('Auth user creation result:', { authUser, authError })

    if (authError) {
      console.error('Auth user creation error:', authError)
      
      // Check if it's a duplicate email error
      if (authError.message.includes('duplicate key') || authError.message.includes('users_email_partial_key')) {
        return NextResponse.json(
          { error: `A user with email "${email}" already exists. Please use a different email address.` },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      )
    }

    // Now manually create the organization_users record
    const { data: orgUser, error: orgError } = await supabaseServer
      .from('organization_users')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000', // FT Coal Supply
        user_id: authUser.user.id,
        role_id: '660e8400-e29b-41d4-a716-446655440001', // Admin
        full_name: autoName,
        email: authUser.user.email,
        avatar_url: null,
        is_active: true,
        joined_at: new Date().toISOString()
      })
      .select()

    console.log('Organization user creation result:', { orgUser, orgError })

    if (orgError) {
      console.error('Organization user creation error:', orgError)
      // Don't fail the whole request if organization_users creation fails
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        fullName: autoName,
        organizationUser: orgUser
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 