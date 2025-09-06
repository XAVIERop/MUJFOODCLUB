// Debug status reversion issue - check what's actually happening
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStatusReversion() {
  console.log('🔍 Debugging Status Reversion Issue...\n');

  try {
    // Check recent orders and their status changes
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    console.log('📋 Recent Orders:');
    orders.forEach(order => {
      console.log(`- ${order.order_number}: ${order.status} (${order.status_updated_at})`);
    });

    // Check for any triggers that might be reverting status
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_triggers_on_table', { table_name: 'orders' });

    if (triggerError) {
      console.log('Could not fetch triggers:', triggerError.message);
    } else {
      console.log('\n🔧 Triggers on orders table:');
      triggers?.forEach(trigger => {
        console.log(`- ${trigger.trigger_name}: ${trigger.event_manipulation}`);
      });
    }

    // Check order notifications for recent activity
    const { data: notifications, error: notifError } = await supabase
      .from('order_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (notifError) {
      console.error('Error fetching notifications:', notifError);
    } else {
      console.log('\n🔔 Recent Notifications:');
      notifications?.forEach(notif => {
        console.log(`- ${notif.notification_type}: ${notif.message} (${notif.created_at})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugStatusReversion();
