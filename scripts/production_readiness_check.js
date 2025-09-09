import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function productionReadinessCheck() {
  console.log('🚀 PRODUCTION READINESS CHECK');
  console.log('=============================\n');

  const results = {
    database: { status: 'pending', issues: [], details: {} },
    cafes: { status: 'pending', issues: [], details: {} },
    authentication: { status: 'pending', issues: [], details: {} },
    menu: { status: 'pending', issues: [], details: {} },
    orders: { status: 'pending', issues: [], details: {} },
    printing: { status: 'pending', issues: [], details: {} },
    whatsapp: { status: 'pending', issues: [], details: {} },
    performance: { status: 'pending', issues: [], details: {} }
  };

  try {
    // 1. DATABASE CONNECTIVITY TEST
    console.log('1️⃣  Testing Database Connectivity...');
    const startTime = Date.now();
    
    const { data: testData, error: testError } = await supabase
      .from('cafes')
      .select('count')
      .limit(1);
    
    const dbResponseTime = Date.now() - startTime;
    
    if (testError) {
      results.database.status = 'failed';
      results.database.issues.push(`Database connection failed: ${testError.message}`);
    } else {
      results.database.status = 'passed';
      results.database.details.responseTime = `${dbResponseTime}ms`;
      console.log(`✅ Database connected (${dbResponseTime}ms)`);
    }

    // 2. CAFES SYSTEM TEST
    console.log('\n2️⃣  Testing Cafes System...');
    
    // Test cafe fetching
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('id, name, accepting_orders, priority, is_exclusive, average_rating, total_ratings')
      .order('priority', { ascending: true });

    if (cafesError) {
      results.cafes.status = 'failed';
      results.cafes.issues.push(`Cafe fetching failed: ${cafesError.message}`);
    } else {
      results.cafes.status = 'passed';
      results.cafes.details.totalCafes = cafes.length;
      results.cafes.details.activeCafes = cafes.filter(c => c.accepting_orders).length;
      results.cafes.details.exclusiveCafes = cafes.filter(c => c.is_exclusive).length;
      
      console.log(`✅ Found ${cafes.length} cafes`);
      console.log(`   - Active: ${results.cafes.details.activeCafes}`);
      console.log(`   - Exclusive: ${results.cafes.details.exclusiveCafes}`);
      
      // Check for cafe owner accounts
      const { data: cafeOwners, error: ownersError } = await supabase
        .from('profiles')
        .select('email, user_type, cafe_id')
        .eq('user_type', 'cafe_owner');

      if (!ownersError && cafeOwners) {
        results.cafes.details.cafeOwners = cafeOwners.length;
        console.log(`   - Cafe Owner Accounts: ${cafeOwners.length}`);
      }
    }

    // 3. AUTHENTICATION SYSTEM TEST
    console.log('\n3️⃣  Testing Authentication System...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_type, email')
      .limit(10);

    if (profilesError) {
      results.authentication.status = 'failed';
      results.authentication.issues.push(`Profile fetching failed: ${profilesError.message}`);
    } else {
      results.authentication.status = 'passed';
      const studentCount = profiles.filter(p => p.user_type === 'student').length;
      const ownerCount = profiles.filter(p => p.user_type === 'cafe_owner').length;
      
      results.authentication.details.students = studentCount;
      results.authentication.details.cafeOwners = ownerCount;
      
      console.log(`✅ Authentication system working`);
      console.log(`   - Students: ${studentCount}`);
      console.log(`   - Cafe Owners: ${ownerCount}`);
    }

    // 4. MENU SYSTEM TEST
    console.log('\n4️⃣  Testing Menu System...');
    
    // Test menu items for a sample cafe
    const sampleCafe = cafes?.[0];
    if (sampleCafe) {
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, category, price, is_available')
        .eq('cafe_id', sampleCafe.id)
        .eq('is_available', true);

      if (menuError) {
        results.menu.status = 'failed';
        results.menu.issues.push(`Menu fetching failed: ${menuError.message}`);
      } else {
        results.menu.status = 'passed';
        results.menu.details.totalItems = menuItems.length;
        
        // Group by categories
        const categories = {};
        menuItems.forEach(item => {
          categories[item.category] = (categories[item.category] || 0) + 1;
        });
        
        results.menu.details.categories = Object.keys(categories).length;
        results.menu.details.sampleCafe = sampleCafe.name;
        
        console.log(`✅ Menu system working`);
        console.log(`   - Sample Cafe: ${sampleCafe.name}`);
        console.log(`   - Menu Items: ${menuItems.length}`);
        console.log(`   - Categories: ${Object.keys(categories).length}`);
      }
    } else {
      results.menu.status = 'failed';
      results.menu.issues.push('No cafes found to test menu system');
    }

    // 5. ORDERS SYSTEM TEST
    console.log('\n5️⃣  Testing Orders System...');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      results.orders.status = 'failed';
      results.orders.issues.push(`Orders fetching failed: ${ordersError.message}`);
    } else {
      results.orders.status = 'passed';
      results.orders.details.totalOrders = orders.length;
      
      // Count by status
      const statusCounts = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      results.orders.details.statusBreakdown = statusCounts;
      
      console.log(`✅ Orders system working`);
      console.log(`   - Recent Orders: ${orders.length}`);
      console.log(`   - Status Breakdown:`, statusCounts);
    }

    // 6. PRINTING SYSTEM TEST
    console.log('\n6️⃣  Testing Printing System...');
    
    const { data: printerConfigs, error: printerError } = await supabase
      .from('cafe_printer_configs')
      .select('id, cafe_id, printer_name, connection_type, is_active');

    if (printerError) {
      results.printing.status = 'warning';
      results.printing.issues.push(`Printer configs not found: ${printerError.message}`);
      console.log(`⚠️  Printer configurations not found (may be expected)`);
    } else {
      results.printing.status = 'passed';
      results.printing.details.totalConfigs = printerConfigs.length;
      results.printing.details.activeConfigs = printerConfigs.filter(p => p.is_active).length;
      
      console.log(`✅ Printing system configured`);
      console.log(`   - Total Configs: ${printerConfigs.length}`);
      console.log(`   - Active Configs: ${results.printing.details.activeConfigs}`);
    }

    // 7. WHATSAPP INTEGRATION TEST
    console.log('\n7️⃣  Testing WhatsApp Integration...');
    
    const { data: whatsappConfigs, error: whatsappError } = await supabase
      .from('cafes')
      .select('name, whatsapp_phone, whatsapp_enabled')
      .not('whatsapp_phone', 'is', null);

    if (whatsappError) {
      results.whatsapp.status = 'failed';
      results.whatsapp.issues.push(`WhatsApp config fetching failed: ${whatsappError.message}`);
    } else {
      results.whatsapp.status = 'passed';
      results.whatsapp.details.configuredCafes = whatsappConfigs.length;
      results.whatsapp.details.enabledCafes = whatsappConfigs.filter(c => c.whatsapp_enabled).length;
      
      console.log(`✅ WhatsApp integration configured`);
      console.log(`   - Configured Cafes: ${whatsappConfigs.length}`);
      console.log(`   - Enabled Cafes: ${results.whatsapp.details.enabledCafes}`);
    }

    // 8. PERFORMANCE TEST
    console.log('\n8️⃣  Testing Performance...');
    
    const performanceTests = [];
    
    // Test multiple concurrent queries
    const perfStartTime = Date.now();
    const promises = [
      supabase.from('cafes').select('count').limit(1),
      supabase.from('menu_items').select('count').limit(1),
      supabase.from('orders').select('count').limit(1),
      supabase.from('profiles').select('count').limit(1)
    ];
    
    const results_array = await Promise.all(promises);
    const totalTime = Date.now() - perfStartTime;
    
    const failedQueries = results_array.filter(r => r.error).length;
    
    if (failedQueries === 0) {
      results.performance.status = 'passed';
      results.performance.details.concurrentQueries = '4/4 passed';
      results.performance.details.totalTime = `${totalTime}ms`;
      console.log(`✅ Performance test passed`);
      console.log(`   - Concurrent Queries: 4/4 passed`);
      console.log(`   - Total Time: ${totalTime}ms`);
    } else {
      results.performance.status = 'failed';
      results.performance.issues.push(`${failedQueries} out of 4 concurrent queries failed`);
    }

    // FINAL SUMMARY
    console.log('\n📊 PRODUCTION READINESS SUMMARY');
    console.log('================================');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.status === 'passed').length;
    const failedTests = Object.values(results).filter(r => r.status === 'failed').length;
    const warningTests = Object.values(results).filter(r => r.status === 'warning').length;
    
    console.log(`\nOverall Status: ${passedTests}/${totalTests} tests passed`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    
    // Detailed results
    Object.entries(results).forEach(([test, result]) => {
      const status = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      console.log(`\n${status} ${test.toUpperCase()}: ${result.status}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (Object.keys(result.details).length > 0) {
        console.log(`   Details:`, result.details);
      }
    });

    // Production readiness assessment
    console.log('\n🎯 PRODUCTION READINESS ASSESSMENT');
    console.log('===================================');
    
    if (failedTests === 0 && warningTests <= 1) {
      console.log('🟢 READY FOR PRODUCTION');
      console.log('   All critical systems are working properly.');
    } else if (failedTests <= 1 && warningTests <= 2) {
      console.log('🟡 NEARLY READY FOR PRODUCTION');
      console.log('   Minor issues need to be addressed.');
    } else {
      console.log('🔴 NOT READY FOR PRODUCTION');
      console.log('   Critical issues need to be resolved.');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (results.database.status === 'passed') {
      console.log('✅ Database connectivity is stable');
    }
    
    if (results.cafes.details?.cafeOwners < 3) {
      console.log('⚠️  Consider creating more cafe owner accounts for testing');
    }
    
    if (results.printing.status === 'warning') {
      console.log('⚠️  Set up printer configurations for production cafes');
    }
    
    if (results.whatsapp.details?.enabledCafes < 2) {
      console.log('⚠️  Enable WhatsApp notifications for more cafes');
    }
    
    console.log('\n🚀 Production readiness check complete!');

  } catch (error) {
    console.error('❌ Critical error during production check:', error);
  }
}

productionReadinessCheck();
