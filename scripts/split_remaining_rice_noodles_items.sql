-- Split remaining Rice/Noodles combined items for Taste of India
-- Continuation of the main split query

-- Indo Fried Veg Rice / Noodles
UPDATE public.menu_items
SET 
    name = 'Indo Fried Veg Rice',
    description = 'Indian style fried vegetable rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Indo Fried Veg Rice / Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Indo Fried Veg Noodles', 'Indian style fried vegetable noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Indo Fried Veg Rice';

-- Szechwan / Chili Garlic Chicken Noodles
UPDATE public.menu_items
SET 
    name = 'Szechwan Chicken Noodles',
    description = 'Szechwan style chicken noodles',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan / Chili Garlic Chicken Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chili Garlic Chicken Noodles', 'Chili garlic chicken noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan Chicken Noodles';

-- Szechwan / Chili Garlic Chicken Fried Rice
UPDATE public.menu_items
SET 
    name = 'Szechwan Chicken Fried Rice',
    description = 'Szechwan style chicken fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan / Chili Garlic Chicken Fried Rice';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chili Garlic Chicken Fried Rice', 'Chili garlic chicken fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan Chicken Fried Rice';

-- Paneer Tikka/Chicken Tikka Fried Rice
UPDATE public.menu_items
SET 
    name = 'Paneer Tikka Fried Rice',
    description = 'Paneer tikka fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Tikka/Chicken Tikka Fried Rice';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chicken Tikka Fried Rice', 'Chicken tikka fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Paneer Tikka Fried Rice';

-- Thai Noodles Veg / Chicken
UPDATE public.menu_items
SET 
    name = 'Thai Noodles Veg',
    description = 'Thai style vegetable noodles',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Thai Noodles Veg / Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Thai Noodles Chicken', 'Thai style chicken noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Thai Noodles Veg';

-- Thai Fried Rice Veg / Chicken
UPDATE public.menu_items
SET 
    name = 'Thai Fried Rice Veg',
    description = 'Thai style vegetable fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Thai Fried Rice Veg / Chicken';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Thai Fried Rice Chicken', 'Thai style chicken fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Thai Fried Rice Veg';

-- Hunan Veg / Chicken Noodles
UPDATE public.menu_items
SET 
    name = 'Hunan Veg Noodles',
    description = 'Hunan style vegetable noodles',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hunan Veg / Chicken Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Hunan Chicken Noodles', 'Hunan style chicken noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hunan Veg Noodles';

-- Hunan Veg / Chicken Fried Rice
UPDATE public.menu_items
SET 
    name = 'Hunan Veg Fried Rice',
    description = 'Hunan style vegetable fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hunan Veg / Chicken Fried Rice';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Hunan Chicken Fried Rice', 'Hunan style chicken fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Hunan Veg Fried Rice';

-- Burnt Garlic Veg / Chicken Fried Rice
UPDATE public.menu_items
SET 
    name = 'Burnt Garlic Veg Fried Rice',
    description = 'Burnt garlic vegetable fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Burnt Garlic Veg / Chicken Fried Rice';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Burnt Garlic Chicken Fried Rice', 'Burnt garlic chicken fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Burnt Garlic Veg Fried Rice';

-- Szechwan / Chili Garlic Veg Fried Rice
UPDATE public.menu_items
SET 
    name = 'Szechwan Veg Fried Rice',
    description = 'Szechwan style vegetable fried rice',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan / Chili Garlic Veg Fried Rice';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chili Garlic Veg Fried Rice', 'Chili garlic vegetable fried rice', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan Veg Fried Rice';

-- Burnt Garlic Veg / Chicken Noodles
UPDATE public.menu_items
SET 
    name = 'Burnt Garlic Veg Noodles',
    description = 'Burnt garlic vegetable noodles',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Burnt Garlic Veg / Chicken Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Burnt Garlic Chicken Noodles', 'Burnt garlic chicken noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Burnt Garlic Veg Noodles';

-- Szechwan / Chili Garlic Veg Noodles
UPDATE public.menu_items
SET 
    name = 'Szechwan Veg Noodles',
    description = 'Szechwan style vegetable noodles',
    updated_at = NOW()
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan / Chili Garlic Veg Noodles';

INSERT INTO public.menu_items (
    name, description, price, category, cafe_id, preparation_time, is_available, created_at, updated_at
)
SELECT 'Chili Garlic Veg Noodles', 'Chili garlic vegetable noodles', price, category, cafe_id, preparation_time, is_available, NOW(), NOW()
FROM public.menu_items
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name ILIKE '%taste of india%')
  AND name = 'Szechwan Veg Noodles';

-- Final verification: Check that no combined items remain
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
