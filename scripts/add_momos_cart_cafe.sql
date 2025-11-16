-- Upsert BG The Food Cart (Momos Cart) as an off-campus cafe
INSERT INTO public.cafes (
  name,
  slug,
  type,
  description,
  location,
  phone,
  hours,
  image_url,
  rating,
  total_reviews,
  accepting_orders,
  priority
)
VALUES (
  'BG The Food Cart',
  'bg-the-food-cart',
  'Street Food | Momos',
  'Steamed & fried momos, rolls, chowmein, and omelettes delivered around MUJ.',
  'Manipal University, Dahemi-Kalan',
  '+91 7878205400',
  '04:00 PM - 11:00 PM',
  NULL,
  4.5,
  180,
  true,
  28
)
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  image_url = EXCLUDED.image_url,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews,
  accepting_orders = EXCLUDED.accepting_orders,
  priority = EXCLUDED.priority;

UPDATE public.cafes
SET is_active = true
WHERE slug = 'bg-the-food-cart';

-- Menu items for BG The Food Cart
WITH target_cafe AS (
  SELECT id FROM public.cafes WHERE slug = 'bg-the-food-cart'
)
INSERT INTO public.menu_items (
  cafe_id,
  name,
  description,
  price,
  category,
  is_available
)
SELECT
  target_cafe.id,
  item.name,
  item.description,
  item.price,
  item.category,
  true
FROM target_cafe
CROSS JOIN LATERAL (
  VALUES
    -- MoMoJ (6pc / 8pc)
    ('Veg Steam Momoj (6pc)', 'Steamed veg momos - 6 pieces', 60, 'MOMO'),
    ('Paneer Steam Momoj (6pc)', 'Steamed paneer momos - 6 pieces', 80, 'MOMO'),
    ('Chicken Steam Momoj (6pc)', 'Steamed chicken momos - 6 pieces', 80, 'MOMO'),
    ('Veg Kurkure Momoj (8pc)', 'Crispy veg kurkure momos - 8 pieces', 120, 'MOMO'),
    ('Paneer Kurkure Momoj (8pc)', 'Crispy paneer kurkure momos - 8 pieces', 150, 'MOMO'),
    ('Chicken Kurkure Momoj (8pc)', 'Crispy chicken kurkure momos - 8 pieces', 150, 'MOMO'),

    -- Chowmein
    ('Veg Chowmein', 'Stir-fried veg chowmein', 70, 'CHOWMEIN'),
    ('Egg Chowmein', 'Egg chowmein', 80, 'CHOWMEIN'),
    ('Paneer Chowmein', 'Paneer chowmein', 90, 'CHOWMEIN'),
    ('Chicken Chowmein', 'Chicken chowmein', 100, 'CHOWMEIN'),

    -- Rolls
    ('Veg Roll', 'Veg roll', 50, 'ROLL'),
    ('Plain Paneer Roll', 'Plain paneer roll', 70, 'ROLL'),
    ('Egg Paneer Roll', 'Egg paneer roll', 80, 'ROLL'),
    ('Egg Roll', 'Egg roll', 60, 'ROLL'),
    ('Double Egg Paneer Roll', 'Double egg paneer roll', 90, 'ROLL'),
    ('Double Egg Roll', 'Double egg roll', 70, 'ROLL'),
    ('Chicken Roll', 'Chicken roll', 80, 'ROLL'),
    ('Egg Chicken Roll', 'Egg chicken roll', 90, 'ROLL'),

    -- Omelette
    ('Double Egg Omelette', 'Double egg omelette', 60, 'OMELETTE')
) AS item(name, description, price, category)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.menu_items mi
  WHERE mi.cafe_id = target_cafe.id
    AND mi.name = item.name
);


