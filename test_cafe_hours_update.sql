-- Test script to update cafe hours to 11:00 AM - 2:00 AM
-- Run this in your Supabase SQL editor or database client

UPDATE public.cafes 
SET hours = '11:00 AM - 2:00 AM' 
WHERE hours = '11:00 AM - 11:00 PM';

-- Verify the changes
SELECT name, hours, accepting_orders 
FROM public.cafes 
ORDER BY name;
