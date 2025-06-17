import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvbuvdyynswkrbyytnsf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YnV2ZHl5bnN3a3JieXl0bnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTIzOTMsImV4cCI6MjA2NTY4ODM5M30.DNOxIZjLiP26aD9WSsH7MjqxJUkzi1wLrUp4KLI43Zg'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 