-- Update Food Court phone number to +91 8319941006
UPDATE public.cafes 
SET 
    phone = '+91 8319941006',
    updated_at = NOW()
WHERE name = 'FOOD COURT';

-- Verify the update
SELECT 
    name,
    phone,
    location,
    updated_at
FROM public.cafes 
WHERE name = 'FOOD COURT';
