-- Switch off accepting orders for Let's Go Live cafe
UPDATE public.cafes 
SET accepting_orders = false, updated_at = NOW()
WHERE name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%';

-- Verify the change
SELECT 
    name,
    priority,
    is_active,
    accepting_orders,
    CASE 
        WHEN accepting_orders = false THEN '❌ NOT ACCEPTING ORDERS'
        WHEN accepting_orders = true THEN '✅ ACCEPTING ORDERS'
        ELSE '❓ UNKNOWN'
    END as order_status
FROM public.cafes 
WHERE name ILIKE '%lets go live%' 
   OR name ILIKE '%let''s go live%'
   OR name ILIKE '%letsgolive%';
