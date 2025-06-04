import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  throw new Error(`
    Missing SUPABASE_SERVICE_ROLE_KEY environment variable.
    
    Please add the following to your .env file:
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
    
    You can find your service role key in your Supabase project dashboard under:
    Settings > API > Project API keys > service_role (secret)
  `)
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
