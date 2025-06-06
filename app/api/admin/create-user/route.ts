import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
}

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, full_name, organization_id, role_id, cellphone, is_active } = body

    console.log('API: Creating user with admin privileges...', { email, full_name })

    // Create auth user with admin privileges
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        organization_id,
        role_id,
        is_active
      },
      email_confirm: true // Auto-confirm email for admin-created users
    })

    console.log('API: Auth user creation response:', { authUser, authError })

    if (authError) {
      console.error('API: Auth user creation error:', authError)
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: 'Failed to create auth user - no user returned' },
        { status: 400 }
      )
    }

    console.log('API: Auth user created successfully:', {
      id: authUser.user.id,
      email: authUser.user.email,
      email_confirmed_at: authUser.user.email_confirmed_at
    })

    // Create organization_users profile
    console.log('API: Creating organization user profile...')
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('organization_users')
      .insert({
        user_id: authUser.user.id,
        organization_id,
        role_id,
        full_name,
        email,
        cellphone: cellphone || null,
        is_active,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('API: Profile creation response:', { profileData, profileError })

    if (profileError) {
      console.error('API: Profile creation error:', profileError)
      // If profile creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { 
          error: `Profile creation failed: ${profileError.message}`,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: profileData,
      auth_user_id: authUser.user.id
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    )
  }
} 