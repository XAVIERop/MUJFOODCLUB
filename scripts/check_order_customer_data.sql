-- Check customer information in orders table
-- This will help us understand why orders show "Walk-in Customer"

-- Check the structure of orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample order data with customer info
SELECT 
  id,
  order_number,
  user_id,
  customer_name,
  phone_number,
  delivery_block,
  created_at
FROM orders 
WHERE cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'
ORDER BY created_at DESC
LIMIT 5;

-- Check if user_id links to profiles table
SELECT 
  o.id,
  o.order_number,
  o.user_id,
  o.customer_name,
  p.full_name as profile_name,
  p.phone as profile_phone,
  p.block as profile_block
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
WHERE o.cafe_id = '25d0b247-0731-4e52-a0fb-023526adfa34'
ORDER BY o.created_at DESC
LIMIT 5;
