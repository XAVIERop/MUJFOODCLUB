-- Accept orders for Food Court and Cook House cafes
-- This query sets accepting_orders = true for these specific cafes

UPDATE public.cafes 
SET 
    accepting_orders = true,
    updated_at = NOW()
WHERE 
    name ILIKE '%food court%' 
    OR name ILIKE '%cook house%'
    OR name = 'FOOD COURT'
    OR name = 'COOK HOUSE';

-- Verify the update
SELECT 
    id,
    name,
    accepting_orders,
    updated_at
FROM public.cafes 
WHERE 
    name ILIKE '%food court%' 
    OR name ILIKE '%cook house%'
    OR name = 'FOOD COURT'
    OR name = 'COOK HOUSE'
ORDER BY name;
