-- Split all combined menu items into separate individual items for Taste of India
-- This will convert items with "/" into separate menu items with same prices

-- Step 1: Check current combined items
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND (name LIKE '%/%' OR name LIKE '% / %')
ORDER BY category, name;

-- Step 2: Split Indian Curries items

-- Kadhai Mushroom / Mutter Mushroom
UPDATE public.menu_items
SET 
    name = 'Kadhai Mushroom',
    description = 'Kadhai-style mushroom curry',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Kadhai Mushroom / Mutter Mushroom';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Mutter Mushroom', 'Green pea mushroom curry', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Kadhai Mushroom';

-- Jeera Aloo / Aloo Mutter
UPDATE public.menu_items
SET 
    name = 'Jeera Aloo',
    description = 'Cumin potatoes curry',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Jeera Aloo / Aloo Mutter';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Aloo Mutter', 'Potato with peas curry', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Jeera Aloo';

-- Paneer Handi / Paneer Butter Masala
UPDATE public.menu_items
SET 
    name = 'Paneer Handi',
    description = 'Handi-style paneer curry',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Handi / Paneer Butter Masala';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Paneer Butter Masala', 'Rich butter masala paneer curry', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Handi';

-- Step 3: Split Indian Starters items

-- Harabhara Kabab / Falafel Kabab
UPDATE public.menu_items
SET 
    name = 'Harabhara Kabab',
    description = 'Green vegetable kabab',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Harabhara Kabab / Falafel Kabab';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Falafel Kabab', 'Chickpea falafel kabab', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Harabhara Kabab';

-- Paneer Sashlik / Chicken Sheekh Kabab
UPDATE public.menu_items
SET 
    name = 'Paneer Sashlik',
    description = 'Paneer skewered kabab',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Sashlik / Chicken Sheekh Kabab';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chicken Sheekh Kabab', 'Chicken skewered kabab', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Sashlik';

-- Malai Chicken / Peri Peri Sheekh Kabab
UPDATE public.menu_items
SET 
    name = 'Malai Chicken',
    description = 'Creamy malai chicken kabab',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Malai Chicken / Peri Peri Sheekh Kabab';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Peri Peri Sheekh Kabab', 'Spicy peri peri chicken kabab', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Malai Chicken';

-- Malai Chicken / Peri Peri Chicken Tikka
UPDATE public.menu_items
SET 
    name = 'Malai Chicken Tikka',
    description = 'Creamy malai chicken tikka',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Malai Chicken / Peri Peri Chicken Tikka';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Peri Peri Chicken Tikka', 'Spicy peri peri chicken tikka', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Malai Chicken Tikka';

-- Step 4: Split Oriental Starters items

-- Paneer/Chicken 65
UPDATE public.menu_items
SET 
    name = 'Paneer 65',
    description = 'Spicy paneer 65',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer/Chicken 65';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chicken 65', 'Spicy chicken 65', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer 65';

-- Szechwan/Chili Garlic Chicken
UPDATE public.menu_items
SET 
    name = 'Szechwan Chicken',
    description = 'Szechwan style chicken',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan/Chili Garlic Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chili Garlic Chicken', 'Chili garlic chicken', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan Chicken';

-- Chili Paneer/Paneer Salt N Pepper
UPDATE public.menu_items
SET 
    name = 'Chili Paneer',
    description = 'Spicy chili paneer',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Chili Paneer/Paneer Salt N Pepper';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Paneer Salt N Pepper', 'Paneer with salt and pepper', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Chili Paneer';

-- Step 5: Split Soups items

-- Sweet Corn Veg / Chicken
UPDATE public.menu_items
SET 
    name = 'Sweet Corn Veg Soup',
    description = 'Sweet corn vegetable soup',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Sweet Corn Veg / Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Sweet Corn Chicken Soup', 'Sweet corn chicken soup', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Sweet Corn Veg Soup';

-- Hot n Sour Veg / Chicken
UPDATE public.menu_items
SET 
    name = 'Hot n Sour Veg Soup',
    description = 'Hot and sour vegetable soup',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hot n Sour Veg / Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Hot n Sour Chicken Soup', 'Hot and sour chicken soup', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hot n Sour Veg Soup';

-- Manchow Veg / Chicken
UPDATE public.menu_items
SET 
    name = 'Manchow Veg Soup',
    description = 'Manchow vegetable soup',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Manchow Veg / Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Manchow Chicken Soup', 'Manchow chicken soup', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Manchow Veg Soup';

-- Step 6: Split Rice/Noodles items (continuing in next part due to length)

-- Indo Fried Chicken Rice / Noodles
UPDATE public.menu_items
SET 
    name = 'Indo Fried Chicken Rice',
    description = 'Indian style fried chicken rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Indo Fried Chicken Rice / Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Indo Fried Chicken Noodles', 'Indian style fried chicken noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Indo Fried Chicken Rice';

-- Continue with remaining items...
-- (This is a very long query, so I'll create a separate file for the remaining items)

-- Verification: Check final result
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_available,
    (SELECT name FROM public.cafes WHERE id = menu_items.cafe_id) as cafe_name
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND (name LIKE '%/%' OR name LIKE '% / %')
ORDER BY category, name;
