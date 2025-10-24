-- Auto-Reopen First 10 Cafes at 11:00 AM
-- Simple SQL script to reopen cafes

-- Update first 10 cafes (by priority) to accepting orders
UPDATE public.cafes 
SET 
    accepting_orders = true,
    updated_at = NOW()
WHERE id IN (
    SELECT id 
    FROM public.cafes 
    ORDER BY priority ASC 
    LIMIT 10
);

-- Show which cafes were reopened
SELECT 
    name,
    priority,
    accepting_orders,
    updated_at
FROM public.cafes 
WHERE accepting_orders = true
ORDER BY priority ASC
LIMIT 10;
