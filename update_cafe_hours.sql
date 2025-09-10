-- Update ALL cafe hours to 11:00 AM - 2:00 AM
UPDATE public.cafes 
SET hours = '11:00 AM - 2:00 AM';

-- Update specific cafe locations to B1 Ground Floor, GHS
UPDATE public.cafes 
SET location = 'B1 Ground Floor, GHS' 
WHERE name IN ('CHATKARA', 'Mini Meals', 'Dialog', 'The Waffle Co');

-- Update specific cafe locations to G1 Ground Floor, GHS
UPDATE public.cafes 
SET location = 'G1 Ground Floor, GHS' 
WHERE name IN ('FOOD COURT', 'Punjabi Tadka', 'Munch Box');

-- Update specific cafe locations to G1 First Floor, GHS
UPDATE public.cafes 
SET location = 'G1 First Floor, GHS' 
WHERE name IN ('COOK HOUSE', 'ITALIAN OVEN', 'Havmor', 'Waffle Fit N Fresh', 'Soya Chaap Corner');

-- Update specific cafe locations to B1 First Floor, GHS
UPDATE public.cafes 
SET location = 'B1 First Floor, GHS' 
WHERE name IN ('Taste of India', 'ZAIKA', 'The Crazy Chef');

-- Update specific cafe locations to G4 Ground Floor, GHS
UPDATE public.cafes 
SET location = 'G4 Ground Floor, GHS' 
WHERE name IN ('China Town');

-- Update specific cafe locations to G2 Ground Floor, GHS
UPDATE public.cafes 
SET location = 'G2 Ground Floor, GHS' 
WHERE name IN ('STARDOM Café & Lounge', 'Let''s Go Live');

-- Update specific cafe locations to B4 Ground Floor, GHS
UPDATE public.cafes 
SET location = 'B4 Ground Floor, GHS' 
WHERE name IN ('Dev Sweets & Snacks', 'Tea Tradition');

-- Update specific cafe locations to Indya Mess First Floor, GHS
UPDATE public.cafes 
SET location = 'Indya Mess First Floor, GHS' 
WHERE name IN ('The Kitchen & Curry');

-- Verify the changes
SELECT name, location, hours, accepting_orders 
FROM public.cafes 
ORDER BY name;
