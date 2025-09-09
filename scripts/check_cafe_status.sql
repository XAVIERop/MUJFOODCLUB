-- Check Current Cafe Status and Owner Accounts
-- This script shows the current status of all cafes and their owner accounts

-- Show all cafes with their details
SELECT 
  name,
  type,
  location,
  phone,
  hours,
  accepting_orders,
  priority,
  is_exclusive,
  average_rating,
  total_ratings,
  created_at
FROM public.cafes 
ORDER BY priority ASC;

-- Show all cafe owner accounts
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  c.name as cafe_name,
  c.accepting_orders,
  c.priority,
  c.is_exclusive,
  p.created_at as account_created
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.user_type = 'cafe_owner'
ORDER BY c.priority ASC;

-- Show cafes without owner accounts
SELECT 
  c.name,
  c.type,
  c.priority,
  c.is_exclusive,
  c.accepting_orders
FROM public.cafes c
LEFT JOIN public.profiles p ON c.id = p.cafe_id AND p.user_type = 'cafe_owner'
WHERE p.id IS NULL
ORDER BY c.priority ASC;

-- Show menu item counts for each cafe
SELECT 
  c.name,
  COUNT(mi.id) as menu_item_count,
  COUNT(CASE WHEN mi.is_available = true THEN 1 END) as available_items
FROM public.cafes c
LEFT JOIN public.menu_items mi ON c.id = mi.cafe_id
GROUP BY c.id, c.name
ORDER BY c.priority ASC;

-- Show exclusive cafes status
SELECT 
  name,
  priority,
  accepting_orders,
  is_exclusive,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles p WHERE p.cafe_id = c.id AND p.user_type = 'cafe_owner') 
    THEN '✅ Has Owner' 
    ELSE '❌ No Owner' 
  END as owner_status
FROM public.cafes c
WHERE is_exclusive = true
ORDER BY priority ASC;
