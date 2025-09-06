#!/usr/bin/env node

/**
 * Load Testing Script for Production Readiness
 * Tests the application under realistic load scenarios
 */

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'your-supabase-url',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key',
  TEST_SCENARIOS: {
    CONCURRENT_USERS: 100,
    ORDERS_PER_USER: 5,
    TEST_DURATION_MS: 60000, // 1 minute
    RAMP_UP_TIME_MS: 10000,  // 10 seconds
  }
};

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Test results tracking
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

/**
 * Simulate a user browsing cafes
 */
async function simulateUserBrowsing(userId) {
  const startTime = performance.now();
  
  try {
    // Test 1: Fetch cafes
    const { data: cafes, error: cafesError } = await supabase
      .from('cafes')
      .select('*')
      .eq('is_active', true)
      .limit(10);
    
    if (cafesError) throw cafesError;
    
    // Test 2: Fetch menu items for first cafe
    if (cafes && cafes.length > 0) {
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafes[0].id)
        .eq('is_available', true)
        .limit(20);
      
      if (menuError) throw menuError;
    }
    
    // Test 3: Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.successfulRequests++;
    results.responseTimes.push(responseTime);
    
    return { success: true, responseTime };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.failedRequests++;
    results.errors.push({
      error: error.message,
      responseTime,
      userId
    });
    
    return { success: false, error: error.message, responseTime };
  } finally {
    results.totalRequests++;
  }
}

/**
 * Simulate order creation
 */
async function simulateOrderCreation(userId, cafeId) {
  const startTime = performance.now();
  
  try {
    // Create a test order
    const orderData = {
      user_id: userId,
      cafe_id: cafeId,
      order_number: `TEST${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      status: 'received',
      total_amount: Math.floor(Math.random() * 500) + 100, // ₹100-600
      delivery_block: 'B1',
      payment_method: 'cod',
      points_earned: 0
    };
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Add order items
    const orderItems = [
      {
        order_id: order.id,
        menu_item_id: 'test-menu-item-id',
        quantity: Math.floor(Math.random() * 3) + 1,
        unit_price: Math.floor(Math.random() * 200) + 50,
        total_price: Math.floor(Math.random() * 400) + 100
      }
    ];
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.successfulRequests++;
    results.responseTimes.push(responseTime);
    
    return { success: true, responseTime, orderId: order.id };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    results.failedRequests++;
    results.errors.push({
      error: error.message,
      responseTime,
      userId,
      cafeId
    });
    
    return { success: false, error: error.message, responseTime };
  } finally {
    results.totalRequests++;
  }
}

/**
 * Simulate a complete user session
 */
async function simulateUserSession(userId) {
  const sessionResults = [];
  
  try {
    // Browse cafes and menu
    const browseResult = await simulateUserBrowsing(userId);
    sessionResults.push(browseResult);
    
    // Wait a bit (simulate user thinking)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Create orders
    for (let i = 0; i < CONFIG.TEST_SCENARIOS.ORDERS_PER_USER; i++) {
      const orderResult = await simulateOrderCreation(userId, 'test-cafe-id');
      sessionResults.push(orderResult);
      
      // Wait between orders
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
    }
    
  } catch (error) {
    console.error(`Session error for user ${userId}:`, error.message);
  }
  
  return sessionResults;
}

/**
 * Run load test with concurrent users
 */
async function runLoadTest() {
  console.log('🚀 Starting Load Test...');
  console.log(`📊 Configuration:`);
  console.log(`   - Concurrent Users: ${CONFIG.TEST_SCENARIOS.CONCURRENT_USERS}`);
  console.log(`   - Orders per User: ${CONFIG.TEST_SCENARIOS.ORDERS_PER_USER}`);
  console.log(`   - Test Duration: ${CONFIG.TEST_SCENARIOS.TEST_DURATION_MS / 1000}s`);
  console.log(`   - Ramp Up Time: ${CONFIG.TEST_SCENARIOS.RAMP_UP_TIME_MS / 1000}s`);
  console.log('');
  
  results.startTime = performance.now();
  
  // Create test users
  const testUsers = Array.from({ length: CONFIG.TEST_SCENARIOS.CONCURRENT_USERS }, (_, i) => 
    `test-user-${i}-${Date.now()}`
  );
  
  // Ramp up users gradually
  const rampUpDelay = CONFIG.TEST_SCENARIOS.RAMP_UP_TIME_MS / CONFIG.TEST_SCENARIOS.CONCURRENT_USERS;
  
  const userPromises = testUsers.map(async (userId, index) => {
    // Stagger user start times
    await new Promise(resolve => setTimeout(resolve, index * rampUpDelay));
    
    // Run user session
    return simulateUserSession(userId);
  });
  
  // Wait for all users to complete or timeout
  const timeoutPromise = new Promise(resolve => 
    setTimeout(resolve, CONFIG.TEST_SCENARIOS.TEST_DURATION_MS)
  );
  
  await Promise.race([
    Promise.all(userPromises),
    timeoutPromise
  ]);
  
  results.endTime = performance.now();
  
  // Generate report
  generateReport();
}

/**
 * Generate performance report
 */
function generateReport() {
  const totalTime = results.endTime - results.startTime;
  const avgResponseTime = results.responseTimes.length > 0 
    ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
    : 0;
  
  const minResponseTime = Math.min(...results.responseTimes);
  const maxResponseTime = Math.max(...results.responseTimes);
  
  const successRate = (results.successfulRequests / results.totalRequests) * 100;
  const requestsPerSecond = results.totalRequests / (totalTime / 1000);
  
  console.log('\n📈 LOAD TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`⏱️  Total Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`📊 Total Requests: ${results.totalRequests}`);
  console.log(`✅ Successful Requests: ${results.successfulRequests}`);
  console.log(`❌ Failed Requests: ${results.failedRequests}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`🚀 Requests/Second: ${requestsPerSecond.toFixed(2)}`);
  console.log('');
  console.log('⏱️  RESPONSE TIMES');
  console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Minimum: ${minResponseTime.toFixed(2)}ms`);
  console.log(`   Maximum: ${maxResponseTime.toFixed(2)}ms`);
  console.log('');
  
  // Performance thresholds
  const thresholds = {
    successRate: 95, // 95% success rate
    avgResponseTime: 500, // 500ms average response time
    maxResponseTime: 2000, // 2s maximum response time
    requestsPerSecond: 50 // 50 requests per second
  };
  
  console.log('🎯 PERFORMANCE THRESHOLDS');
  console.log(`   Success Rate: ${successRate >= thresholds.successRate ? '✅' : '❌'} ${successRate.toFixed(2)}% (target: ${thresholds.successRate}%)`);
  console.log(`   Avg Response Time: ${avgResponseTime <= thresholds.avgResponseTime ? '✅' : '❌'} ${avgResponseTime.toFixed(2)}ms (target: ≤${thresholds.avgResponseTime}ms)`);
  console.log(`   Max Response Time: ${maxResponseTime <= thresholds.maxResponseTime ? '✅' : '❌'} ${maxResponseTime.toFixed(2)}ms (target: ≤${thresholds.maxResponseTime}ms)`);
  console.log(`   Requests/Second: ${requestsPerSecond >= thresholds.requestsPerSecond ? '✅' : '❌'} ${requestsPerSecond.toFixed(2)} (target: ≥${thresholds.requestsPerSecond})`);
  console.log('');
  
  // Error analysis
  if (results.errors.length > 0) {
    console.log('❌ ERROR ANALYSIS');
    const errorCounts = {};
    results.errors.forEach(error => {
      errorCounts[error.error] = (errorCounts[error.error] || 0) + 1;
    });
    
    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`   ${error}: ${count} occurrences`);
    });
    console.log('');
  }
  
  // Overall assessment
  const passedTests = [
    successRate >= thresholds.successRate,
    avgResponseTime <= thresholds.avgResponseTime,
    maxResponseTime <= thresholds.maxResponseTime,
    requestsPerSecond >= thresholds.requestsPerSecond
  ].filter(Boolean).length;
  
  console.log(`🏆 OVERALL ASSESSMENT: ${passedTests}/4 tests passed`);
  
  if (passedTests === 4) {
    console.log('🎉 PRODUCTION READY! All performance thresholds met.');
  } else {
    console.log('⚠️  NEEDS OPTIMIZATION: Some performance thresholds not met.');
    console.log('   Consider running database optimization script and reviewing infrastructure.');
  }
  
  console.log('');
}

/**
 * Database performance test
 */
async function testDatabasePerformance() {
  console.log('🗄️  Testing Database Performance...');
  
  const tests = [
    {
      name: 'Fetch Active Cafes',
      query: () => supabase.from('cafes').select('*').eq('is_active', true)
    },
    {
      name: 'Fetch Menu Items',
      query: () => supabase.from('menu_items').select('*').eq('is_available', true).limit(50)
    },
    {
      name: 'Fetch Recent Orders',
      query: () => supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20)
    },
    {
      name: 'Fetch User Profiles',
      query: () => supabase.from('profiles').select('*').limit(20)
    }
  ];
  
  for (const test of tests) {
    const startTime = performance.now();
    try {
      const { data, error } = await test.query();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      if (error) {
        console.log(`   ❌ ${test.name}: ${error.message} (${responseTime.toFixed(2)}ms)`);
      } else {
        console.log(`   ✅ ${test.name}: ${data?.length || 0} records (${responseTime.toFixed(2)}ms)`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }
  
  console.log('');
}

// Main execution
async function main() {
  try {
    console.log('🧪 PRODUCTION LOAD TESTING SUITE');
    console.log('='.repeat(50));
    console.log('');
    
    // Test database connectivity first
    await testDatabasePerformance();
    
    // Run load test
    await runLoadTest();
    
  } catch (error) {
    console.error('❌ Load test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runLoadTest, testDatabasePerformance };
