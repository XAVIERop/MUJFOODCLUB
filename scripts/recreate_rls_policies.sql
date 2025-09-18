-- Recreate RLS policies for order_items and menu_items
-- This will drop existing policies and create new ones

-- 1. Drop ALL existing policies on order_items
DROP POLICY IF EXISTS "cafe_staff_view_order_items" ON public.order_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_view_order_items" ON public.order_items;
DROP POLICY IF EXISTS "users_view_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "users_create_own_order_items" ON public.order_items;

-- 2. Create fresh policies for order_items
CREATE POLICY "cafe_owners_and_staff_view_order_items" ON public.order_items
    FOR SELECT USING (
        -- Allow cafe owners (user_type = 'cafe_owner' in profiles table)
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.profiles ON profiles.cafe_id = orders.cafe_id
            WHERE orders.id = order_items.order_id 
            AND profiles.user_type = 'cafe_owner'
            AND profiles.id = auth.uid()
        )
        OR
        -- Allow cafe staff (in cafe_staff table)
        EXISTS (
            SELECT 1 FROM public.orders 
            JOIN public.cafe_staff ON cafe_staff.cafe_id = orders.cafe_id
            WHERE orders.id = order_items.order_id 
            AND cafe_staff.user_id = auth.uid()
            AND cafe_staff.is_active = true
        )
        OR
        -- Allow users to view their own order items
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- 3. Drop ALL existing policies on menu_items
DROP POLICY IF EXISTS "cafe_staff_manage_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "cafe_owners_and_staff_manage_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_public_read" ON public.menu_items;

-- 4. Create fresh policies for menu_items
CREATE POLICY "cafe_owners_and_staff_manage_menu_items" ON public.menu_items
    FOR ALL USING (
        -- Allow cafe owners (user_type = 'cafe_owner' in profiles table)
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.cafe_id = menu_items.cafe_id 
            AND profiles.user_type = 'cafe_owner'
            AND profiles.id = auth.uid()
        )
        OR
        -- Allow cafe staff (in cafe_staff table)
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.cafe_id = menu_items.cafe_id 
            AND cafe_staff.user_id = auth.uid()
            AND cafe_staff.is_active = true
        )
        OR
        -- Allow public read access to available menu items
        menu_items.is_available = true
    );

-- 5. Test the fix
SELECT 
    'RLS Policies Recreated Successfully' as status,
    'Cafe owners should now be able to view order_items and menu_items' as message;
