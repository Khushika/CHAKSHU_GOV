import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Supabase configuration
const SUPABASE_URL = "https://wfbzfbpsyymtspujdimp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmYnpmYnBzeXltdHNwdWpkaW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjkwNzksImV4cCI6MjA2NjQwNTA3OX0.QH4RvnyY8iz8hZx_7iybV1y3q0uDEviaQC0ah4k2Cw8";

// Create Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

// Flag to indicate if we're in demo mode (always false with real credentials)
export const isDemoMode = false;
