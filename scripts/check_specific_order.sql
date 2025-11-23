-- Check if order AM0000004 has delivery_address
SELECT 
  order_number,
  delivery_block,
  delivery_address,
  delivery_latitude,
  delivery_longitude,
  created_at,
  customer_name
FROM public.orders
WHERE order_number = 'AM0000004';
