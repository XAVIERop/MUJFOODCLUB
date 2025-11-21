-- Update Chatkara cafe description
UPDATE public.cafes 
SET description = 'Pure veg delights with non-veg-like flavors — from authentic chaap and tandoori treats to Chinese, momos, and rich Indian curries.'
WHERE name = 'CHATKARA';

-- Verify the update
SELECT name, description 
FROM public.cafes 
WHERE name = 'CHATKARA';















