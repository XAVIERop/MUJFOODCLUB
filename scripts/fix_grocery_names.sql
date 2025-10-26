-- Fix grocery product names - Run this in Supabase SQL Editor
-- This script converts ALL CAPS names to proper Title Case and fixes spelling mistakes

-- First, let's see what we're working with
SELECT 
  id, 
  name, 
  category,
  CASE 
    WHEN name = UPPER(name) THEN 'ALL CAPS'
    ELSE 'Proper Case'
  END as name_status
FROM menu_items 
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
ORDER BY name
LIMIT 10;

-- Now let's update the names
-- We'll do this in batches to avoid timeouts

-- Batch 1: ACT2 products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'ACT2 BUTTER POPCORN' THEN 'ACT II Butter Popcorn'
  WHEN name = 'ACT2 CHEESE BURST POPCORN' THEN 'ACT II Cheese Burst Popcorn'
  WHEN name = 'ACT2 SALTED POPCORN' THEN 'ACT II Salted Popcorn'
  WHEN name = 'ACT2 SPICY PUDINA POPCORN' THEN 'ACT II Spicy Pudina Popcorn'
  WHEN name = 'ACT2 TOMATO CHILLI POPCORN' THEN 'ACT II Tomato Chilli Popcorn'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name IN ('ACT2 BUTTER POPCORN', 'ACT2 CHEESE BURST POPCORN', 'ACT2 SALTED POPCORN', 'ACT2 SPICY PUDINA POPCORN', 'ACT2 TOMATO CHILLI POPCORN');

-- Batch 2: BALAJI products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'BALAJI CRUNCHEM CHAAT CHASKA' THEN 'Balaji Crunchem Chaat Chaska'
  WHEN name = 'BALAJI CRUNCHEM CREAM ONION' THEN 'Balaji Crunchem Cream Onion'
  WHEN name = 'BALAJI CRUNCHEM MASALA MASTI' THEN 'Balaji Crunchem Masala Masti'
  WHEN name = 'BALAJI CRUNCHEM SIMPLY SALTED' THEN 'Balaji Crunchem Simply Salted'
  WHEN name = 'BALAJI CRUNCHEX CHILLI TADKA' THEN 'Balaji Crunchex Chilli Tadka'
  WHEN name = 'BALAJI CRUNCHEX SIMPLY SALTED' THEN 'Balaji Crunchex Simply Salted'
  WHEN name = 'BALAJI CRUNCHEX TOMATO TWIST' THEN 'Balaji Crunchex Tomato Twist'
  WHEN name = 'BALAJI RUMBLES' THEN 'Balaji Rumbles'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'BALAJI%';

-- Batch 3: BINGO products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'BINGO MAD ANGLES ACHARI MASTI' THEN 'Bingo Mad Angles Achari Masti'
  WHEN name = 'BINGO MAD ANGLES CHAT MASTI' THEN 'Bingo Mad Angles Chat Masti'
  WHEN name = 'BINGO MAD ANGLES MM MASALA' THEN 'Bingo Mad Angles MM Masala'
  WHEN name = 'BINGO MAD ANGLES PIZZA AAAAH' THEN 'Bingo Mad Angles Pizza Aaaah'
  WHEN name = 'BINGO MAD ANGLES RED ALERT' THEN 'Bingo Mad Angles Red Alert'
  WHEN name = 'BINGO MAD ANGLES TOMATO MADNESS' THEN 'Bingo Mad Angles Tomato Madness'
  WHEN name = 'BINGO MAD ANGLES VERY PERI PERI' THEN 'Bingo Mad Angles Very Peri Peri'
  WHEN name = 'BINGO NACHOS CHEES NACHOS' THEN 'Bingo Nachos Cheese Nachos'
  WHEN name = 'BINGO NACHOS CHILLI LEMON' THEN 'Bingo Nachos Chilli Lemon'
  WHEN name = 'BINGO TADHE-MADHE' THEN 'Bingo Tadhe-Madhe'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'BINGO%';

-- Batch 4: CORNITOS products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'CORNITOS PERI PERI' THEN 'Cornitos Peri Peri'
  WHEN name = 'CORNITOS SALSA' THEN 'Cornitos Salsa'
  WHEN name = 'CORNITOS SEA SALT' THEN 'Cornitos Sea Salt'
  WHEN name = 'CORNITOS THAI' THEN 'Cornitos Thai'
  WHEN name = 'CORNITOS TIKKA MASALA' THEN 'Cornitos Tikka Masala'
  WHEN name = 'CORNITOS TOMATO' THEN 'Cornitos Tomato'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'CORNITOS%';

-- Batch 5: CRAX products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'CRAX CARLS CHATPATA MASALA' THEN 'Crax Carls Chatpata Masala'
  WHEN name = 'CRAX CHEES BALLS' THEN 'Crax Cheese Balls'
  WHEN name = 'CRAX NATKHAT CLASSIC' THEN 'Crax Natkhat Classic'
  WHEN name = 'CRAX NATKHAT MASALA' THEN 'Crax Natkhat Masala'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'CRAX%';

-- Batch 6: POPZ products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'POPZ POPZ CHOCOLATY CRUNCH' THEN 'Popz Chocolaty Crunch'
  WHEN name = 'POPZ POPZ COOKIS & CREME' THEN 'Popz Cookies & Cream'
  WHEN name = 'POPZ POPZ HAZELNUT' THEN 'Popz Hazelnut'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'POPZ%';

-- Batch 7: Drink brands
UPDATE menu_items 
SET name = CASE 
  WHEN name = '7UP' THEN '7UP'
  WHEN name = 'BLACK PEPSI' THEN 'Black Pepsi'
  WHEN name = 'CHOCO-CHOCO' THEN 'Choco-Choco'
  WHEN name = 'COKE' THEN 'Coca-Cola'
  WHEN name = 'COKE (LARGE)' THEN 'Coca-Cola (Large)'
  WHEN name = 'CREAM BELL KESAR BADAM VANILA' THEN 'Cream Bell Kesar Badam Vanilla'
  WHEN name = 'DEW' THEN 'Mountain Dew'
  WHEN name = 'DIET COKE' THEN 'Diet Coke'
  WHEN name = 'FANTA' THEN 'Fanta'
  WHEN name = 'FANTA (300ML)' THEN 'Fanta (300ml)'
  WHEN name = 'LAYS POPCORN' THEN 'Lay\'s Popcorn'
  WHEN name = 'LIMCA' THEN 'Limca'
  WHEN name = 'MAZZA' THEN 'Mazza'
  WHEN name = 'MIRINDA' THEN 'Mirinda'
  WHEN name = 'MONSTER GREEN' THEN 'Monster Green'
  WHEN name = 'MONSTER WHITE ULTRA' THEN 'Monster White Ultra'
  WHEN name = 'NUMBOOZ' THEN 'Nimbu'
  WHEN name = 'ORANGE PULPY' THEN 'Orange Pulpy'
  WHEN name = 'PEPSI' THEN 'Pepsi'
  WHEN name = 'PREDATOR' THEN 'Predator'
  WHEN name = 'SPRITE' THEN 'Sprite'
  WHEN name = 'SPRITE (300ML)' THEN 'Sprite (300ml)'
  WHEN name = 'SPRITE (LARGE)' THEN 'Sprite (Large)'
  WHEN name = 'THUMS UP (300ML)' THEN 'Thums Up (300ml)'
  WHEN name = 'THUMS UP (LARGE)' THEN 'Thums Up (Large)'
  WHEN name = 'TROPICANA GAVAWA' THEN 'Tropicana Guava'
  WHEN name = 'TROPICANA MIXFURIT' THEN 'Tropicana Mixed Fruit'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name IN ('7UP', 'BLACK PEPSI', 'CHOCO-CHOCO', 'COKE', 'COKE (LARGE)', 'CREAM BELL KESAR BADAM VANILA', 
               'DEW', 'DIET COKE', 'FANTA', 'FANTA (300ML)', 'LAYS POPCORN', 'LIMCA', 'MAZZA', 'MIRINDA', 
               'MONSTER GREEN', 'MONSTER WHITE ULTRA', 'NUMBOOZ', 'ORANGE PULPY', 'PEPSI', 'PREDATOR', 
               'SPRITE', 'SPRITE (300ML)', 'SPRITE (LARGE)', 'THUMS UP (300ML)', 'THUMS UP (LARGE)', 
               'TROPICANA GAVAWA', 'TROPICANA MIXFURIT');

-- Batch 8: PAPERBOAT products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'PAPERBOAT PAPERBOAT SWING COCONUT WATER DRINK' THEN 'Paper Boat Coconut Water Drink'
  WHEN name = 'PAPERBOAT PAPERBOAT SWING LUSH LYCHES' THEN 'Paper Boat Lush Lychees'
  WHEN name = 'PAPERBOAT PAPERBOAT SWING MIXED FRUIT MEDLEY' THEN 'Paper Boat Mixed Fruit Medley'
  WHEN name = 'PAPERBOAT PAPERBOAT SWING SLEEPY MANGO' THEN 'Paper Boat Sleepy Mango'
  WHEN name = 'PAPERBOAT PAPERBOAT SWING YUMMY GUAVA JUICIER DRINK' THEN 'Paper Boat Yummy Guava Juicier Drink'
  WHEN name = 'PAPERBOAT PAPERBOAT SWING ZESTY POMEGRANATE 45' THEN 'Paper Boat Zesty Pomegranate 45'
  WHEN name = 'PAPERBOAT PAPERBOAT ZERO SPARKLING WATER GREEN APPLE' THEN 'Paper Boat Zero Sparkling Water Green Apple'
  WHEN name = 'PAPERBOAT PAPERBOAT ZERO SPARKLING WATER LEMON LIME' THEN 'Paper Boat Zero Sparkling Water Lemon Lime'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'PAPERBOAT%';

-- Batch 9: WINKIES products
UPDATE menu_items 
SET name = CASE 
  WHEN name = 'WINKIES WINKIES CAFE SELECT BANANA HAZELNUT SLICED CAKE' THEN 'Winkies Banana Hazelnut Sliced Cake'
  WHEN name = 'WINKIES WINKIES CAFE SELECT DOUBLE CHOCO SLICED CAKE' THEN 'Winkies Double Choco Sliced Cake'
  WHEN name = 'WINKIES WINKIES CHOCO CAKE SLICED' THEN 'Winkies Choco Cake Sliced'
  WHEN name = 'WINKIES WINKIES CHOCOLUV SWISS ROLL' THEN 'Winkies Chocoluv Swiss Roll'
  WHEN name = 'WINKIES WINKIES CLASSIC VANILLA SLICE CAKE' THEN 'Winkies Classic Vanilla Slice Cake'
  WHEN name = 'WINKIES WINKIES FRUIT CAKE SLICED 20' THEN 'Winkies Fruit Cake Sliced 20'
  WHEN name = 'WINKIES WINKIES FRUIT CAKE SLICED 30' THEN 'Winkies Fruit Cake Sliced 30'
  WHEN name = 'WINKIES WINKIES FRUIT CAKE SLICED 40' THEN 'Winkies Fruit Cake Sliced 40'
  WHEN name = 'WINKIES WINKIES FRUIT CAKE WITH RAISIN & TUTTI FRUTTI' THEN 'Winkies Fruit Cake With Raisin & Tutti Frutti'
  WHEN name = 'WINKIES WINKIES MARBLE CAKE SLICED' THEN 'Winkies Marble Cake Sliced'
  WHEN name = 'WINKIES WINKIES PINEAPPLE CAKE SLICED' THEN 'Winkies Pineapple Cake Sliced'
  WHEN name = 'WINKIES WINKIES SWISS ROLL CHOCOLATE FLAVOUR' THEN 'Winkies Swiss Roll Chocolate Flavour'
  WHEN name = 'WINKIES WINKIES SWISS ROLL STRAWBERRY JAM' THEN 'Winkies Swiss Roll Strawberry Jam'
  ELSE name
END
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
  AND name LIKE 'WINKIES%';

-- Verify the changes
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN name = UPPER(name) THEN 1 END) as all_caps_remaining,
  COUNT(CASE WHEN name != UPPER(name) THEN 1 END) as proper_case_updated
FROM menu_items 
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%');

-- Show some examples of updated names
SELECT name, category 
FROM menu_items 
WHERE cafe_id = (SELECT id FROM cafes WHERE name ILIKE '%24 seven mart%')
ORDER BY name
LIMIT 20;
