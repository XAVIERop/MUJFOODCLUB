import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_URL environment variable');
  process.exit(1);
}
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLScript() {
  console.log('🔧 Running SQL script to setup Chatkara printer...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('scripts/setup_chatkara_printer.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ SQL script executed successfully');
    console.log('Result:', data);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

runSQLScript();
