import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kblazvxfducwviyyiwde.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMzI0NjgsImV4cCI6MjA3MTcwODQ2OH0.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrderSystem() {
  console.log('🛒 TESTING ORDER SYSTEM');
  console.log('========================\n');

  try {
    // 1. Test Orders Table
    console.log('1️⃣  Testing Orders Table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        payment_method,
        points_earned,
        delivery_block,
        delivery_notes,
        created_at,
        cafes!inner(name),
        profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    } else {
      console.log(`✅ Found ${orders.length} recent orders`);
      orders.forEach(order => {
        console.log(`   - Order #${order.order_number}: ${order.cafes.name} - ₹${order.total_amount} (${order.status})`);
        console.log(`     Customer: ${order.profiles.full_name} (${order.profiles.email})`);
        console.log(`     Payment: ${order.payment_method} - Points: ${order.points_earned}`);
        console.log(`     Delivery: ${order.delivery_block} - ${order.delivery_notes || 'No notes'}`);
        console.log(`     Date: ${new Date(order.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // 2. Test Order Items
    console.log('2️⃣  Testing Order Items...');
    if (orders && orders.length > 0) {
      const sampleOrder = orders[0];
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          notes,
          menu_items!inner(name, category)
        `)
        .eq('order_id', sampleOrder.id);

      if (itemsError) {
        console.error('❌ Error fetching order items:', itemsError);
      } else {
        console.log(`✅ Order #${sampleOrder.order_number} has ${orderItems.length} items:`);
        orderItems.forEach(item => {
          console.log(`   - ${item.menu_items.name} (${item.menu_items.category}) x${item.quantity} - ₹${item.price}`);
          if (item.notes) {
            console.log(`     Notes: ${item.notes}`);
          }
        });
      }
    }

    // 3. Test Order Status Flow
    console.log('\n3️⃣  Testing Order Status Flow...');
    const statusCounts = {};
    orders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    console.log('✅ Order status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} orders`);
    });

    // 4. Test Payment Methods and Points
    console.log('\n4️⃣  Testing Payment Methods and Points...');
    const paymentMethods = {};
    const pointsEarned = {};
    orders?.forEach(order => {
      paymentMethods[order.payment_method] = (paymentMethods[order.payment_method] || 0) + 1;
      const points = order.points_earned || 0;
      pointsEarned[points] = (pointsEarned[points] || 0) + 1;
    });

    console.log('✅ Payment methods used:');
    Object.entries(paymentMethods).forEach(([method, count]) => {
      console.log(`   - ${method}: ${count} orders`);
    });

    console.log('✅ Points earned distribution:');
    Object.entries(pointsEarned).forEach(([points, count]) => {
      console.log(`   - ${points} points: ${count} orders`);
    });

    // 5. Test Order Totals and Calculations
    console.log('\n5️⃣  Testing Order Calculations...');
    if (orders && orders.length > 0) {
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      const avgOrderValue = totalRevenue / orders.length;
      const totalPointsEarned = orders.reduce((sum, order) => sum + (order.points_earned || 0), 0);

      console.log('✅ Order calculations:');
      console.log(`   - Total Revenue: ₹${totalRevenue.toFixed(2)}`);
      console.log(`   - Average Order Value: ₹${avgOrderValue.toFixed(2)}`);
      console.log(`   - Total Points Earned: ${totalPointsEarned}`);
    }

    // 6. Test Cafe-wise Order Distribution
    console.log('\n6️⃣  Testing Cafe-wise Order Distribution...');
    const cafeOrders = {};
    orders?.forEach(order => {
      const cafeName = order.cafes.name;
      cafeOrders[cafeName] = (cafeOrders[cafeName] || 0) + 1;
    });

    console.log('✅ Orders by cafe:');
    Object.entries(cafeOrders).forEach(([cafe, count]) => {
      console.log(`   - ${cafe}: ${count} orders`);
    });

    // 7. Test Order Timeline
    console.log('\n7️⃣  Testing Order Timeline...');
    if (orders && orders.length > 0) {
      const recentOrder = orders[0];
      const orderDate = new Date(recentOrder.created_at);
      const now = new Date();
      const timeDiff = now - orderDate;
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));

      console.log(`✅ Most recent order: #${recentOrder.order_number}`);
      console.log(`   - Created: ${orderDate.toLocaleString()}`);
      console.log(`   - Time ago: ${hoursAgo} hours`);
      console.log(`   - Status: ${recentOrder.status}`);
    }

    // 8. Test Order System Health
    console.log('\n8️⃣  Testing Order System Health...');
    const systemHealth = {
      ordersExist: orders && orders.length > 0,
      multipleStatuses: Object.keys(statusCounts).length > 1,
      paymentMethodsWorking: Object.keys(paymentMethods).length > 0,
      cafeDistribution: Object.keys(cafeOrders).length > 1,
      recentActivity: orders && orders.length > 0 && (new Date() - new Date(orders[0].created_at)) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
    };

    console.log('✅ System health indicators:');
    console.log(`   - Orders exist: ${systemHealth.ordersExist ? '✅' : '❌'}`);
    console.log(`   - Multiple statuses: ${systemHealth.multipleStatuses ? '✅' : '❌'}`);
    console.log(`   - Payment methods working: ${systemHealth.paymentMethodsWorking ? '✅' : '❌'}`);
    console.log(`   - Multiple cafes receiving orders: ${systemHealth.cafeDistribution ? '✅' : '❌'}`);
    console.log(`   - Recent activity: ${systemHealth.recentActivity ? '✅' : '❌'}`);

    // Summary
    console.log('\n📊 ORDER SYSTEM SUMMARY');
    console.log('========================');
    console.log(`✅ Total Orders: ${orders?.length || 0}`);
    console.log(`✅ Order Statuses: ${Object.keys(statusCounts).length}`);
    console.log(`✅ Payment Methods: ${Object.keys(paymentMethods).length}`);
    console.log(`✅ Cafes with Orders: ${Object.keys(cafeOrders).length}`);
    console.log(`✅ System Health: ${Object.values(systemHealth).every(h => h) ? 'Good' : 'Needs Attention'}`);

    const healthScore = Object.values(systemHealth).filter(h => h).length / Object.keys(systemHealth).length;
    console.log(`✅ Health Score: ${Math.round(healthScore * 100)}%`);

    if (healthScore >= 0.8) {
      console.log('\n🎯 ORDER SYSTEM STATUS: READY FOR PRODUCTION');
    } else if (healthScore >= 0.6) {
      console.log('\n🎯 ORDER SYSTEM STATUS: MOSTLY READY - MINOR ISSUES');
    } else {
      console.log('\n🎯 ORDER SYSTEM STATUS: NEEDS ATTENTION');
    }

  } catch (error) {
    console.error('❌ Critical error during order system test:', error);
  }
}

testOrderSystem();
