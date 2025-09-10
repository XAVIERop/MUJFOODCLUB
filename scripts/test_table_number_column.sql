-- Test script to check if table_number column exists and has data
-- Run this in Supabase SQL Editor

-- Check if table_number column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public' 
  AND column_name = 'table_number';

-- Check recent orders and their table_number values
SELECT 
  id,
  order_number,
  delivery_block,
  table_number,
  created_at
FROM public.orders 
WHERE delivery_block = 'DINE_IN'
ORDER BY created_at DESC 
LIMIT 10;

-- Check if any orders have table_number populated
SELECT 
  COUNT(*) as total_orders,
  COUNT(table_number) as orders_with_table_number,
  COUNT(CASE WHEN table_number IS NOT NULL AND table_number != '' THEN 1 END) as non_empty_table_numbers
FROM public.orders 
WHERE delivery_block = 'DINE_IN';
