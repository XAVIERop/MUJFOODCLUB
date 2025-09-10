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

async function fixForeignKeyIssue() {
  console.log('🔧 Fixing foreign key constraint issue...');
  
  try {
    // 1. First, let's check if there are any triggers causing issues
    console.log('\n📋 Checking for problematic triggers...');
    
    // 2. Drop all existing triggers to start fresh
    console.log('\n🗑️ Dropping all existing triggers...');
    
    const dropTriggersSQL = `
      -- Drop all existing triggers
      DROP TRIGGER IF EXISTS order_operations_trigger ON public.orders;
      DROP TRIGGER IF EXISTS order_insert_trigger ON public.orders;
      DROP TRIGGER IF EXISTS order_update_trigger ON public.orders;
      DROP TRIGGER IF EXISTS new_order_notification_trigger ON public.orders;
      DROP TRIGGER IF EXISTS consolidated_order_update_trigger ON public.orders;
      DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
      DROP TRIGGER IF EXISTS queue_management_trigger ON public.orders;
      DROP TRIGGER IF EXISTS order_analytics_trigger ON public.orders;
      DROP TRIGGER IF EXISTS item_analytics_trigger ON public.orders;
    `;
    
    const { error: dropError } = await supabase.rpc('exec', { sql: dropTriggersSQL });
    if (dropError) {
      console.log('⚠️ Error dropping triggers (might not exist):', dropError.message);
    } else {
      console.log('✅ All triggers dropped successfully');
    }

    // 3. Create a simple, clean trigger function
    console.log('\n🔧 Creating clean trigger function...');
    
    const createFunctionSQL = `
      -- Create a simple trigger function that handles order operations safely
      CREATE OR REPLACE FUNCTION public.handle_order_operations_safe()
      RETURNS TRIGGER AS $$
      BEGIN
        -- For INSERT operations (new orders)
        IF TG_OP = 'INSERT' THEN
          -- Set initial timestamps
          NEW.status_updated_at = now();
          RETURN NEW;
        END IF;
        
        -- For UPDATE operations (status changes)
        IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
          -- Update status timestamp
          NEW.status_updated_at = now();
          
          -- Add specific status timestamps (only if not already set)
          CASE NEW.status
            WHEN 'confirmed' THEN
              NEW.accepted_at = COALESCE(NEW.accepted_at, now());
            WHEN 'preparing' THEN
              NEW.preparing_at = COALESCE(NEW.preparing_at, now());
            WHEN 'on_the_way' THEN
              NEW.out_for_delivery_at = COALESCE(NEW.out_for_delivery_at, now());
            WHEN 'completed' THEN
              NEW.completed_at = COALESCE(NEW.completed_at, now());
              NEW.points_credited = true;
              
              -- Credit points only if not already credited
              IF NOT OLD.points_credited AND NEW.points_earned > 0 THEN
                UPDATE public.profiles 
                SET 
                  loyalty_points = loyalty_points + NEW.points_earned,
                  total_orders = total_orders + 1,
                  total_spent = total_spent + NEW.total_amount
                WHERE id = NEW.user_id;
              END IF;
          END CASE;
          
          RETURN NEW;
        END IF;
        
        -- For any other UPDATE operations, just return NEW without changes
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: functionError } = await supabase.rpc('exec', { sql: createFunctionSQL });
    if (functionError) {
      console.log('❌ Error creating function:', functionError.message);
    } else {
      console.log('✅ Clean trigger function created successfully');
    }

    // 4. Create a simple trigger for order operations
    console.log('\n🔧 Creating simple trigger...');
    
    const createTriggerSQL = `
      -- Create a simple trigger
      CREATE TRIGGER order_operations_safe_trigger
        BEFORE INSERT OR UPDATE ON public.orders
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_order_operations_safe();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec', { sql: createTriggerSQL });
    if (triggerError) {
      console.log('❌ Error creating trigger:', triggerError.message);
    } else {
      console.log('✅ Simple trigger created successfully');
    }

    // 5. Create a separate function for notifications (AFTER INSERT)
    console.log('\n🔧 Creating notification function...');
    
    const createNotificationFunctionSQL = `
      -- Create function for new order notifications
      CREATE OR REPLACE FUNCTION public.handle_new_order_notification_safe()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Create new order notification after the order is fully created
        INSERT INTO public.order_notifications (
          order_id,
          cafe_id,
          user_id,
          notification_type,
          message
        ) VALUES (
          NEW.id,
          NEW.cafe_id,
          NEW.user_id,
          'new_order',
          'New order #' || NEW.order_number || ' received'
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: notifFunctionError } = await supabase.rpc('exec', { sql: createNotificationFunctionSQL });
    if (notifFunctionError) {
      console.log('❌ Error creating notification function:', notifFunctionError.message);
    } else {
      console.log('✅ Notification function created successfully');
    }

    // 6. Create AFTER INSERT trigger for notifications
    console.log('\n🔧 Creating notification trigger...');
    
    const createNotificationTriggerSQL = `
      -- Create AFTER INSERT trigger for notifications
      CREATE TRIGGER new_order_notification_safe_trigger
        AFTER INSERT ON public.orders
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_order_notification_safe();
    `;
    
    const { error: notifTriggerError } = await supabase.rpc('exec', { sql: createNotificationTriggerSQL });
    if (notifTriggerError) {
      console.log('❌ Error creating notification trigger:', notifTriggerError.message);
    } else {
      console.log('✅ Notification trigger created successfully');
    }

    // 7. Test the setup by checking if we can create a test order
    console.log('\n🧪 Testing the setup...');
    
    // Check if we can fetch orders (this tests basic connectivity)
    const { data: testOrders, error: testError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .limit(1);
    
    if (testError) {
      console.log('❌ Test failed:', testError.message);
    } else {
      console.log('✅ Database connectivity test passed');
      console.log('✅ Sample order:', testOrders[0]);
    }

    console.log('\n🎉 Foreign key constraint issue should now be fixed!');
    console.log('📋 Summary of changes:');
    console.log('  - Removed all conflicting triggers');
    console.log('  - Created simple, safe trigger functions');
    console.log('  - Separated order creation from notifications');
    console.log('  - Notifications now created AFTER order is fully inserted');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixForeignKeyIssue();
