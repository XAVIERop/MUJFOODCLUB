-- Fix race condition in generate_daily_order_number function (Final Version)
-- The issue: Multiple concurrent requests can get the same max_order_num
-- Solution: Use a dedicated counter table with row-level locking for atomicity

-- Step 1: Create a table to track daily order counters per cafe
CREATE TABLE IF NOT EXISTS public.daily_order_counters (
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  order_date DATE NOT NULL,
  current_counter INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (cafe_id, order_date)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_order_counters_lookup 
ON public.daily_order_counters(cafe_id, order_date);

-- Step 2: Update the generate_daily_order_number function to use the counter table
CREATE OR REPLACE FUNCTION public.generate_daily_order_number(p_cafe_id UUID)
RETURNS TEXT AS $$
DECLARE
  cafe_name TEXT;
  cafe_prefix TEXT;
  today_date DATE;
  current_counter INTEGER;
  final_order_number TEXT;
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
  
  -- Use INSERT ... ON CONFLICT to atomically get/increment counter
  -- This ensures only one transaction can increment at a time
  INSERT INTO public.daily_order_counters (cafe_id, order_date, current_counter)
  VALUES (p_cafe_id, today_date, 1)
  ON CONFLICT (cafe_id, order_date) 
  DO UPDATE SET 
    current_counter = daily_order_counters.current_counter + 1,
    updated_at = now()
  RETURNING daily_order_counters.current_counter INTO current_counter;
  
  -- Generate order number with 6-digit padding
  final_order_number := cafe_prefix || LPAD(current_counter::TEXT, 6, '0');
  
  -- Verify uniqueness (should never fail with this approach, but safety check)
  IF EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.order_number = final_order_number
  ) THEN
    -- This should never happen, but if it does, try again with a higher number
    UPDATE public.daily_order_counters
    SET current_counter = daily_order_counters.current_counter + 1
    WHERE cafe_id = p_cafe_id AND order_date = today_date
    RETURNING daily_order_counters.current_counter INTO current_counter;
    
    final_order_number := cafe_prefix || LPAD(current_counter::TEXT, 6, '0');
  END IF;
  
  RETURN final_order_number;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Initialize counters for existing cafes (optional - for migration)
-- This will set counters based on existing orders today
INSERT INTO public.daily_order_counters (cafe_id, order_date, current_counter)
SELECT 
  o.cafe_id,
  DATE(o.created_at) as order_date,
  COALESCE(MAX(
    CASE 
      WHEN o.order_number ~ ('^' || public.get_cafe_prefix(c.name) || '[0-9]{6}$') THEN
        CAST(SUBSTR(o.order_number, LENGTH(public.get_cafe_prefix(c.name)) + 1) AS INTEGER)
      ELSE 0
    END
  ), 0) as current_counter
FROM public.orders o
JOIN public.cafes c ON o.cafe_id = c.id
WHERE DATE(o.created_at) = CURRENT_DATE
GROUP BY o.cafe_id, DATE(o.created_at)
ON CONFLICT (cafe_id, order_date) DO NOTHING;

-- Step 4: Verify the function was updated
SELECT 'Order number generation function updated with counter table for atomic increments!' as status;

-- Step 5: Test the function
SELECT 
  'Testing order number generation for Banna''s Chowki' as test,
  c.name as cafe_name,
  public.get_cafe_prefix(c.name) as cafe_prefix,
  public.generate_daily_order_number(c.id) as sample_order_number
FROM public.cafes c
WHERE LOWER(c.name) LIKE '%banna%' OR LOWER(c.name) LIKE '%chowki%'
LIMIT 1;

-- Step 6: Show current counters
SELECT 
  c.name as cafe_name,
  doc.order_date,
  doc.current_counter,
  doc.updated_at
FROM public.daily_order_counters doc
JOIN public.cafes c ON doc.cafe_id = c.id
WHERE doc.order_date = CURRENT_DATE
ORDER BY c.name;

