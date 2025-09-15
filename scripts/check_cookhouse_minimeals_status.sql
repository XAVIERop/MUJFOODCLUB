-- =====================================================
-- Check Cook House and Mini Meals Status
-- =====================================================

-- 1. Check Cook House status
SELECT 
  '=== COOK HOUSE STATUS ===' as section,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%cook%house%' OR name = 'COOK HOUSE';

-- 2. Check Mini Meals status
SELECT 
  '=== MINI MEALS STATUS ===' as section,
  id,
  name,
  whatsapp_phone,
  whatsapp_enabled,
  whatsapp_notifications,
  is_active,
  created_at,
  updated_at
FROM public.cafes 
WHERE name ILIKE '%mini%meals%' OR name = 'Mini Meals';

-- 3. Check recent orders for both cafes
SELECT 
  '=== RECENT ORDERS - COOK HOUSE ===' as section,
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.full_name as customer_name
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%cook%house%' OR c.name = 'COOK HOUSE'
ORDER BY o.created_at DESC
LIMIT 5;

SELECT 
  '=== RECENT ORDERS - MINI MEALS ===' as section,
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.full_name as customer_name
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
JOIN public.cafes c ON o.cafe_id = c.id
WHERE c.name ILIKE '%mini%meals%' OR c.name = 'Mini Meals'
ORDER BY o.created_at DESC
LIMIT 5;

-- 4. Check cafe staff for both cafes
SELECT 
  '=== CAFE STAFF - COOK HOUSE ===' as section,
  cs.role,
  p.full_name,
  p.email,
  cs.is_active
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.name ILIKE '%cook%house%' OR c.name = 'COOK HOUSE';

SELECT 
  '=== CAFE STAFF - MINI MEALS ===' as section,
  cs.role,
  p.full_name,
  p.email,
  cs.is_active
FROM public.cafe_staff cs
JOIN public.profiles p ON cs.user_id = p.id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE c.name ILIKE '%mini%meals%' OR c.name = 'Mini Meals';

-- 5. Check if there are any WhatsApp test records
SELECT 
  '=== WHATSAPP TEST RECORDS ===' as section,
  'Check browser console for WhatsApp service logs' as note;
