import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtimeUpdates() {
  console.log('🧪 Testing Real-time Order Updates...');
  
  try {
    // 1. Get a recent order from Cook House
    console.log('\n🔍 Finding a recent order from Cook House...');
    const { data: cookHouse, error: cafeError } = await supabase
      .from('cafes')
      .select('id, name')
      .ilike('name', '%cook house%')
      .single();

    if (cafeError || !cookHouse) {
      console.error('❌ Error finding Cook House:', cafeError);
      return;
    }

    console.log('✅ Cook House found:', cookHouse);

    // 2. Get recent orders from Cook House
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('cafe_id', cookHouse.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('❌ No orders found for Cook House');
      return;
    }

    console.log('✅ Found orders:');
    orders.forEach(order => {
      console.log(`  - ${order.order_number}: ${order.status} (${order.created_at})`);
    });

    // 3. Test real-time subscription
    const testOrder = orders[0];
    console.log(`\n🔴 Setting up real-time subscription for order: ${testOrder.order_number}`);
    
    const channel = supabase
      .channel(`test-order-${testOrder.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${testOrder.id}`
        }, 
        (payload) => {
          console.log('🔄 Real-time update received!');
          console.log('  Old status:', payload.old?.status);
          console.log('  New status:', payload.new?.status);
          console.log('  Order number:', payload.new?.order_number);
        }
      )
      .subscribe();

    console.log('✅ Real-time subscription active');
    console.log('📝 Now update the order status from POS Dashboard to test real-time updates');
    console.log(`📝 Order to test: ${testOrder.order_number} (ID: ${testOrder.id})`);
    console.log('📝 Current status:', testOrder.status);
    
    // Keep the script running for testing
    console.log('\n⏳ Waiting for updates... (Press Ctrl+C to stop)');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping real-time subscription...');
      supabase.removeChannel(channel);
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRealtimeUpdates();


