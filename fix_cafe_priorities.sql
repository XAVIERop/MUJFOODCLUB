-- Fix cafe priorities and active status
-- This script ensures all cafes have proper priority values and are active

-- First, let's see the current state
SELECT 'BEFORE FIX' as status, name, priority, is_active FROM cafes ORDER BY priority ASC;

-- Update cafes to ensure they have proper priority values
-- Set priority to 999 for cafes that don't have a priority set
UPDATE cafes 
SET priority = 999 
WHERE priority IS NULL;

-- Set is_active to true for all cafes (assuming we want all cafes to be active)
UPDATE cafes 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- Set specific priorities for important cafes (adjust these as needed)
UPDATE cafes SET priority = 1 WHERE name = 'CHATKARA';
UPDATE cafes SET priority = 2 WHERE name = 'FOOD COURT';
UPDATE cafes SET priority = 3 WHERE name = 'COOK HOUSE';
UPDATE cafes SET priority = 4 WHERE name = 'Punjabi Tadka';
UPDATE cafes SET priority = 5 WHERE name = 'Munch Box';
UPDATE cafes SET priority = 6 WHERE name = 'Havmor';
UPDATE cafes SET priority = 7 WHERE name = 'China Town';
UPDATE cafes SET priority = 8 WHERE name = 'Mini Meals';

-- Show the result
SELECT 'AFTER FIX' as status, name, priority, is_active FROM cafes ORDER BY priority ASC;
