// Check what tables exist in preview database
import { createClient } from '@supabase/supabase-js';

const PREVIEW_SUPABASE_URL = 'https://dhjcxipqcfbqleabtcwk.supabase.co';
const PREVIEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoamN4aXBxY2ZicWxlYWJ0Y3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjM1MTEsImV4cCI6MjA3NDg5OTUxMX0.yp5R2ldlN-yg8yzI_5eJH1pqx7wbtbAIGfmz7cJcb0o';

const supabase = createClient(PREVIEW_SUPABASE_URL, PREVIEW_SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('🔍 Checking preview database tables...');

  try {
    // Try to get table information
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      console.error('❌ Error checking tables:', error);
      return;
    }

    console.log('📋 Tables found:', data?.map(t => t.table_name) || 'None');
    
    // Try to access cafes table
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('*')
      .limit(1);

    if (cafesError) {
      console.log('❌ Cafes table error:', cafesError.message);
    } else {
      console.log('✅ Cafes table accessible');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTables();
