-- Test script to manually add ELICIT menu items
-- Run this in Supabase SQL Editor

-- First, check if the cafes exist
SELECT id, name FROM public.cafes WHERE name IN ('ZERO DEGREE CAFE', 'Dialog');

-- Add ELICIT special items for Zero Degree Cafe
INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, preparation_time) 
SELECT 
  id as cafe_id,
  'ELICIT - Classic margherita' as name,
  'ELICIT Event Special - Classic margherita pizza' as description,
  255 as price,
  'ELICIT Special' as category,
  true as is_available,
  15 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Veggie lover' as name,
  'ELICIT Event Special - Veggie lover pizza' as description,
  305 as price,
  'ELICIT Special' as category,
  true as is_available,
  15 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Paneer makhani' as name,
  'ELICIT Event Special - Paneer makhani' as description,
  335 as price,
  'ELICIT Special' as category,
  true as is_available,
  20 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Peri peri fries' as name,
  'ELICIT Event Special - Peri peri fries' as description,
  110 as price,
  'ELICIT Special' as category,
  true as is_available,
  10 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Salted fries' as name,
  'ELICIT Event Special - Salted fries' as description,
  100 as price,
  'ELICIT Special' as category,
  true as is_available,
  10 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Ice tea' as name,
  'ELICIT Event Special - Ice tea' as description,
  60 as price,
  'ELICIT Special' as category,
  true as is_available,
  5 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Cold coffee' as name,
  'ELICIT Event Special - Cold coffee' as description,
  80 as price,
  'ELICIT Special' as category,
  true as is_available,
  5 as preparation_time
FROM public.cafes WHERE name = 'ZERO DEGREE CAFE';

-- Add ELICIT special items for Dialog
INSERT INTO public.menu_items (cafe_id, name, description, price, category, is_available, preparation_time) 
SELECT 
  id as cafe_id,
  'ELICIT - C4' as name,
  'ELICIT Event Special - C4 pizza' as description,
  390 as price,
  'ELICIT Special' as category,
  true as is_available,
  15 as preparation_time
FROM public.cafes WHERE name = 'Dialog'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Paneer makhani' as name,
  'ELICIT Event Special - Paneer makhani' as description,
  455 as price,
  'ELICIT Special' as category,
  true as is_available,
  20 as preparation_time
FROM public.cafes WHERE name = 'Dialog'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - High five' as name,
  'ELICIT Event Special - High five pizza' as description,
  400 as price,
  'ELICIT Special' as category,
  true as is_available,
  15 as preparation_time
FROM public.cafes WHERE name = 'Dialog'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Cold coffee' as name,
  'ELICIT Event Special - Cold coffee' as description,
  125 as price,
  'ELICIT Special' as category,
  true as is_available,
  5 as preparation_time
FROM public.cafes WHERE name = 'Dialog'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Oreo shake' as name,
  'ELICIT Event Special - Oreo shake' as description,
  145 as price,
  'ELICIT Special' as category,
  true as is_available,
  10 as preparation_time
FROM public.cafes WHERE name = 'Dialog'
UNION ALL
SELECT 
  id as cafe_id,
  'ELICIT - Coke' as name,
  'ELICIT Event Special - Coke' as description,
  40 as price,
  'ELICIT Special' as category,
  true as is_available,
  2 as preparation_time
FROM public.cafes WHERE name = 'Dialog';

-- Verify the items were added
SELECT 
  c.name as cafe_name,
  mi.name as item_name,
  mi.price,
  mi.category
FROM public.menu_items mi
JOIN public.cafes c ON mi.cafe_id = c.id
WHERE mi.category = 'ELICIT Special'
ORDER BY c.name, mi.name;
