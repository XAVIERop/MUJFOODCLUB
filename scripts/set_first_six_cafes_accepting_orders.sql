-- Set only the first 6 cafes to accept orders
-- Based on priority ordering: CHATKARA, FOOD COURT, Mini Meals, Punjabi Tadka, Munch Box, COOK HOUSE

BEGIN;

-- First, let's see the current status
SELECT 'BEFORE UPDATE - Current Status:' as status;
SELECT 
  name,
  priority,
  is_active,
  accepting_orders
FROM public.cafes 
ORDER BY priority ASC NULLS LAST, name ASC;

-- Step 1: Set ALL cafes to NOT accepting orders (safety first)
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

-- Verify the update
SELECT 'AFTER UPDATE - New Status:' as status;
SELECT 
  name,
  priority,
  is_active,
  accepting_orders,
  CASE 
    WHEN accepting_orders = true THEN '✅ ORDER NOW'
    ELSE '⏳ COMING SOON'
  END as button_text
FROM public.cafes 
ORDER BY priority ASC NULLS LAST, name ASC;

-- Show summary
SELECT 
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders_cafes,
  COUNT(CASE WHEN accepting_orders = false THEN 1 END) as coming_soon_cafes
FROM public.cafes;

COMMIT;
