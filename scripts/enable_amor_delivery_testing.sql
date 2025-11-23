-- Enable delivery for Amor cafe (for testing)
-- This will allow delivery 24/7

UPDATE public.cafes
SET 
  delivery_enabled = TRUE,
  delivery_start_time = '00:00:00',
  delivery_end_time = '23:59:59',
  delivery_crosses_midnight = FALSE
WHERE name = 'Amor';

-- Verify the update
SELECT 
  name,
  delivery_enabled,
  delivery_start_time,
  delivery_end_time,
  delivery_crosses_midnight,
  accepting_orders,
  is_active
FROM public.cafes
WHERE name = 'Amor';

-- Expected result: delivery_enabled = true, 24/7 hours

