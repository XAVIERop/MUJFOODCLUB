import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function runCookHouseStaffMigration() {
  console.log('👥 Running Cook House Staff Migration...');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250127000005_create_cook_house_staff.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    
    // Execute the migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Error running migration:', error);
      return;
    }
    
    console.log('✅ Migration executed successfully');
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

runCookHouseStaffMigration();















