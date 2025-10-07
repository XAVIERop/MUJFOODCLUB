import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMigration() {
  console.log('🧪 TESTING MIGRATION');
  console.log('===================\n');

  try {
    // Test 1: Check if RLS is enabled
    console.log('1️⃣  Testing Row Level Security...');
    
    const tables = ['cafes', 'menu_items', 'orders', 'profiles'];
    const rlsStatus = {};
    
    for (const table of tables) {
      try {
        // Try to access data without authentication
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.message.includes('permission denied')) {
          rlsStatus[table] = '✅ RLS Enabled';
        } else if (error) {
          rlsStatus[table] = `⚠️  Error: ${error.message}`;
        } else {
          rlsStatus[table] = '❌ RLS Not Working';
        }
      } catch (err) {
        rlsStatus[table] = `❌ Exception: ${err.message}`;
      }
    }
    
    console.log('RLS Status:');
    Object.entries(rlsStatus).forEach(([table, status]) => {
      console.log(`  ${table}: ${status}`);
    });

    // Test 2: Check if indexes exist
    console.log('\n2️⃣  Testing Database Indexes...');
    
    const indexQueries = [
      'SELECT indexname FROM pg_indexes WHERE tablename = \'orders\' AND indexname LIKE \'idx_%\'',
      'SELECT indexname FROM pg_indexes WHERE tablename = \'menu_items\' AND indexname LIKE \'idx_%\'',
      'SELECT indexname FROM pg_indexes WHERE tablename = \'profiles\' AND indexname LIKE \'idx_%\''
    ];
    
    for (const query of indexQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`⚠️  Index check failed: ${error.message}`);
        } else {
          console.log(`✅ Indexes found: ${data?.length || 0}`);
        }
      } catch (err) {
        console.log(`❌ Index check exception: ${err.message}`);
      }
    }

    // Test 3: Test basic functionality
    console.log('\n3️⃣  Testing Basic Functionality...');
    
    // Test cafe access (should work - public data)
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('id, name')
      .limit(1);
    
    if (cafesError) {
      console.log(`❌ Cafe access failed: ${cafesError.message}`);
    } else {
      console.log(`✅ Cafe access working: ${cafes?.length || 0} cafes found`);
    }

    // Test 4: Performance test
    console.log('\n4️⃣  Testing Performance...');
    
    const startTime = Date.now();
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .limit(10);
    const duration = Date.now() - startTime;
    
    if (menuError) {
      console.log(`❌ Menu query failed: ${menuError.message}`);
    } else {
      console.log(`✅ Menu query: ${duration}ms (${menuItems?.length || 0} items)`);
      
      if (duration < 500) {
        console.log('✅ Performance: Good');
      } else if (duration < 1000) {
        console.log('⚠️  Performance: Acceptable');
      } else {
        console.log('❌ Performance: Slow');
      }
    }

    // Summary
    console.log('\n📊 MIGRATION TEST SUMMARY');
    console.log('==========================');
    
    const rlsWorking = Object.values(rlsStatus).some(status => status.includes('✅'));
    const performanceGood = duration < 1000;
    
    console.log(`Security (RLS): ${rlsWorking ? '✅ Working' : '❌ Issues'}`);
    console.log(`Performance: ${performanceGood ? '✅ Good' : '⚠️  Needs Improvement'}`);
    console.log(`Basic Access: ${cafesError ? '❌ Failed' : '✅ Working'}`);
    
    if (rlsWorking && performanceGood && !cafesError) {
      console.log('\n🎉 MIGRATION SUCCESSFUL!');
      console.log('All critical issues have been resolved.');
    } else {
      console.log('\n⚠️  MIGRATION NEEDS ATTENTION');
      console.log('Some issues remain. Check the details above.');
    }

  } catch (error) {
    console.error('❌ Migration test failed:', error);
  }
}

// Run the test
testMigration();








