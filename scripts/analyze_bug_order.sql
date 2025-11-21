-- Analyze Bug Order: ebb1eb92-b426-4e3a-afa3-ad313ada6cd1
-- This order was supposed to be Grabit but went to Munchbox

-- ============================================
-- STEP 1: Check the order details
-- ============================================
SELECT 
  '🔍 ORDER DETAILS:' as section,
  o.order_number,
  o.cafe_id as order_cafe_id,
  c.name as assigned_cafe_name,
  o.user_id,
  o.total_amount,
  o.order_type,
  o.delivery_block,
  o.created_at,
  o.status
FROM public.orders o
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1';

-- ============================================
-- STEP 2: Check what items are in this order
-- ============================================
SELECT 
  '📦 ORDER ITEMS:' as section,
  oi.id as order_item_id,
  mi.name as item_name,
  mi.cafe_id as item_cafe_id,
  c.name as item_cafe_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  CASE 
    WHEN mi.cafe_id = 'cfa083d5-c030-45e8-9ead-980aaa0aa7d2' THEN '✅ Grabit Item'
    WHEN mi.cafe_id = 'fecc62c0-2995-4376-8303-59c544d2c3e0' THEN '❌ Munchbox Item'
    ELSE '❓ Other Cafe'
  END as item_source
FROM public.order_items oi
JOIN public.menu_items mi ON oi.menu_item_id = mi.id
LEFT JOIN public.cafes c ON mi.cafe_id = c.id
WHERE oi.order_id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1'
ORDER BY oi.id;

-- ============================================
-- STEP 3: Check cafe IDs
-- ============================================
SELECT 
  '🏪 CAFE IDS:' as section,
  name as cafe_name,
  id as cafe_id
FROM public.cafes
WHERE name IN ('Grabit', 'Munch Box')
ORDER BY name;

-- ============================================
-- STEP 4: Check order number prefix
-- ============================================
SELECT 
  '🔢 ORDER NUMBER ANALYSIS:' as section,
  order_number,
  CASE 
    WHEN order_number LIKE 'GRA%' THEN '✅ Grabit prefix (correct)'
    WHEN order_number LIKE 'MUN%' THEN '❌ Munchbox prefix (wrong - should be Grabit)'
    ELSE '❓ Other prefix: ' || SUBSTRING(order_number, 1, 3)
  END as prefix_analysis
FROM public.orders
WHERE id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1';

-- ============================================
-- STEP 5: Check user info
-- ============================================
SELECT 
  '👤 USER INFO:' as section,
  p.full_name,
  p.email,
  p.phone,
  p.block,
  p.user_type
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
WHERE o.id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1';

-- ============================================
-- FINAL ANALYSIS
-- ============================================
DO $$
DECLARE
  order_cafe_id UUID;
  item_cafe_id UUID;
  order_cafe_name TEXT;
  item_cafe_name TEXT;
  order_prefix TEXT;
BEGIN
  -- Get order's cafe_id
  SELECT o.cafe_id, c.name, SUBSTRING(o.order_number, 1, 3)
  INTO order_cafe_id, order_cafe_name, order_prefix
  FROM public.orders o
  LEFT JOIN public.cafes c ON o.cafe_id = c.id
  WHERE o.id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1';
  
  -- Get first item's cafe_id
  SELECT mi.cafe_id, c.name
  INTO item_cafe_id, item_cafe_name
  FROM public.order_items oi
  JOIN public.menu_items mi ON oi.menu_item_id = mi.id
  LEFT JOIN public.cafes c ON mi.cafe_id = c.id
  WHERE oi.order_id = 'ebb1eb92-b426-4e3a-afa3-ad313ada6cd1'
  LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '📊 BUG ANALYSIS SUMMARY';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Order assigned to cafe: % (ID: %)', order_cafe_name, order_cafe_id;
  RAISE NOTICE 'Items actually from cafe: % (ID: %)', item_cafe_name, item_cafe_id;
  RAISE NOTICE 'Order number prefix: %', order_prefix;
  RAISE NOTICE '';
  
  IF order_cafe_id = item_cafe_id THEN
    RAISE NOTICE '✅ Order cafe_id matches item cafe_id - NO BUG';
  ELSE
    RAISE NOTICE '❌ BUG CONFIRMED: Order cafe_id does NOT match item cafe_id!';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 What happened:';
    RAISE NOTICE '  1. User added items from: %', item_cafe_name;
    RAISE NOTICE '  2. But order was created with cafe_id: %', order_cafe_name;
    RAISE NOTICE '  3. Order number got prefix: %', order_prefix;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Root Cause Indicators:';
    IF order_prefix LIKE 'MUN%' THEN
      RAISE NOTICE '  - Order number has MUNCHBOX prefix';
      RAISE NOTICE '  - This means cafe_id was MUNCHBOX during order creation';
      RAISE NOTICE '  - Likely cause: Stale cafe context or cart contamination';
    END IF;
  END IF;
  RAISE NOTICE '';
END $$;

