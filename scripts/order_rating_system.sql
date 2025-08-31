-- Order Rating System Migration
-- This migration adds the ability for students to rate their completed orders

-- 1. Create order_ratings table
CREATE TABLE IF NOT EXISTS public.order_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add rating columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS has_rating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating_submitted_at TIMESTAMP WITH TIME ZONE;

-- 3. Add phone_number column to orders table if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_ratings_order_id ON public.order_ratings(order_id);
CREATE INDEX IF NOT EXISTS idx_order_ratings_rating ON public.order_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_orders_has_rating ON public.orders(has_rating);
CREATE INDEX IF NOT EXISTS idx_orders_phone_number ON public.orders(phone_number);

-- 5. Enable RLS and create policies
ALTER TABLE public.order_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_ratings
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

-- 6. Grant necessary permissions
GRANT ALL ON public.order_ratings TO authenticated;

-- 7. Create function to get order rating summary
CREATE OR REPLACE FUNCTION get_order_rating_summary(order_id UUID)
RETURNS TABLE(
    average_rating DECIMAL(3,2),
    total_ratings INTEGER,
    rating_distribution JSON
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(r.rating)::DECIMAL, 2) as average_rating,
        COUNT(r.rating) as total_ratings,
        json_build_object(
            '1_star', COUNT(*) FILTER (WHERE r.rating = 1),
            '2_star', COUNT(*) FILTER (WHERE r.rating = 2),
            '3_star', COUNT(*) FILTER (WHERE r.rating = 3),
            '4_star', COUNT(*) FILTER (WHERE r.rating = 4),
            '5_star', COUNT(*) FILTER (WHERE r.rating = 5)
        ) as rating_distribution
    FROM public.order_ratings r
    WHERE r.order_id = get_order_rating_summary.order_id;
END;
$$;

-- 8. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_order_rating_summary(UUID) TO authenticated;

-- 9. Create function to automatically create cafe rating from order rating
CREATE OR REPLACE FUNCTION create_cafe_rating_from_order()
RETURNS TRIGGER AS $$
DECLARE
    cafe_id_val UUID;
BEGIN
    -- Get the cafe_id from the order
    SELECT cafe_id INTO cafe_id_val 
    FROM public.orders 
    WHERE id = NEW.order_id;
    
    -- Insert or update cafe rating
    INSERT INTO public.cafe_ratings (cafe_id, user_id, rating, review, created_at)
    VALUES (cafe_id_val, 
            (SELECT user_id FROM public.orders WHERE id = NEW.order_id),
            NEW.rating, 
            NEW.review, 
            NEW.created_at)
    ON CONFLICT (cafe_id, user_id) 
    DO UPDATE SET 
        rating = NEW.rating,
        review = NEW.review,
        updated_at = NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically create cafe rating when order rating is submitted
DROP TRIGGER IF EXISTS trigger_create_cafe_rating_from_order ON public.order_ratings;
CREATE TRIGGER trigger_create_cafe_rating_from_order
    AFTER INSERT OR UPDATE ON public.order_ratings
    FOR EACH ROW
    EXECUTE FUNCTION create_cafe_rating_from_order();

-- 11. Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION create_cafe_rating_from_order() TO authenticated;

-- 12. Success message
DO $$
BEGIN
    RAISE NOTICE 'Order Rating System Migration Completed Successfully!';
    RAISE NOTICE 'New table created: order_ratings';
    RAISE NOTICE 'New columns added to orders table: has_rating, rating_submitted_at, phone_number';
    RAISE NOTICE 'RLS policies and indexes created';
    RAISE NOTICE 'New function created: get_order_rating_summary';
END $$;
