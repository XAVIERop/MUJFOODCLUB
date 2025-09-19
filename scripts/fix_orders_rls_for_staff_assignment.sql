-- Fix RLS policies for orders table to allow cafe owners to update delivered_by_staff_id
-- The issue: Cafe owners can't update the delivered_by_staff_id field due to restrictive RLS policies

-- Check current RLS policies on orders table
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_update_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_full_access" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_full_access" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_update_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_view_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_update_orders" ON public.orders;
DROP POLICY IF EXISTS "cafe_owners_full_orders_access" ON public.orders;
DROP POLICY IF EXISTS "cafe_staff_full_orders_access" ON public.orders;

-- Create comprehensive policies for orders table

-- Policy for cafe owners to view their cafe's orders
CREATE POLICY "cafe_owners_view_orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = orders.cafe_id
        )
    );

-- Policy for cafe owners to update their cafe's orders
CREATE POLICY "cafe_owners_update_orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = orders.cafe_id
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.user_type = 'cafe_owner'
            AND profiles.cafe_id = orders.cafe_id
        )
    );

-- Policy for cafe staff to view their cafe's orders
CREATE POLICY "cafe_staff_view_orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff
            WHERE cafe_staff.user_id = auth.uid()
            AND cafe_staff.cafe_id = orders.cafe_id
            AND cafe_staff.is_active = true
        )
    );

-- Policy for cafe staff to update their cafe's orders
CREATE POLICY "cafe_staff_update_orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff
            WHERE cafe_staff.user_id = auth.uid()
            AND cafe_staff.cafe_id = orders.cafe_id
            AND cafe_staff.is_active = true
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cafe_staff
            WHERE cafe_staff.user_id = auth.uid()
            AND cafe_staff.cafe_id = orders.cafe_id
            AND cafe_staff.is_active = true
        )
    );

-- Policy for users to view their own orders
CREATE POLICY "users_view_own_orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());

-- Policy for users to update their own orders
CREATE POLICY "users_update_own_orders" ON public.orders
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

SELECT 
    'RLS policies updated successfully for orders table' as status,
    'Cafe owners should now be able to update delivered_by_staff_id field' as message;
