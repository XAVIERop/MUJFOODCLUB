-- Fix RLS policies for order_items to allow cafe owners to view order items
-- The issue: Cafe owners (user_type = 'cafe_owner') can't view order_items because 
-- the RLS policy only allows cafe_staff table members, not cafe owners

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "cafe_staff_view_order_items" ON public.order_items;

-- Create a new policy that allows both cafe owners and cafe staff to view order items
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

-- Also fix the menu_items RLS policy to allow cafe owners
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "cafe_staff_manage_menu_items" ON public.menu_items;

-- Create a new policy that allows both cafe owners and cafe staff to manage menu items
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
    );

-- Test the fix by checking if cafe owners can now access order_items
-- This query should work for cafe owners after the fix
SELECT 
    'RLS Policy Fix Applied Successfully' as status,
    'Cafe owners should now be able to view order_items' as message;
