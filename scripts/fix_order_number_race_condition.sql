-- Fix race condition in generate_daily_order_number function
-- The issue: Multiple concurrent requests can get the same max_order_num
-- Solution: Use advisory locks to ensure only one order number generation happens at a time per cafe

CREATE OR REPLACE FUNCTION public.generate_daily_order_number(p_cafe_id UUID)
RETURNS TEXT AS $$
DECLARE
  cafe_name TEXT;
  cafe_prefix TEXT;
  today_date DATE;
  max_order_num INTEGER;
  new_order_num INTEGER;
  final_order_number TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
  lock_id BIGINT;
BEGIN
  -- Get cafe name
  SELECT name INTO cafe_name 
  FROM public.cafes 
  WHERE id = p_cafe_id;
  
  IF cafe_name IS NULL THEN
    RAISE EXCEPTION 'Cafe with ID % not found', p_cafe_id;
  END IF;
  
  -- Get cafe prefix
  cafe_prefix := public.get_cafe_prefix(cafe_name);
  today_date := CURRENT_DATE;
  
  -- Create a unique lock ID based on cafe_id and date
  -- This ensures only one order number generation happens at a time per cafe per day
  lock_id := ('x' || substr(md5(p_cafe_id::text || today_date::text), 1, 16))::bit(64)::bigint;
  
  -- Acquire advisory lock (non-blocking, but ensures atomicity)
  -- This prevents race conditions when multiple orders are created simultaneously
  IF NOT pg_try_advisory_xact_lock(lock_id) THEN
    -- If we can't get the lock immediately, wait a bit and try again
    PERFORM pg_sleep(0.01);
    IF NOT pg_try_advisory_xact_lock(lock_id) THEN
      RAISE EXCEPTION 'Could not acquire lock for order number generation';
    END IF;
  END IF;
  
  LOOP
    attempt := attempt + 1;
    
    -- Get the highest order number for this cafe today
    -- Use a more robust query that handles edge cases
    SELECT COALESCE(MAX(
      CASE 
        WHEN o.order_number ~ ('^' || cafe_prefix || '[0-9]{6}$') THEN
          CAST(SUBSTR(o.order_number, LENGTH(cafe_prefix) + 1) AS INTEGER)
        ELSE 0
      END
    ), 0) INTO max_order_num
    FROM public.orders o
    WHERE o.cafe_id = p_cafe_id 
      AND DATE(o.created_at) = today_date
      AND o.order_number ~ ('^' || cafe_prefix || '[0-9]{6}$');
    
    -- Increment for new order
    new_order_num := max_order_num + 1;
    
    -- Generate order number with 6-digit padding
    final_order_number := cafe_prefix || LPAD(new_order_num::TEXT, 6, '0');
    
    -- Double-check uniqueness (extra safety)
    -- This check is now protected by the advisory lock, so it should be safe
    IF NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_number = final_order_number
    ) THEN
      RETURN final_order_number;
    END IF;
    
    -- If we get here, there was a conflict (shouldn't happen with lock, but safety check)
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique order number after % attempts', max_attempts;
    END IF;
    
    -- Small delay and try again
    PERFORM pg_sleep(0.001);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify the function was updated
SELECT 'Order number generation function updated with advisory locks to prevent race conditions!' as status;

-- Test the function
SELECT 
  'Testing order number generation for Banna''s Chowki' as test,
  c.name as cafe_name,
  public.get_cafe_prefix(c.name) as cafe_prefix,
  public.generate_daily_order_number(c.id) as sample_order_number
FROM public.cafes c
WHERE LOWER(c.name) LIKE '%banna%' OR LOWER(c.name) LIKE '%chowki%'
LIMIT 1;

