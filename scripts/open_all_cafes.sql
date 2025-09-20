-- Open all cafes that are currently closed
-- This script will set all cafes to be active and accepting orders

-- First, let's see which cafes are currently closed
SELECT 'BEFORE UPDATE - Current Status:' as status;
SELECT 
  name,
  is_active,
  accepting_orders
FROM public.cafes 
ORDER BY name;

-- Update all cafes to be active and accepting orders
UPDATE public.cafes 
SET 
  is_active = true,
  accepting_orders = true,
  updated_at = NOW()
WHERE is_active = false OR accepting_orders = false;

-- Show the results after update
SELECT 'AFTER UPDATE - New Status:' as status;
SELECT 
  name,
  is_active,
  accepting_orders,
  updated_at
FROM public.cafes 
ORDER BY name;

-- Count how many cafes were updated
SELECT 
  COUNT(*) as total_cafes,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_cafes,
  COUNT(CASE WHEN accepting_orders = true THEN 1 END) as accepting_orders_cafes
FROM public.cafes;



