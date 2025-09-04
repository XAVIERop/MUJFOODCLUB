-- Check Food Court cafe in database
-- This script will help us identify the correct cafe information

-- 1. Get all cafes
SELECT 'All Cafes:' as info;
SELECT id, name, type, created_at 
FROM cafes 
ORDER BY name;

-- 2. Search for Food Court specifically
SELECT 'Food Court Cafes:' as info;
SELECT id, name, type, created_at 
FROM cafes 
WHERE name ILIKE '%food court%';

-- 3. Check the specific cafe ID from the error
SELECT 'Specific Cafe ID Check:' as info;
SELECT * 
FROM cafes 
WHERE id = '3e5955ba-9b90-48ce-9d07-cc686678a10e';

-- 4. Check if there are any orders for this cafe ID
SELECT 'Orders for Cafe ID:' as info;
SELECT id, order_number, cafe_id, total_amount, created_at 
FROM orders 
WHERE cafe_id = '3e5955ba-9b90-48ce-9d07-cc686678a10e'
LIMIT 5;

-- 5. Check cafe staff for this cafe ID
SELECT 'Cafe Staff for Cafe ID:' as info;
SELECT cs.*, p.email, p.full_name
FROM cafe_staff cs
LEFT JOIN profiles p ON cs.user_id = p.id
WHERE cs.cafe_id = '3e5955ba-9b90-48ce-9d07-cc686678a10e';
