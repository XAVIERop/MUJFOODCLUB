-- Alternative approach: Remove ELICIT 2025 cafe and all related data
-- This script handles foreign key constraints more carefully

-- Step 1: First, let's see what's referencing the ELICIT cafe
-- Run this query first to see what needs to be cleaned up:
-- SELECT 
--   'profiles' as table_name, 
--   COUNT(*) as count 
-- FROM profiles 
-- WHERE cafe_id = (SELECT id FROM cafes WHERE name = 'ELICIT 2025')
-- UNION ALL
-- SELECT 
--   'menu_items' as table_name, 
--   COUNT(*) as count 
-- FROM menu_items 
-- WHERE cafe_id = (SELECT id FROM cafes WHERE name = 'ELICIT 2025')
-- UNION ALL
-- SELECT 
--   'orders' as table_name, 
--   COUNT(*) as count 
-- FROM orders 
-- WHERE cafe_id = (SELECT id FROM cafes WHERE name = 'ELICIT 2025')
-- UNION ALL
-- SELECT 
--   'cafe_staff' as table_name, 
--   COUNT(*) as count 
-- FROM cafe_staff 
-- WHERE cafe_id = (SELECT id FROM cafes WHERE name = 'ELICIT 2025');

-- Step 2: Remove in the correct order to avoid foreign key violations

-- First, remove all menu items for ELICIT 2025 cafe
DELETE FROM menu_items 
WHERE cafe_id = (
  SELECT id FROM cafes 
  WHERE name = 'ELICIT 2025'
);

-- Remove all orders for ELICIT 2025 cafe
DELETE FROM orders 
WHERE cafe_id = (
  SELECT id FROM cafes 
  WHERE name = 'ELICIT 2025'
);

-- Remove any cafe staff entries for ELICIT
DELETE FROM cafe_staff 
WHERE cafe_id = (
  SELECT id FROM cafes 
  WHERE name = 'ELICIT 2025'
);

-- Remove the ELICIT cafe owner account (if exists)
-- This should be done before removing the cafe
DELETE FROM profiles 
WHERE email = 'elicit@mujfoodclub.in';

-- If there are still references, try this approach:
-- Update any remaining profiles that reference the ELICIT cafe
UPDATE profiles 
SET cafe_id = NULL 
WHERE cafe_id = (
  SELECT id FROM cafes 
  WHERE name = 'ELICIT 2025'
);

-- Now remove the ELICIT 2025 cafe
DELETE FROM cafes 
WHERE name = 'ELICIT 2025';

-- Note: The auth.users entry for elicit@mujfoodclub.in will remain
-- as it's managed by Supabase Auth and should be removed manually
-- from the Supabase Dashboard if needed
