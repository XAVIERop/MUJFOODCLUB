import { createClient } from '@supabase/supabase-js';

// Database credentials
const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStatusReversion() {
  console.log('🔍 Debugging status reversion issue...');
  
  try {
    // 1. Check the most recent order that might be experiencing reversion
    console.log('\n📋 Most recent orders with their status history...');
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at, status_updated_at, accepted_at, preparing_at, out_for_delivery_at, completed_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError);
    } else {
      console.log('✅ Recent orders:');
      recentOrders.forEach(order => {
        console.log(`\nOrder ${order.order_number}:`);
        console.log(`  Current Status: ${order.status}`);
        console.log(`  Created: ${order.created_at}`);
        console.log(`  Status Updated: ${order.status_updated_at}`);
        console.log(`  Accepted: ${order.accepted_at}`);
        console.log(`  Preparing: ${order.preparing_at}`);
        console.log(`  Out for Delivery: ${order.out_for_delivery_at}`);
        console.log(`  Completed: ${order.completed_at}`);
      });
    }

    // 2. Check order notifications to see the sequence of status changes
    console.log('\n📋 Recent order notifications (status updates)...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('order_notifications')
      .select('id, order_id, notification_type, message, created_at')
      .eq('notification_type', 'status_update')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notificationsError) {
      console.log('❌ Error fetching notifications:', notificationsError);
    } else {
      console.log('✅ Recent status update notifications:');
      notifications.forEach(notif => {
        console.log(`  ${notif.message} (${notif.created_at})`);
      });
    }

    // 3. Check if there are any orders that show multiple status changes in quick succession
    console.log('\n📋 Checking for rapid status changes...');
    const { data: rapidChanges, error: rapidError } = await supabase
      .from('order_notifications')
      .select('order_id, message, created_at')
      .eq('notification_type', 'status_update')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (rapidError) {
      console.log('❌ Error checking rapid changes:', rapidError);
    } else {
      console.log('✅ Recent status changes (looking for patterns):');
      const orderChanges = {};
      rapidChanges.forEach(notif => {
        if (!orderChanges[notif.order_id]) {
          orderChanges[notif.order_id] = [];
        }
        orderChanges[notif.order_id].push({
          message: notif.message,
          time: notif.created_at
        });
      });
      
      // Show orders with multiple status changes
      Object.keys(orderChanges).forEach(orderId => {
        if (orderChanges[orderId].length > 1) {
          console.log(`\nOrder ${orderId} has ${orderChanges[orderId].length} status changes:`);
          orderChanges[orderId].forEach(change => {
            console.log(`  ${change.message} at ${change.time}`);
          });
        }
      });
    }

    // 4. Check current database triggers
    console.log('\n📋 Current active triggers on orders table...');
    // Since we can't use exec_sql, let's check if we can see trigger effects
    console.log('Note: We need to check triggers manually in Supabase SQL Editor');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugStatusReversion();
