-- Cafe Rating Auto-Update Trigger
-- This trigger automatically updates cafe average ratings when new order ratings are submitted

-- 1. Create function to update cafe rating
CREATE OR REPLACE FUNCTION update_cafe_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    cafe_id UUID;
    new_average DECIMAL(3,2);
    new_total INTEGER;
BEGIN
    -- Get the cafe ID from the order
    SELECT o.cafe_id INTO cafe_id
    FROM orders o
    WHERE o.id = NEW.order_id;
    
    IF cafe_id IS NOT NULL THEN
        -- Calculate new average rating for the cafe
        SELECT 
            ROUND(AVG(r.rating)::DECIMAL, 2),
            COUNT(r.rating)
        INTO new_average, new_total
        FROM order_ratings r
        JOIN orders o ON r.order_id = o.id
        WHERE o.cafe_id = cafe_id;
        
        -- Update cafe's average rating
        UPDATE cafes 
        SET 
            average_rating = COALESCE(new_average, 0),
            total_ratings = COALESCE(new_total, 0),
            updated_at = NOW()
        WHERE id = cafe_id;
        
        RAISE NOTICE 'Cafe rating updated: cafe_id=%, average=%, total=%', cafe_id, new_average, new_total;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2. Create trigger on order_ratings table
DROP TRIGGER IF EXISTS trigger_update_cafe_rating ON order_ratings;
CREATE TRIGGER trigger_update_cafe_rating
    AFTER INSERT OR UPDATE OR DELETE ON order_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_cafe_rating();

-- 3. Grant execute permission
GRANT EXECUTE ON FUNCTION update_cafe_rating() TO authenticated;

-- 4. Success message
DO $$
BEGIN
    RAISE NOTICE 'Cafe Rating Auto-Update Trigger Created Successfully!';
    RAISE NOTICE 'Function: update_cafe_rating()';
    RAISE NOTICE 'Trigger: trigger_update_cafe_rating on order_ratings table';
    RAISE NOTICE 'Now cafe ratings will automatically update when users submit order ratings!';
END $$;
