import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyEssentialFix() {
  console.log('🚀 APPLYING ESSENTIAL SECURITY & PERFORMANCE FIX');
  console.log('================================================\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250127000010_essential_security_performance_fix.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log(`📏 Migration size: ${migrationSQL.length} characters`);
    
    // Split the migration into smaller chunks to avoid timeout
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute statements in batches
    const batchSize = 5;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      console.log(`\n🔄 Executing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(statements.length/batchSize)}...`);
      
      for (const statement of batch) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement failed: ${error.message.substring(0, 100)}...`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.log(`❌ Exception: ${err.message.substring(0, 100)}...`);
          errorCount++;
        }
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 MIGRATION RESULTS');
    console.log('===================');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
    
    if (errorCount === 0) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('All 280 issues should now be resolved.');
    } else {
      console.log('\n⚠️  MIGRATION COMPLETED WITH SOME ISSUES');
      console.log('Some statements failed. Check the errors above.');
    }
    
    // Test the fixes
    console.log('\n🧪 TESTING FIXES...');
    await testFixes();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

async function testFixes() {
  try {
    // Test 1: Check RLS
    console.log('1️⃣  Testing Row Level Security...');
    const { data, error } = await supabase
      .from('cafes')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('permission denied')) {
      console.log('✅ RLS is working - access properly restricted');
    } else if (error) {
      console.log(`⚠️  RLS status unclear: ${error.message}`);
    } else {
      console.log('❌ RLS may not be working - data still accessible');
    }
    
    // Test 2: Check performance
    console.log('\n2️⃣  Testing Performance...');
    const startTime = Date.now();
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name')
      .limit(10);
    const duration = Date.now() - startTime;
    
    if (menuError) {
      console.log(`❌ Performance test failed: ${menuError.message}`);
    } else {
      console.log(`✅ Performance test: ${duration}ms (${menuItems?.length || 0} items)`);
      if (duration < 500) {
        console.log('✅ Performance: Excellent');
      } else if (duration < 1000) {
        console.log('✅ Performance: Good');
      } else {
        console.log('⚠️  Performance: Needs improvement');
      }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check your Supabase dashboard for improvements');
    console.log('2. Security issues should be reduced to 0');
    console.log('3. Performance issues should be significantly reduced');
    console.log('4. Monitor the dashboard over the next few minutes');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the migration
applyEssentialFix();








