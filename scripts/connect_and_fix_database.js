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

async function diagnoseAndFixDatabase() {
  console.log('🔍 Connecting to database...');
  
  try {
    // 1. Check current triggers
    console.log('\n📋 Checking current triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_timing,
            action_statement
          FROM information_schema.triggers 
          WHERE event_object_table = 'orders' 
          AND event_object_schema = 'public'
          ORDER BY trigger_name;
        `
      });
    
    if (triggersError) {
      console.log('❌ Error checking triggers:', triggersError);
    } else {
      console.log('✅ Current triggers:', triggers);
    }

    // 2. Check order_notifications table structure
    console.log('\n📋 Checking order_notifications table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'order_notifications' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (tableError) {
      console.log('❌ Error checking table structure:', tableError);
    } else {
      console.log('✅ order_notifications table structure:', tableInfo);
    }

    // 3. Check foreign key constraints
    console.log('\n📋 Checking foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'order_notifications';
        `
      });
    
    if (constraintsError) {
      console.log('❌ Error checking constraints:', constraintsError);
    } else {
      console.log('✅ Foreign key constraints:', constraints);
    }

    // 4. Check recent orders
    console.log('\n📋 Checking recent orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error checking orders:', ordersError);
    } else {
      console.log('✅ Recent orders:', orders);
    }

    // 5. Check order_notifications
    console.log('\n📋 Checking order_notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('order_notifications')
      .select('id, order_id, notification_type, message, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notificationsError) {
      console.log('❌ Error checking notifications:', notificationsError);
    } else {
      console.log('✅ Recent notifications:', notifications);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the diagnosis
diagnoseAndFixDatabase();
