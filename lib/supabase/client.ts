import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

export function getSupabaseClient() {
 return supabase
}

export { createClient }