-- Check what prefix Banna's Chowki gets and verify order numbers
SELECT 
  'Checking Banna''s Chowki prefix and orders' as info;

-- Check cafe name and what prefix it would get
SELECT 
  id,
  name,
  public.get_cafe_prefix(name) as cafe_prefix
FROM public.cafes
WHERE LOWER(name) LIKE '%banna%' OR LOWER(name) LIKE '%chowki%';

-- Check existing order numbers for Banna's Chowki today
SELECT 
  order_number,
  created_at,
  order_type,
  DATE(created_at) as order_date
FROM public.orders
WHERE cafe_id IN (
  SELECT id FROM public.cafes 
  WHERE LOWER(name) LIKE '%banna%' OR LOWER(name) LIKE '%chowki%'
)
AND DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 20;

-- Check if there are any order numbers that don't match the expected pattern
SELECT 
  order_number,
  created_at,
  CASE 
    WHEN order_number ~ ('^' || public.get_cafe_prefix(c.name) || '[0-9]{6}$') THEN '✅ Valid format'
    ELSE '❌ Invalid format'
  END as format_status
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE LOWER(c.name) LIKE '%banna%' OR LOWER(c.name) LIKE '%chowki%'
AND DATE(o.created_at) = CURRENT_DATE
ORDER BY o.created_at DESC;

