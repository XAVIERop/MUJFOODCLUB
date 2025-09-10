import { createClient } from '@supabase/supabase-js';

// Database credentials
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

async function analyzeCurrentState() {
  console.log('🔍 Analyzing current database state...');
  
  try {
    // 1. Check recent orders and their status changes
    console.log('\n📋 Recent orders with status history...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at, status_updated_at, accepted_at, preparing_at, out_for_delivery_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError);
    } else {
      console.log('✅ Recent orders:');
      orders.forEach(order => {
        console.log(`  Order ${order.order_number}: ${order.status} (created: ${order.created_at})`);
        console.log(`    Status updated: ${order.status_updated_at}`);
        console.log(`    Accepted: ${order.accepted_at}`);
        console.log(`    Preparing: ${order.preparing_at}`);
        console.log(`    Out for delivery: ${order.out_for_delivery_at}`);
        console.log(`    Completed: ${order.completed_at}`);
        console.log('');
      });
    }

    // 2. Check order notifications to see what's happening
    console.log('\n📋 Recent order notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('order_notifications')
      .select('id, order_id, notification_type, message, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notificationsError) {
      console.log('❌ Error fetching notifications:', notificationsError);
    } else {
      console.log('✅ Recent notifications:');
      notifications.forEach(notif => {
        console.log(`  ${notif.notification_type}: ${notif.message} (${notif.created_at})`);
      });
    }

    // 3. Check if there are any orders that show status reversion
    console.log('\n📋 Checking for status reversion patterns...');
    const { data: reversionOrders, error: reversionError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at, status_updated_at')
      .eq('status', 'received')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (reversionError) {
      console.log('❌ Error checking reversion:', reversionError);
    } else {
      console.log('✅ Orders currently in "received" status:');
      reversionOrders.forEach(order => {
        console.log(`  ${order.order_number}: ${order.status} (created: ${order.created_at}, updated: ${order.status_updated_at})`);
      });
    }

    // 4. Check the POS Dashboard real-time subscription logic
    console.log('\n📋 Checking POS Dashboard subscription logic...');
    console.log('Need to check if the real-time subscription is working correctly');
    console.log('and if the cafeId resolution is proper for Food Court');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the analysis
analyzeCurrentState();
