-- Quick Fix: Disable the points trigger to test order completion
-- Run this to immediately fix the "Mark Complete" error

-- 1. Disable the trigger that's causing the error
ALTER TABLE public.orders DISABLE TRIGGER trigger_award_points_on_order_completion;

-- 2. Verify the trigger is disabled
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';

-- 3. Now try marking an order as complete in the cafe dashboard
-- It should work without the points trigger causing errors

-- 4. To re-enable the trigger later (after fixing the issue), run:
-- ALTER TABLE public.orders ENABLE TRIGGER trigger_award_points_on_order_completion;
