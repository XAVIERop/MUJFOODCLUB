-- Upsert Koko'ro as an off-campus cafe
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
  priority,
  location_scope
)
VALUES (
  'Koko''ro',
  'kokoro',
  'Multicuisine | Cafe',
  'Mocktails, Korean specials, pizzas, sandwiches, and more—delivered to MUJ gates & nearby PGs.',
  'Koko''Ro Lane, Near Kumawat Hostel, Manipal Road',
  '+91 99999 99999',
  '12:00 PM - 11:00 PM',
  NULL,
  4.6,
  214,
  true,
  26,
  'off_campus'
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
  priority = EXCLUDED.priority,
  location_scope = EXCLUDED.location_scope;

UPDATE public.cafes
SET is_active = true
WHERE slug = 'kokoro';

-- Insert or update menu items for Koko'ro
WITH target_cafe AS (
  SELECT id FROM public.cafes WHERE slug = 'kokoro'
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
JOIN (
  -- Mocktails
  VALUES
    ('Indigo Ice', 'Signature blue mocktail', 79, 'MOCKTAILS'),
    ('Mango Maze', 'Fresh mango mocktail', 79, 'MOCKTAILS'),
    ('Pink Pop Paradise', 'Fruity pink mocktail', 79, 'MOCKTAILS'),
    ('Guava Glaze', 'Guava-based refresher', 79, 'MOCKTAILS'),
    ('Greenova Mix', 'Minty lime cooler', 79, 'MOCKTAILS'),
    ('Orange Bite', 'Citrus mocktail', 79, 'MOCKTAILS'),
    ('Peachora', 'Peach flavoured mocktail', 79, 'MOCKTAILS'),
    ('Banaras Ghat', 'Herbal mocktail inspired by Banaras', 79, 'MOCKTAILS'),

  -- Maggie Specials
    ('Chilli Garlic Maggie', 'Spicy garlic maggie', 89, 'MAGGIE'),
    ('Tandoori Maggie', 'Smoky tandoori flavoured maggie', 89, 'MAGGIE'),
    ('Veg Maggie', 'Classic vegetable maggie', 89, 'MAGGIE'),
    ('Paneer Maggie', 'Paneer tossed maggie', 99, 'MAGGIE'),

  -- Fries
    ('Jalapeno Fries', 'Crispy fries tossed with jalapeno seasoning', 99, 'FRIES'),
    ('Peri Peri Fries', 'Peri peri spiced fries', 99, 'FRIES'),
    ('Mint Fries', 'Herbed mint fries', 99, 'FRIES'),

  -- Sandwiches (Single layer)
    ('Club Sandwich (Single)', 'Classic club sandwich - single layer', 79, 'SANDWICH'),
    ('The Italian Toastie (Single)', 'Italian style toastie - single layer', 89, 'SANDWICH'),
    ('Marinas Sandwich (Single)', 'Signature Marinas sandwich - single layer', 99, 'SANDWICH'),
    ('Tex Mex Toastie (Single)', 'Tex Mex flavour toastie - single layer', 99, 'SANDWICH'),
    ('The Paneer Crunch (Single)', 'Paneer loaded sandwich - single layer', 119, 'SANDWICH'),
    ('Italian Sandwich (Single)', 'Italian herbs sandwich - single layer', 119, 'SANDWICH'),

  -- Sandwiches (Double layer)
    ('Club Sandwich (Double)', 'Classic club sandwich - double layer', 99, 'SANDWICH'),
    ('The Italian Toastie (Double)', 'Italian style toastie - double layer', 109, 'SANDWICH'),
    ('Marinas Sandwich (Double)', 'Signature Marinas sandwich - double layer', 119, 'SANDWICH'),
    ('Tex Mex Toastie (Double)', 'Tex Mex flavour toastie - double layer', 119, 'SANDWICH'),
    ('The Paneer Crunch (Double)', 'Paneer loaded sandwich - double layer', 139, 'SANDWICH'),
    ('Italian Sandwich (Double)', 'Italian herbs sandwich - double layer', 139, 'SANDWICH'),

  -- Pizzas (Medium)
    ('Onion Pizza (Medium)', 'Medium onion pizza', 99, 'PIZZA'),
    ('Capsicum Pizza (Medium)', 'Medium capsicum pizza', 99, 'PIZZA'),
    ('Corn Pizza (Medium)', 'Medium corn pizza', 99, 'PIZZA'),
    ('Tomato Pizza (Medium)', 'Medium tomato pizza', 99, 'PIZZA'),
    ('Paneer Tikka Pizza (Medium)', 'Paneer tikka topping pizza', 159, 'PIZZA'),
    ('Mushroom Cheese Pizza (Medium)', 'Cheesy mushroom pizza', 159, 'PIZZA'),
    ('Capsicum Corn Pizza (Medium)', 'Capsicum and corn pizza', 159, 'PIZZA'),
    ('Tomato & Cheese Pizza (Medium)', 'Tomato and cheese pizza', 159, 'PIZZA'),
    ('Margherita Pizza (Medium)', 'Classic margherita pizza', 159, 'PIZZA'),
    ('KoKo''ro Special Pizza (Medium)', 'House special pizza', 159, 'PIZZA'),
    ('Nachos Pizza (Medium)', 'Nachos inspired pizza', 189, 'PIZZA'),
    ('Pasta Pizza (Medium)', 'Pasta topped pizza', 189, 'PIZZA'),

  -- Pasta
    ('Mexican Red Sauce Pasta', 'Pasta tossed in red sauce', 159, 'PASTA'),
    ('Cheesy White Sauce Pasta', 'Creamy white sauce pasta', 169, 'PASTA'),
    ('Cheesy Lasagna', 'Layered cheesy lasagna', 189, 'PASTA'),
    ('Spaghetti', 'Classic spaghetti', 172, 'PASTA'),

  -- Burgers
    ('Crispy Veg Burger', 'Crispy patty burger', 59, 'BURGER'),
    ('Veg Makhani Burger', 'Veg makhani style burger', 69, 'BURGER'),
    ('Smoky Paneer Burger', 'Smoked paneer burger', 89, 'BURGER'),
    ('Cheese Burst Burger', 'Cheesy burst burger', 89, 'BURGER'),

  -- Ramen
    ('Veg Hot & Spicy Ramen', 'Veg ramen in hot & spicy broth', 99, 'RAMEN'),
    ('Cheese Hot & Spicy Ramen', 'Cheesy ramen in hot & spicy broth', 99, 'RAMEN'),
    ('Korean Kimchi Ramen', 'Kimchi flavoured ramen', 99, 'RAMEN'),
    ('CoCo Kimon Ramen', 'Signature CoCo Kimon ramen', 119, 'RAMEN'),

  -- Kimbab
    ('Spicy Kimbab', 'Spicy Korean kimbab rolls', 199, 'KIMBAB'),
    ('Vegetable Kimbab', 'Vegetable Korean kimbab rolls', 199, 'KIMBAB'),
    ('Mushroom Kimbab', 'Mushroom Korean kimbab rolls', 219, 'KIMBAB'),

  -- Korean Corn Dogs
    ('Mustard Sauce Corn Dog', 'Corn dog with mustard sauce', 159, 'KOREAN CORN DOG'),
    ('Masala Corn Dog', 'Indian masala flavoured corn dog', 159, 'KOREAN CORN DOG'),
    ('Peri Peri Corn Dog', 'Peri peri spiced corn dog', 159, 'KOREAN CORN DOG'),

  -- Japanese Salads
    ('Cucumber Salad', 'Japanese cucumber salad', 69, 'JAPANESE SALAD'),
    ('Cabbage & Carrot Salad', 'Japanese cabbage & carrot salad', 69, 'JAPANESE SALAD'),

  -- Sushi
    ('Spicy Sushi', 'Spicy sushi roll', 199, 'SUSHI'),
    ('Vegetable Sushi', 'Vegetable sushi roll', 199, 'SUSHI'),
    ('Mushroom Sushi', 'Mushroom sushi roll', 219, 'SUSHI')
) AS item(name, description, price, category)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.menu_items mi
  WHERE mi.cafe_id = target_cafe.id
    AND mi.name = item.name
);

