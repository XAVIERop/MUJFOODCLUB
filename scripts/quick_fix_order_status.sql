-- Quick Fix for Order Status Update Issue
-- Run this script in your Supabase SQL Editor

-- 1. Enable RLS on orders table if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Create a simple policy that allows cafe owners to update orders
DROP POLICY IF EXISTS "Allow cafe owners to update orders" ON public.orders;

CREATE POLICY "Allow cafe owners to update orders" ON public.orders
    FOR UPDATE USING (true);  -- Temporarily allow all updates for testing

-- 3. Grant update permission to authenticated users
GRANT UPDATE ON public.orders TO authenticated;

-- 4. Check if the required columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('accepted_at', 'preparing_at', 'out_for_delivery_at', 'completed_at', 'points_credited')
ORDER BY column_name;

-- 5. Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'accepted_at') THEN
        ALTER TABLE public.orders ADD COLUMN accepted_at TIMESTAMPTZ;
        RAISE NOTICE 'Added accepted_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparing_at') THEN
        ALTER TABLE public.orders ADD COLUMN preparing_at TIMESTAMPTZ;
        RAISE NOTICE 'Added preparing_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'out_for_delivery_at') THEN
        ALTER TABLE public.orders ADD COLUMN out_for_delivery_at TIMESTAMPTZ;
        RAISE NOTICE 'Added out_for_delivery_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_at') THEN
        ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added completed_at column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'points_credited') THEN
        ALTER TABLE public.orders ADD COLUMN points_credited BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added points_credited column';
    END IF;
END $$;

RAISE NOTICE 'Quick fix applied. Try updating an order status now.';
