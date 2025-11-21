-- Add Ramen items to Banna's Chowki cafe
-- First, get the cafe ID for Banna's Chowki

-- Step 1: Find Banna's Chowki cafe ID (run this first to get the ID)
SELECT id, name, slug FROM cafes WHERE slug = 'bannas-chowki' OR name ILIKE '%banna%chowki%';

-- Step 2: Insert Ramen items (replace 'CAFE_ID_HERE' with the actual cafe ID from Step 1)
-- Or use the query below which uses a subquery to get the cafe ID automatically

INSERT INTO menu_items (
  cafe_id,
  name,
  description,
  price,
  category,
  is_available,
  out_of_stock,
  is_vegetarian,
  preparation_time,
  image_url
) 
SELECT 
  c.id as cafe_id,
  'Veg Hot & Spicy' as name,
  'Delicious vegetarian ramen with hot and spicy flavors' as description,
  99 as price,
  'Ramen' as category,
  true as is_available,
  false as out_of_stock,
  true as is_vegetarian,
  15 as preparation_time,
  NULL as image_url
FROM cafes c
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'

UNION ALL

SELECT 
  c.id as cafe_id,
  'Cheese Hot & Spicy' as name,
  'Creamy cheese ramen with hot and spicy flavors' as description,
  99 as price,
  'Ramen' as category,
  true as is_available,
  false as out_of_stock,
  false as is_vegetarian,
  15 as preparation_time,
  NULL as image_url
FROM cafes c
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'

UNION ALL

SELECT 
  c.id as cafe_id,
  'Korean Kimchi' as name,
  'Authentic Korean kimchi ramen with fermented vegetables' as description,
  99 as price,
  'Ramen' as category,
  true as is_available,
  false as out_of_stock,
  false as is_vegetarian,
  15 as preparation_time,
  NULL as image_url
FROM cafes c
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'

UNION ALL

SELECT 
  c.id as cafe_id,
  'CoCo Kimon' as name,
  'Special CoCo Kimon ramen with unique flavors' as description,
  119 as price,
  'Ramen' as category,
  true as is_available,
  false as out_of_stock,
  false as is_vegetarian,
  15 as preparation_time,
  NULL as image_url
FROM cafes c
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'

ON CONFLICT DO NOTHING;

-- Verify the items were added
SELECT 
  mi.id,
  mi.name,
  mi.price,
  mi.category,
  mi.is_available,
  c.name as cafe_name
FROM menu_items mi
JOIN cafes c ON mi.cafe_id = c.id
WHERE c.slug = 'bannas-chowki' OR c.name ILIKE '%banna%chowki%'
  AND mi.category = 'Ramen'
ORDER BY mi.name;

