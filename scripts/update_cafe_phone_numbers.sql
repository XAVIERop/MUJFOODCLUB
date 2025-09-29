-- Update Phone Numbers for Specific Cafes
-- Update the phone numbers for Punjabi Tadka, Cook House, and Munch Box

-- 1. Update Punjabi Tadka phone number
UPDATE public.cafes 
SET 
    phone = '+91 9001282566',
    updated_at = NOW()
WHERE name = 'Punjabi Tadka';

-- 2. Update Cook House phone number  
UPDATE public.cafes 
SET 
    phone = '+91 9116966635',
    updated_at = NOW()
WHERE name = 'COOK HOUSE';

-- 3. Update Munch Box phone number
UPDATE public.cafes 
SET 
    phone = '+91 9571688579',
    updated_at = NOW()
WHERE name = 'Munch Box';

-- Verify the updates
SELECT 
    name,
    phone,
    location,
    updated_at
FROM public.cafes 
WHERE name IN ('Punjabi Tadka', 'COOK HOUSE', 'Munch Box')
ORDER BY name;
