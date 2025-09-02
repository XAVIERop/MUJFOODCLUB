-- Fix Order Status Update Permissions and Schema
-- Run this script in your Supabase SQL Editor

-- 1. Check if the required columns exist in orders table
DO $$
BEGIN
    -- Add missing timestamp columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'accepted_at') THEN
        ALTER TABLE public.orders ADD COLUMN accepted_at TIMESTAMPTZ;
        RAISE NOTICE 'Added accepted_at column to orders table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparing_at') THEN
        ALTER TABLE public.orders ADD COLUMN preparing_at TIMESTAMPTZ;
        RAISE NOTICE 'Added preparing_at column to orders table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'out_for_delivery_at') THEN
        ALTER TABLE public.orders ADD COLUMN out_for_delivery_at TIMESTAMPTZ;
        RAISE NOTICE 'Added out_for_delivery_at column to orders table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_at') THEN
        ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added completed_at column to orders table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'points_credited') THEN
        ALTER TABLE public.orders ADD COLUMN points_credited BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added points_credited column to orders table';
    END IF;
END $$;

-- 2. Create or update RLS policy for cafe owners to update orders
DROP POLICY IF EXISTS "Cafe owners can update their orders" ON public.orders;

CREATE POLICY "Cafe owners can update their orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'cafe_owner' 
            AND profiles.cafe_id = orders.cafe_id
        )
    );

-- 3. Grant necessary permissions
GRANT UPDATE ON public.orders TO authenticated;

-- 4. Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname = 'Cafe owners can update their orders';

-- 5. Test if a cafe owner can update orders (this will show the current user's permissions)
SELECT 
    current_user,
    session_user,
    current_setting('role'),
    has_table_privilege('public.orders', 'UPDATE') as can_update_orders;

RAISE NOTICE 'Order status update permissions have been configured. Cafe owners should now be able to update order statuses.';
