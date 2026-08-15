import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { shouldDetectAuthSessionInUrl } from './password-recovery'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: shouldDetectAuthSessionInUrl,
  },
})
