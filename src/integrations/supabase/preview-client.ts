// Preview database client for grocery-feature branch
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Preview database credentials
const PREVIEW_SUPABASE_URL = 'https://dhjcxipqcfbqleabtcwk.supabase.co';
const PREVIEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoamN4aXBxY2ZicWxlYWJ0Y3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM1MTEsImV4cCI6MjA3NDg5OTUxMX0.yp5R2ldlN-yg8yzI_5eJH1pqx7wbtbAIGfmz7cJcb0o';

// Create preview client
export const previewSupabase = createClient<Database>(
  PREVIEW_SUPABASE_URL,
  PREVIEW_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'muj-food-club-preview@1.0.0',
      },
    },
  }
);
