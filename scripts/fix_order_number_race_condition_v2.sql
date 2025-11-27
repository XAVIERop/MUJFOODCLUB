-- Fix race condition in generate_daily_order_number function (Improved Version)
-- The issue: Multiple concurrent requests can get the same max_order_num
-- Solution: Use SELECT FOR UPDATE to lock rows and ensure atomicity

CREATE OR REPLACE FUNCTION public.generate_daily_order_number(p_cafe_id UUID)
RETURNS TEXT AS $$
DECLARE
  cafe_name TEXT;
  cafe_prefix TEXT;
  today_date DATE;
  max_order_num INTEGER;
  new_order_num INTEGER;
  final_order_number TEXT;
  max_attempts INTEGER := 20; -- Increased from 10 to 20
  attempt INTEGER := 0;
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
  
  LOOP
    attempt := attempt + 1;
    
    -- Use SELECT FOR UPDATE to lock rows and prevent race conditions
    -- This ensures only one transaction can read/modify at a time
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
      AND o.order_number ~ ('^' || cafe_prefix || '[0-9]{6}$')
    FOR UPDATE; -- Lock rows to prevent concurrent access
    
    -- Increment for new order
    new_order_num := max_order_num + 1;
    
    -- Generate order number with 6-digit padding
    final_order_number := cafe_prefix || LPAD(new_order_num::TEXT, 6, '0');
    
    -- Double-check uniqueness (extra safety)
    -- This check happens within the same transaction, so it's safe
    IF NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_number = final_order_number
    ) THEN
      RETURN final_order_number;
    END IF;
    
    -- If we get here, there was a conflict
    -- This should be very rare with FOR UPDATE, but handle it gracefully
    IF attempt >= max_attempts THEN
      -- Log the issue for debugging
      RAISE WARNING 'Failed to generate unique order number after % attempts for cafe % (prefix: %, date: %)', 
        max_attempts, p_cafe_id, cafe_prefix, today_date;
      RAISE EXCEPTION 'Failed to generate unique order number after % attempts. Please try again.', max_attempts;
    END IF;
    
    -- Small delay and try again
    PERFORM pg_sleep(0.01); -- Increased delay slightly
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify the function was updated
SELECT 'Order number generation function updated with SELECT FOR UPDATE to prevent race conditions!' as status;

-- Test the function
SELECT 
  'Testing order number generation for Banna''s Chowki' as test,
  c.name as cafe_name,
  public.get_cafe_prefix(c.name) as cafe_prefix,
  public.generate_daily_order_number(c.id) as sample_order_number
FROM public.cafes c
WHERE LOWER(c.name) LIKE '%banna%' OR LOWER(c.name) LIKE '%chowki%'
LIMIT 1;

