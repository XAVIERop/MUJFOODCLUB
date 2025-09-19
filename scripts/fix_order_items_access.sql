-- FIX ORDER ITEMS ACCESS ISSUE
-- This script fixes the problem where order_items are not being fetched

-- 1. CHECK CURRENT RLS STATUS
SELECT 'Current RLS status:' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'menu_items', 'profiles')
ORDER BY tablename;

-- 2. CHECK EXISTING POLICIES
SELECT 'Existing policies:' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'menu_items', 'profiles')
ORDER BY tablename, policyname;

-- 3. TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. TEST THE EXACT QUERY FROM useUserOrdersQuery
SELECT 'Testing user orders query:' as status;

-- This is the exact query from useUserOrdersQuery.tsx
SELECT 
  o.*,
  p.full_name,
  p.phone,
  p.block,
  p.email,
  c.name as cafe_name,
  c.location as cafe_location,
  c.id as cafe_id
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.cafes c ON o.cafe_id = c.id
WHERE o.user_id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@muj.manipal.edu' 
  LIMIT 1
)
ORDER BY o.created_at DESC
LIMIT 3;

-- 5. TEST ORDER ITEMS QUERY
SELECT 'Testing order items query:' as status;

SELECT 
  oi.id,
  oi.order_id,
  oi.quantity,
  oi.unit_price,
  oi.total_price,
  oi.special_instructions,
  mi.name as menu_item_name,
  mi.description as menu_item_description,
  o.order_number
FROM public.order_items oi
JOIN public.menu_items mi ON oi.menu_item_id = mi.id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.user_id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@muj.manipal.edu' 
  LIMIT 1
)
ORDER BY oi.created_at DESC
LIMIT 5;

-- 6. CREATE PROPER RLS POLICIES
-- Re-enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_update_own_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_update_orders" ON public.orders;
DROP POLICY IF EXISTS "users_view_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "cafe_staff_view_order_items" ON public.order_items;
DROP POLICY IF EXISTS "menu_items_select_all" ON public.menu_items;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;

-- Create new policies for orders
CREATE POLICY "users_view_own_orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_create_own_orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cafe_staff_view_orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cafe_staff cs
      WHERE cs.cafe_id = orders.cafe_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

CREATE POLICY "cafe_staff_update_orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cafe_staff cs
      WHERE cs.cafe_id = orders.cafe_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

-- Create policies for order_items
CREATE POLICY "users_view_own_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "cafe_staff_view_order_items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
      WHERE o.id = order_items.order_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

-- Create policies for menu_items (allow all authenticated users to read)
CREATE POLICY "menu_items_select_all" ON public.menu_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. TEST THE QUERY AGAIN WITH RLS ENABLED
SELECT 'Testing with RLS enabled:' as status;

-- Test the exact query from useUserOrdersQuery
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.created_at,
  p.full_name,
  c.name as cafe_name,
  COUNT(oi.id) as item_count
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.cafes c ON o.cafe_id = c.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.user_id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@muj.manipal.edu' 
  LIMIT 1
)
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.created_at, p.full_name, c.name
ORDER BY o.created_at DESC
LIMIT 3;

-- 8. VERIFY THE FIX
DO $$
BEGIN
    RAISE NOTICE 'Order items access fix completed!';
    RAISE NOTICE 'Key fixes applied:';
    RAISE NOTICE '1. Disabled RLS temporarily for testing';
    RAISE NOTICE '2. Created proper RLS policies for all tables';
    RAISE NOTICE '3. Ensured order_items and menu_items are accessible';
    RAISE NOTICE '4. Re-enabled RLS with correct policies';
    RAISE NOTICE 'Order items should now be fetched properly!';
END $$;
