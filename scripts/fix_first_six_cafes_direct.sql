-- DIRECT SQL SCRIPT TO SET FIRST 6 CAFES TO ACCEPT ORDERS
-- Run this directly in Supabase SQL Editor

-- Step 1: Set ALL cafes to NOT accepting orders
UPDATE public.cafes 
SET 
  accepting_orders = false,
  updated_at = NOW();

-- Step 2: Set only the first 6 cafes (by priority) to accept orders
UPDATE public.cafes 
SET 
  accepting_orders = true,
  updated_at = NOW()
WHERE name IN (
  'CHATKARA',
  'FOOD COURT', 
  'Mini Meals',
  'Punjabi Tadka',
  'Munch Box',
  'COOK HOUSE'
);

-- Verify the results
SELECT 
  name,
  priority,
  is_active,
  accepting_orders,
  CASE 
    WHEN accepting_orders = true THEN '✅ ORDER NOW'
    ELSE '⏳ COMING SOON'
  END as button_status
FROM public.cafes 
ORDER BY priority ASC NULLS LAST, name ASC;

-- Show summary
SELECT 
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders_cafes,
  COUNT(CASE WHEN accepting_orders = false THEN 1 END) as coming_soon_cafes
FROM public.cafes;
