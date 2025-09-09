import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersTableSchema() {
  console.log('🔍 CHECKING ORDERS TABLE SCHEMA');
  console.log('===============================\n');

  try {
    // 1. Test basic orders query
    console.log('1️⃣  Testing Basic Orders Query...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    } else {
      console.log(`✅ Found ${orders.length} orders`);
      if (orders.length > 0) {
        console.log('✅ Sample order structure:');
        const sampleOrder = orders[0];
        Object.keys(sampleOrder).forEach(key => {
          console.log(`   - ${key}: ${typeof sampleOrder[key]} (${sampleOrder[key]})`);
        });
      }
    }

    // 2. Test order items
    console.log('\n2️⃣  Testing Order Items...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(5);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
    } else {
      console.log(`✅ Found ${orderItems.length} order items`);
      if (orderItems.length > 0) {
        console.log('✅ Sample order item structure:');
        const sampleItem = orderItems[0];
        Object.keys(sampleItem).forEach(key => {
          console.log(`   - ${key}: ${typeof sampleItem[key]} (${sampleItem[key]})`);
        });
      }
    }

    // 3. Test with joins
    console.log('\n3️⃣  Testing Orders with Joins...');
    const { data: ordersWithJoins, error: joinsError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        payment_method,
        payment_status,
        created_at,
        cafes!inner(name),
        profiles!inner(full_name, email)
      `)
      .limit(3);

    if (joinsError) {
      console.error('❌ Error with joins:', joinsError);
    } else {
      console.log(`✅ Found ${ordersWithJoins.length} orders with joins`);
      ordersWithJoins.forEach(order => {
        console.log(`   - Order #${order.order_number}: ${order.cafes.name} - ₹${order.total_amount} (${order.status})`);
        console.log(`     Customer: ${order.profiles.full_name} (${order.profiles.email})`);
      });
    }

    // 4. Test order status distribution
    console.log('\n4️⃣  Testing Order Status Distribution...');
    const { data: statusData, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .limit(100);

    if (statusError) {
      console.error('❌ Error fetching status data:', statusError);
    } else {
      const statusCounts = {};
      statusData.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      console.log('✅ Order status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} orders`);
      });
    }

    // 5. Test recent orders
    console.log('\n5️⃣  Testing Recent Orders...');
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('❌ Error fetching recent orders:', recentError);
    } else {
      console.log(`✅ Found ${recentOrders.length} recent orders`);
      recentOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleString();
        console.log(`   - #${order.order_number}: ₹${order.total_amount} (${order.status}) - ${date}`);
      });
    }

    // Summary
    console.log('\n📊 ORDERS TABLE SUMMARY');
    console.log('========================');
    console.log(`✅ Orders Table: ${orders ? 'Accessible' : 'Not Accessible'}`);
    console.log(`✅ Order Items Table: ${orderItems ? 'Accessible' : 'Not Accessible'}`);
    console.log(`✅ Joins Working: ${ordersWithJoins ? 'Yes' : 'No'}`);
    console.log(`✅ Total Orders: ${orders?.length || 0}`);
    console.log(`✅ Recent Orders: ${recentOrders?.length || 0}`);

  } catch (error) {
    console.error('❌ Critical error during schema check:', error);
  }
}

checkOrdersTableSchema();
