-- Add timing configurations to cafes table
-- This allows easy management of order type availability from Supabase dashboard

-- Add columns for timing configuration
ALTER TABLE public.cafes
ADD COLUMN IF NOT EXISTS delivery_start_time TIME DEFAULT '23:00:00',
ADD COLUMN IF NOT EXISTS delivery_end_time TIME DEFAULT '02:30:00',
ADD COLUMN IF NOT EXISTS delivery_crosses_midnight BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dine_in_start_time TIME DEFAULT '11:00:00',
ADD COLUMN IF NOT EXISTS dine_in_end_time TIME DEFAULT '23:00:00',
ADD COLUMN IF NOT EXISTS takeaway_start_time TIME DEFAULT '11:00:00',
ADD COLUMN IF NOT EXISTS takeaway_end_time TIME DEFAULT '23:00:00',
ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dine_in_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS takeaway_enabled BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN public.cafes.delivery_start_time IS 'Start time for delivery orders (24-hour format)';
COMMENT ON COLUMN public.cafes.delivery_end_time IS 'End time for delivery orders (24-hour format)';
COMMENT ON COLUMN public.cafes.delivery_crosses_midnight IS 'True if delivery window crosses midnight (e.g., 11 PM to 2 AM)';
COMMENT ON COLUMN public.cafes.dine_in_start_time IS 'Start time for dine-in orders (24-hour format)';
COMMENT ON COLUMN public.cafes.dine_in_end_time IS 'End time for dine-in orders (24-hour format)';
COMMENT ON COLUMN public.cafes.takeaway_start_time IS 'Start time for takeaway orders (24-hour format)';
COMMENT ON COLUMN public.cafes.takeaway_end_time IS 'End time for takeaway orders (24-hour format)';
COMMENT ON COLUMN public.cafes.delivery_enabled IS 'Whether cafe accepts delivery orders at all';
COMMENT ON COLUMN public.cafes.dine_in_enabled IS 'Whether cafe accepts dine-in orders at all';
COMMENT ON COLUMN public.cafes.takeaway_enabled IS 'Whether cafe accepts takeaway orders at all';

-- Set extended hours for specific cafes (11 AM to 2 AM)
UPDATE public.cafes
SET 
  delivery_start_time = '11:00:00',
  delivery_end_time = '02:00:00',
  delivery_crosses_midnight = true
WHERE 
  LOWER(name) LIKE '%cook house%'
  OR LOWER(name) LIKE '%taste of india%'
  OR LOWER(name) LIKE '%pizza bakers%'
  OR LOWER(name) LIKE '%food court%'
  OR LOWER(name) LIKE '%punjabi tadka%'
  OR LOWER(name) LIKE '%munch box%'
  OR LOWER(name) LIKE '%mini meals%'
  OR LOWER(name) LIKE '%kitchen%'
  OR LOWER(name) LIKE '%curry%'
  OR LOWER(name) LIKE '%stardom%';

-- Grabit is 24/7
UPDATE public.cafes
SET 
  delivery_start_time = '00:00:00',
  delivery_end_time = '23:59:59',
  delivery_crosses_midnight = false,
  dine_in_enabled = false,
  takeaway_enabled = false
WHERE 
  LOWER(name) LIKE '%grabit%'
  OR LOWER(name) LIKE '%24%seven%'
  OR LOWER(name) LIKE '%grocery%';

-- Outside cafes (like Amor, Banna's Chowki) - all day delivery
UPDATE public.cafes
SET 
  delivery_start_time = '00:00:00',
  delivery_end_time = '23:59:59',
  delivery_crosses_midnight = false,
  dine_in_start_time = '09:00:00',
  dine_in_end_time = '23:00:00',
  takeaway_start_time = '09:00:00',
  takeaway_end_time = '23:00:00'
WHERE 
  location_scope = 'off_campus';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_cafes_timings 
ON public.cafes(delivery_enabled, dine_in_enabled, takeaway_enabled);

-- Display summary
SELECT 
  name,
  delivery_start_time,
  delivery_end_time,
  delivery_crosses_midnight,
  dine_in_start_time,
  dine_in_end_time,
  delivery_enabled,
  dine_in_enabled,
  takeaway_enabled
FROM public.cafes
ORDER BY name
LIMIT 10;

SELECT 'Cafe timings configuration added successfully! You can now manage order timings from Supabase dashboard.' as status;

