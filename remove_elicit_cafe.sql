-- Remove ELICIT 2025 cafe and all related data
-- This script will clean up the ELICIT event system from the database

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

-- Remove the ELICIT 2025 cafe
DELETE FROM cafes 
WHERE name = 'ELICIT 2025';

-- Remove the ELICIT cafe owner account (if exists)
DELETE FROM profiles 
WHERE email = 'elicit@mujfoodclub.in';

-- Remove any cafe staff entries for ELICIT
DELETE FROM cafe_staff 
WHERE cafe_id = (
  SELECT id FROM cafes 
  WHERE name = 'ELICIT 2025'
);

-- Note: The auth.users entry for elicit@mujfoodclub.in will remain
-- as it's managed by Supabase Auth and should be removed manually
-- from the Supabase Dashboard if needed
