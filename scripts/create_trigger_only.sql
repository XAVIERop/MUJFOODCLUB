-- =====================================================
-- Create Trigger Only (Function Already Exists)
-- =====================================================

-- 1. Create the new rewards trigger
DROP TRIGGER IF EXISTS new_rewards_order_completion_trigger ON public.orders;
CREATE TRIGGER new_rewards_order_completion_trigger
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_rewards_order_completion();

-- 2. Verify the trigger was created
SELECT 
  '=== NEW REWARDS TRIGGER CREATED ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
  AND trigger_name = 'new_rewards_order_completion_trigger';

-- 3. Check all triggers on orders table to see our new one
SELECT 
  '=== ALL TRIGGERS ON ORDERS (UPDATED) ===' as section,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;
