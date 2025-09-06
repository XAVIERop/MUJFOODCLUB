import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runResetSQL() {
  try {
    console.log('📄 Reading SQL file...');
    const sqlContent = readFileSync('scripts/reset_all_students.sql', 'utf8');
    
    console.log('🚀 Executing SQL reset...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      return;
    }
    
    console.log('✅ SQL reset completed successfully!');
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runResetSQL();
