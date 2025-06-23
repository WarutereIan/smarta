import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxkovmcvfajqwaiyihum.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4a292bWN2ZmFqcXdhaXlpaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NzkwNzMsImV4cCI6MjA2NjI1NTA3M30.LJcHSR7OnCmL5brd4bQd_UjCJdU12pbN9M4yaHWPOTs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 