-- Update Food Court order number prefix from 'FC' to 'FOO'
-- This script updates the get_cafe_prefix function to use 'FOO' for Food Court

-- Update the get_cafe_prefix function
CREATE OR REPLACE FUNCTION public.get_cafe_prefix(cafe_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Convert cafe name to uppercase and extract prefix
  CASE 
    WHEN UPPER(cafe_name) LIKE '%CHATKARA%' THEN RETURN 'CHA';
    WHEN UPPER(cafe_name) LIKE '%FOOD COURT%' THEN RETURN 'FOO';
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

-- Test the function to verify it works
SELECT 
  'FOOD COURT' as cafe_name,
  public.get_cafe_prefix('FOOD COURT') as new_prefix,
  'FOO' as expected_prefix;

-- Show current Food Court orders with FC prefix (if any)
SELECT 
  order_number,
  created_at,
  cafe_id
FROM public.orders 
WHERE order_number LIKE 'FC%'
ORDER BY created_at DESC
LIMIT 5;

-- Note: Existing orders with 'FC' prefix will remain unchanged
-- Only new orders will use the 'FOO' prefix
