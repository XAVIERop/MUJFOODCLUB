-- Clean Order Rating System Setup
-- This script handles existing policies and tables gracefully

-- 1. Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view ratings for their own orders" ON public.order_ratings;
DROP POLICY IF EXISTS "Users can insert ratings for their own completed orders" ON public.order_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.order_ratings;

-- 2. Create order_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add rating columns to orders table if they don't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS has_rating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating_submitted_at TIMESTAMP WITH TIME ZONE;

-- 4. Add phone_number column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- 5. Enable RLS on order_ratings
ALTER TABLE public.order_ratings ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (fresh)
CREATE POLICY "Users can view ratings for their own orders" ON public.order_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_ratings.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ratings for their own completed orders" ON public.order_ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_ratings.order_id 
            AND orders.user_id = auth.uid()
            AND orders.status = 'completed'
        )
    );

CREATE POLICY "Users can update their own ratings" ON public.order_ratings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_ratings.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- 7. Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON public.order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_rating ON public.order_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_orders_has_rating ON public.orders(has_rating);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON public.orders(phone_number);

-- 8. Grant necessary permissions
GRANT ALL ON public.order_ratings TO authenticated;

-- 9. Success message
DO $$
BEGIN
    RAISE NOTICE 'Order Rating System Setup Completed Successfully!';
    RAISE NOTICE 'Table: order_ratings created/updated';
    RAISE NOTICE 'Columns added to orders table: has_rating, rating_submitted_at, phone_number';
    RAISE NOTICE 'RLS policies created for order_ratings';
    RAISE NOTICE 'Indexes created for better performance';
END $$;
