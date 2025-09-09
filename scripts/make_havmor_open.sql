-- Make Havmor Open
-- This script updates Havmor's accepting_orders status to true

-- Update Havmor to accept orders
UPDATE public.cafes 
SET 
    accepting_orders = true,
    updated_at = NOW()
WHERE name ILIKE '%havmor%';

-- Verify the change
SELECT 
    name,
    accepting_orders,
    priority,
    is_exclusive,
    updated_at
FROM public.cafes 
WHERE name ILIKE '%havmor%';

-- Show all exclusive cafes and their status
SELECT 
    name,
    accepting_orders,
    priority,
    is_exclusive
FROM public.cafes 
WHERE is_exclusive = true
ORDER BY priority ASC;
