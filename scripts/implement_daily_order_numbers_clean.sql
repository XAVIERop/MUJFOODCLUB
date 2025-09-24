-- Implement Daily Reset Order Number System (CLEAN VERSION)
-- This script creates a new order number generation system that resets daily
-- Format: {CAFE_PREFIX}{6_DIGIT_NUMBER} (e.g., CHA000001, FC000001)

-- 1. Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.generate_daily_order_number(UUID);
DROP FUNCTION IF EXISTS public.get_cafe_prefix(TEXT);
DROP FUNCTION IF EXISTS public.is_valid_daily_order_number(TEXT);

-- 2. Create cafe prefix mapping function
CREATE OR REPLACE FUNCTION public.get_cafe_prefix(cafe_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert cafe name to uppercase and extract prefix
  CASE 
    WHEN UPPER(cafe_name) LIKE '%CHATKARA%' THEN RETURN 'CHA';
    WHEN UPPER(cafe_name) LIKE '%FOOD COURT%' THEN RETURN 'FC';
    WHEN UPPER(cafe_name) LIKE '%COOK HOUSE%' THEN RETURN 'CH';
    WHEN UPPER(cafe_name) LIKE '%MOMO%' THEN RETURN 'MOM';
    WHEN UPPER(cafe_name) LIKE '%GOBBLERS%' THEN RETURN 'GOB';
    WHEN UPPER(cafe_name) LIKE '%KRISPP%' THEN RETURN 'KRI';
    WHEN UPPER(cafe_name) LIKE '%TATA%' OR UPPER(cafe_name) LIKE '%MYBRISTO%' THEN RETURN 'TAT';
    ELSE 
      -- Default: Take first 3 letters of cafe name
      RETURN UPPER(SUBSTR(REPLACE(cafe_name, ' ', ''), 1, 3));
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the main order number generation function
CREATE OR REPLACE FUNCTION public.generate_daily_order_number(p_cafe_id UUID)
RETURNS TEXT AS $$
DECLARE
  cafe_name TEXT;
  cafe_prefix TEXT;
  today_date DATE;
  max_order_num INTEGER;
  new_order_num INTEGER;
  final_order_number TEXT;  -- Final variable name to avoid any conflicts
  max_attempts INTEGER := 10;
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
    
    -- Get the highest order number for this cafe today
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
    IF NOT EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.order_number = final_order_number
    ) THEN
      RETURN final_order_number;
    END IF;
    
    -- If we get here, there was a conflict (shouldn't happen)
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique order number after % attempts', max_attempts;
    END IF;
    
    -- Small delay and try again
    PERFORM pg_sleep(0.001);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a helper function to validate order numbers
CREATE OR REPLACE FUNCTION public.is_valid_daily_order_number(order_num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if order number matches pattern: 3 letters + 6 digits
  RETURN order_num ~ '^[A-Z]{3}[0-9]{6}$';
END;
$$ LANGUAGE plpgsql;

-- 5. Test the functions
SELECT 'Testing Order Number Generation:' as info;

-- Test with Chatkara
SELECT 
  'Chatkara' as cafe_name,
  public.generate_daily_order_number(id) as sample_order_number
FROM public.cafes 
WHERE UPPER(name) LIKE '%CHATKARA%' 
LIMIT 1;

-- Test with Food Court
SELECT 
  'Food Court' as cafe_name,
  public.generate_daily_order_number(id) as sample_order_number
FROM public.cafes 
WHERE UPPER(name) LIKE '%FOOD COURT%' 
LIMIT 1;

-- Test with any other cafe
SELECT 
  name as cafe_name,
  public.generate_daily_order_number(id) as sample_order_number
FROM public.cafes 
WHERE is_active = true 
  AND UPPER(name) NOT LIKE '%CHATKARA%' 
  AND UPPER(name) NOT LIKE '%FOOD COURT%'
LIMIT 1;

-- 6. Test validation function
SELECT 'Testing Order Number Validation:' as info;
SELECT 
  'CHA000001' as test_number,
  public.is_valid_daily_order_number('CHA000001') as is_valid
UNION ALL
SELECT 
  'FC000001' as test_number,
  public.is_valid_daily_order_number('FC000001') as is_valid
UNION ALL
SELECT 
  'INVALID123' as test_number,
  public.is_valid_daily_order_number('INVALID123') as is_valid;

-- 7. Show current cafes
SELECT 'Current Cafes:' as info;
SELECT id, name, is_active FROM public.cafes WHERE is_active = true ORDER BY name;

SELECT 'Implementation Complete!' as status;
SELECT 'Functions created successfully' as message;
