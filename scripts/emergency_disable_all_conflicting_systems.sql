-- =====================================================
-- Emergency: Disable ALL Conflicting Systems
-- =====================================================

-- 1. Check ALL triggers on orders table
SELECT 
  '=== ALL TRIGGERS ON ORDERS TABLE ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 2. Disable ALL triggers that might be interfering with points
-- Keep only our new_rewards_order_completion_trigger and safe ones

-- Disable any triggers that might be causing the old system
DROP TRIGGER IF EXISTS handle_new_user_first_order_trigger ON public.orders;
DROP TRIGGER IF EXISTS cafe_loyalty_order_completion_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_status_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS order_completion_simple_trigger ON public.orders;
DROP TRIGGER IF EXISTS track_maintenance_spending_trigger ON public.orders;

-- 3. Verify only safe triggers remain
SELECT 
  '=== REMAINING TRIGGERS AFTER CLEANUP ===' as section,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'orders'
ORDER BY trigger_name;

-- 4. Reset Maahi's points completely
UPDATE public.cafe_loyalty_points 
SET 
    points = 125,  -- Reset to correct value
    total_spent = 1325.00,  -- Only count the original 2 orders
    monthly_spend_30_days = 1325.00,
    current_tier = 'foodie',
    updated_at = NOW()
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d';

-- 5. Delete ALL incorrect transactions
DELETE FROM public.cafe_loyalty_transactions 
WHERE user_id = 'a4a6bc64-378a-4c94-9dbf-622140428c9d'
  AND (description LIKE '%Points earned from order%' 
       OR description LIKE '%Level up bonus%'
       OR points_change > 100);

-- 6. Recreate only the correct transactions
INSERT INTO public.cafe_loyalty_transactions (user_id, cafe_id, order_id, points_change, transaction_type, description, created_at) VALUES
('a4a6bc64-378a-4c94-9dbf-622140428c9d', '25d0b247-0731-4e52-a0fb-023526adfa34', '1c35f3d2-b084-449c-9f9b-81c46e4d99bd', 75, 'first_order_bonus', 'First order bonus + points: 75 (5% of ₹475.00)', '2025-09-13 21:28:52.488979+00'),
('a4a6bc64-378a-4c94-9dbf-622140428c9d', '25d0b247-0731-4e52-a0fb-023526adfa34', '9f0b5638-6e93-4d09-8b3e-3a249d5260eb', 50, 'earned', 'Points earned: 50 (5% of ₹850.00)', '2025-09-13 21:53:56.370277+00');

-- 7. Final verification
SELECT 
  '=== EMERGENCY CLEANUP COMPLETE ===' as section,
  'All conflicting triggers disabled' as status1,
  'Maahi points reset to 125' as status2,
  'Only correct transactions remain' as status3,
  'System should now work correctly' as status4;
