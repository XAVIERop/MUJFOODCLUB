import { createClient } from '@supabase/supabase-js';

// Database credentials
const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

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
