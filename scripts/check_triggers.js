// Check current triggers on orders table
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

async function checkTriggers() {
  try {
    console.log('🔍 Checking current triggers on orders table...');
    
    // Check if we can query the orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, status_updated_at')
      .limit(1);
    
    if (ordersError) {
      console.error('Error querying orders:', ordersError);
      return;
    }
    
    console.log('✅ Orders table is accessible');
    console.log('📋 Sample order:', orders[0]);
    
    // Try to check triggers (this might not work with anon key)
    try {
      const { data: triggers, error: triggerError } = await supabase
        .rpc('get_triggers_on_table', { table_name: 'orders' });
      
      if (triggerError) {
        console.log('⚠️ Cannot check triggers with anon key:', triggerError.message);
      } else {
        console.log('🔧 Current triggers:', triggers);
      }
    } catch (err) {
      console.log('⚠️ Cannot check triggers:', err.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTriggers();
