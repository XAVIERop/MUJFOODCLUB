-- Temporarily disable the points trigger to test if it's causing the error
-- Run this if you want to test order completion without the points system

-- 1. Disable the trigger temporarily
ALTER TABLE public.orders DISABLE TRIGGER trigger_award_points_on_order_completion;

-- 2. Verify the trigger is disabled
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_award_points_on_order_completion';

-- 3. Test order completion (this should work without the trigger)
-- Try marking an order as complete now

-- 4. To re-enable the trigger later, run:
-- ALTER TABLE public.orders ENABLE TRIGGER trigger_award_points_on_order_completion;
