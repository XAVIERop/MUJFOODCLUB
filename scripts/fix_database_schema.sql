-- Fix Database Schema Issues
-- This script fixes the missing columns and ensures proper table structure

-- 1. Fix user_bonuses table
ALTER TABLE public.user_bonuses 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Fix tier_maintenance table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tier_maintenance') THEN
        ALTER TABLE public.tier_maintenance 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. Fix maintenance_periods table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'maintenance_periods') THEN
        ALTER TABLE public.maintenance_periods 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Ensure orders table has all required columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS has_rating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating_submitted_at TIMESTAMP WITH TIME ZONE;

-- 5. Create order_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS on order_ratings
ALTER TABLE public.order_ratings ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for order_ratings
DROP POLICY IF EXISTS "Users can view ratings for their own orders" ON public.order_ratings;
CREATE POLICY "Users can view ratings for their own orders" ON public.order_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_ratings.order_id 
            AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert ratings for their own completed orders" ON public.order_ratings;
CREATE POLICY "Users can insert ratings for their own completed orders" ON public.order_ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_ratings.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'completed'
        )
    );

-- 8. Grant permissions
GRANT ALL ON public.order_ratings TO authenticated;

-- 9. Create indexes
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON public.order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_rating ON public.order_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_orders_has_rating ON public.orders(has_rating);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON public.orders(phone_number);

-- 10. Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema fixes completed successfully!';
    RAISE NOTICE 'Added missing columns to user_bonuses table';
    RAISE NOTICE 'Added missing columns to orders table';
    RAISE NOTICE 'Created order_ratings table with RLS policies';
    RAISE NOTICE 'All indexes created';
END $$;
