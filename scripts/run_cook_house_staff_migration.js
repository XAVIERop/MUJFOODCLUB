import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
