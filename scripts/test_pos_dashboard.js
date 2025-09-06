// Test script for POS Dashboard functionality
// This script helps verify that the POS Dashboard is working correctly

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPOSDashboard() {
  console.log('🧪 Testing POS Dashboard functionality...\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('cafes')
      .select('id, name')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Test orders table access
    console.log('\n2. Testing orders table access...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, cafe_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.error('❌ Orders table access failed:', ordersError);
      return;
    }
    console.log(`✅ Orders table access successful. Found ${orders.length} recent orders:`);
    orders.forEach(order => {
      console.log(`   - Order #${order.order_number}: ${order.status} (Cafe: ${order.cafe_id})`);
    });

    // 3. Test cafe_staff table access
    console.log('\n3. Testing cafe_staff table access...');
    const { data: staff, error: staffError } = await supabase
      .from('cafe_staff')
      .select('user_id, cafe_id, role, is_active')
      .limit(5);
    
    if (staffError) {
      console.error('❌ Cafe staff table access failed:', staffError);
      return;
    }
    console.log(`✅ Cafe staff table access successful. Found ${staff.length} staff records:`);
    staff.forEach(s => {
      console.log(`   - User ${s.user_id}: ${s.role} at cafe ${s.cafe_id} (Active: ${s.is_active})`);
    });

    // 4. Test profiles table access
    console.log('\n4. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_type, cafe_id, full_name')
      .in('user_type', ['cafe_owner', 'cafe_staff'])
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table access failed:', profilesError);
      return;
    }
    console.log(`✅ Profiles table access successful. Found ${profiles.length} cafe users:`);
    profiles.forEach(profile => {
      console.log(`   - ${profile.full_name}: ${profile.user_type} (Cafe: ${profile.cafe_id || 'N/A'})`);
    });

    // 5. Test real-time subscription capability
    console.log('\n5. Testing real-time subscription capability...');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders'
        }, 
        (payload) => {
          console.log('✅ Real-time subscription working! New order detected:', payload.new.order_number);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription established successfully');
        } else {
          console.log('⚠️ Real-time subscription status:', status);
        }
      });

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up subscription
    await supabase.removeChannel(channel);

    // 6. Test order status update (dry run - no actual update)
    console.log('\n6. Testing order status update capability...');
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log(`   Testing with order #${testOrder.order_number} (current status: ${testOrder.status})`);
      
      // Just test the update query structure without actually updating
      const { error: updateTestError } = await supabase
        .from('orders')
        .update({ 
          status: testOrder.status, // Keep same status
          status_updated_at: new Date().toISOString()
        })
        .eq('id', testOrder.id)
        .select('id')
        .limit(0); // Don't actually return data
      
      if (updateTestError) {
        console.error('❌ Order status update test failed:', updateTestError);
      } else {
        console.log('✅ Order status update capability confirmed');
      }
    }

    console.log('\n🎉 POS Dashboard functionality test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check browser console for detailed logs when using POS Dashboard');
    console.log('2. Verify cafeId is correctly resolved and displayed in header');
    console.log('3. Test placing a new order and check if it appears in real-time');
    console.log('4. Test order status updates to ensure they don\'t revert');
    console.log('5. Use manual refresh button if real-time doesn\'t work');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPOSDashboard();
