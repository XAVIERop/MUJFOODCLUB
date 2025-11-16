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

async function addEzeepColumns() {
  console.log('🔧 Adding Ezeep columns to cafe_printer_configs table...');
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250127000007_add_ezeep_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    
    // Execute the migration using direct SQL execution
    const { data, error } = await supabase
      .from('cafe_printer_configs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing cafe_printer_configs table:', error);
      return;
    }
    
    console.log('✅ Table access confirmed');
    
    // Try to add the columns by attempting to select them
    console.log('\n🔍 Checking if Ezeep columns exist...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('cafe_printer_configs')
        .select('ezeep_api_key, ezeep_printer_id')
        .limit(1);
      
      if (testError) {
        console.log('❌ Ezeep columns do not exist, need to add them');
        console.log('📝 Please run the SQL migration manually in Supabase SQL Editor:');
        console.log('   File: supabase/migrations/20250127000007_add_ezeep_columns.sql');
        return;
      } else {
        console.log('✅ Ezeep columns already exist');
      }
    } catch (error) {
      console.log('❌ Ezeep columns do not exist, need to add them');
      console.log('📝 Please run the SQL migration manually in Supabase SQL Editor:');
      console.log('   File: supabase/migrations/20250127000007_add_ezeep_columns.sql');
      return;
    }
    
    console.log('\n🎉 Ezeep columns are ready!');
    console.log('📝 Next steps:');
    console.log('1. Run the Ezeep setup script again');
    console.log('2. Configure Cook House with Ezeep credentials');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addEzeepColumns();















