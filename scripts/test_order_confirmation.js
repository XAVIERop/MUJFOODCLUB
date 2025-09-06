// Test the new OrderConfirmation page functionality
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

async function testOrderConfirmation() {
  try {
    console.log('🧪 Testing OrderConfirmation functionality...');
    
    // Get a recent order
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, status_updated_at, user_id')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Testing with order:', order.order_number, 'Status:', order.status);
    
    // Test updating the order status
    const newStatus = order.status === 'received' ? 'confirmed' : 'completed';
    console.log(`🔄 Updating status from ${order.status} to ${newStatus}...`);
    
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        status_updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return;
    }
    
    console.log('✅ Order status updated successfully');
    
    // Wait a moment and check if the update persisted
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: updatedOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, status, status_updated_at')
      .eq('id', order.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching updated order:', fetchError);
      return;
    }
    
    console.log('📋 Updated order:', updatedOrder.order_number, 'Status:', updatedOrder.status);
    
    if (updatedOrder.status === newStatus) {
      console.log('✅ Status update persisted correctly');
    } else {
      console.log('❌ Status update did not persist');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrderConfirmation();
