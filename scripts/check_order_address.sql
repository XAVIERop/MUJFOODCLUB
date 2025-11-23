-- Check if the recent Amor orders have delivery_address saved
SELECT 
  order_number,
  delivery_block,
  delivery_address,
  delivery_latitude,
  delivery_longitude,
  created_at
FROM public.orders
WHERE order_number LIKE 'AM%'
ORDER BY created_at DESC
LIMIT 5;

