import { createClient } from '@supabase/supabase-js'
import type { WorkDatabase } from './work-database'
import { shouldDetectAuthSessionInUrl } from './password-recovery'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<WorkDatabase>(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: shouldDetectAuthSessionInUrl,
  },
})
