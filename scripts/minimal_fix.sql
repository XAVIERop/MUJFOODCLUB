-- Minimal Fix for Order Status Updates
-- Run this script in your Supabase SQL Editor

-- Add missing columns one by one
DO $$
BEGIN
    -- Add status_updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status_updated_at') THEN
        ALTER TABLE public.orders ADD COLUMN status_updated_at TIMESTAMPTZ;
        RAISE NOTICE 'Added status_updated_at column';
    END IF;
    
    -- Add accepted_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'accepted_at') THEN
        ALTER TABLE public.orders ADD COLUMN accepted_at TIMESTAMPTZ;
        RAISE NOTICE 'Added accepted_at column';
    END IF;
    
    -- Add preparing_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparing_at') THEN
        ALTER TABLE public.orders ADD COLUMN preparing_at TIMESTAMPTZ;
        RAISE NOTICE 'Added preparing_at column';
    END IF;
    
    -- Add out_for_delivery_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'out_for_delivery_at') THEN
        ALTER TABLE public.orders ADD COLUMN out_for_delivery_at TIMESTAMPTZ;
        RAISE NOTICE 'Added out_for_delivery_at column';
    END IF;
    
    -- Add completed_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_at') THEN
        ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'Added completed_at column';
    END IF;
    
    -- Add points_credited if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'points_credited') THEN
        ALTER TABLE public.orders ADD COLUMN points_credited BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added points_credited column';
    END IF;
    
    RAISE NOTICE 'All required columns added successfully!';
END $$;

-- Enable RLS and create basic update policy
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow updates" ON public.orders;
CREATE POLICY "Allow updates" ON public.orders FOR UPDATE USING (true);

-- Grant update permission
GRANT UPDATE ON public.orders TO authenticated;

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Minimal fix completed. Try updating an order status now.';
END $$;
