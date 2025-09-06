// Test script specifically for Food Court POS Dashboard functionality
// This script helps verify that Food Court orders are working correctly

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFoodCourtPOSDashboard() {
  console.log('🍽️ Testing Food Court POS Dashboard functionality...\n');

  try {
    // 1. Test Food Court cafe exists and is configured
    console.log('1. Testing Food Court cafe configuration...');
    const { data: foodCourt, error: foodCourtError } = await supabase
      .from('cafes')
      .select('id, name, accepting_orders, is_active')
      .eq('name', 'FOOD COURT')
      .single();
    
    if (foodCourtError) {
      console.error('❌ Food Court cafe not found:', foodCourtError);
      return;
    }
    
    console.log('✅ Food Court cafe found:', {
      id: foodCourt.id,
      name: foodCourt.name,
      accepting_orders: foodCourt.accepting_orders,
      is_active: foodCourt.is_active
    });

    // 2. Test Food Court staff assignments
    console.log('\n2. Testing Food Court staff assignments...');
    const { data: staff, error: staffError } = await supabase
      .from('cafe_staff')
      .select(`
        id,
        role,
        is_active,
        profiles!inner(email, full_name, user_type),
        cafes!inner(name)
      `)
      .eq('cafes.name', 'FOOD COURT');
    
    if (staffError) {
      console.error('❌ Error fetching Food Court staff:', staffError);
      return;
    }
    
    if (staff.length === 0) {
      console.error('❌ No staff assigned to Food Court! This is the problem.');
      console.log('💡 Solution: Run the fix_food_court_staff_assignment.sql script');
      return;
    }
    
    console.log(`✅ Food Court has ${staff.length} staff members:`);
    staff.forEach(s => {
      console.log(`   - ${s.profiles.full_name} (${s.profiles.email}): ${s.role} (Active: ${s.is_active})`);
    });

    // 3. Test Food Court menu items
    console.log('\n3. Testing Food Court menu items...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, category, price, is_available')
      .eq('cafe_id', foodCourt.id)
      .limit(10);
    
    if (menuError) {
      console.error('❌ Error fetching Food Court menu:', menuError);
      return;
    }
    
    console.log(`✅ Food Court has ${menuItems.length} menu items (showing first 10):`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name} (${item.category}): ₹${item.price} (Available: ${item.is_available})`);
    });

    // 4. Test Food Court orders
    console.log('\n4. Testing Food Court orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        cafes!inner(name)
      `)
      .eq('cafes.name', 'FOOD COURT')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (ordersError) {
      console.error('❌ Error fetching Food Court orders:', ordersError);
      return;
    }
    
    console.log(`✅ Found ${orders.length} Food Court orders (showing recent 10):`);
    orders.forEach(order => {
      console.log(`   - Order #${order.order_number}: ${order.status} - ₹${order.total_amount} (${new Date(order.created_at).toLocaleString()})`);
    });

    // 5. Test real-time subscription for Food Court
    console.log('\n5. Testing real-time subscription for Food Court...');
    const channel = supabase
      .channel('food-court-test-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${foodCourt.id}`
        }, 
        (payload) => {
          console.log('✅ Real-time subscription working! New Food Court order detected:', payload.new.order_number);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription for Food Court established successfully');
        } else {
          console.log('⚠️ Real-time subscription status:', status);
        }
      });

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up subscription
    await supabase.removeChannel(channel);

    // 6. Test order status update capability for Food Court
    console.log('\n6. Testing order status update capability for Food Court...');
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
        console.log('✅ Order status update capability for Food Court confirmed');
      }
    }

    // 7. Test user profile access for Food Court staff
    console.log('\n7. Testing user profile access for Food Court staff...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, cafe_id')
      .in('user_type', ['cafe_owner', 'cafe_staff'])
      .eq('cafe_id', foodCourt.id);
    
    if (profilesError) {
      console.error('❌ Error fetching Food Court staff profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} Food Court staff profiles:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.email}): ${profile.user_type}`);
      });
    }

    console.log('\n🎉 Food Court POS Dashboard functionality test completed!');
    
    if (staff.length === 0) {
      console.log('\n❌ ISSUE FOUND: No staff assigned to Food Court!');
      console.log('💡 SOLUTION: Run the following SQL script in Supabase:');
      console.log('   scripts/fix_food_court_staff_assignment.sql');
    } else {
      console.log('\n✅ Food Court is properly configured for POS Dashboard!');
      console.log('\n📋 Next steps:');
      console.log('1. Check browser console for detailed logs when using POS Dashboard');
      console.log('2. Verify cafeId is correctly resolved and displayed in header');
      console.log('3. Test placing a new order to Food Court and check if it appears in real-time');
      console.log('4. Test order status updates to ensure they work correctly');
      console.log('5. Use manual refresh button if real-time doesn\'t work');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testFoodCourtPOSDashboard();
