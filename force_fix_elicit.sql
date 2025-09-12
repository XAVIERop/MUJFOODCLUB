-- Force fix ELICIT 2025 image and status
-- First, let's see what we have
SELECT 'BEFORE UPDATE:' as status;
SELECT id, name, slug, image_url, accepting_orders FROM cafes WHERE slug = 'elicit-2025';

-- Force update with explicit values
UPDATE cafes 
SET 
    image_url = '/elicit_cafecard.JPG',
    accepting_orders = true,
    name = 'ELICIT 2025',
    description = 'ACM ELICIT 2025 Event - Special Menu with Zero Degree Cafe and Dialog',
    priority = 1,
    updated_at = NOW()
WHERE slug = 'elicit-2025';

-- Verify the update
SELECT 'AFTER UPDATE:' as status;
SELECT id, name, slug, image_url, accepting_orders, updated_at FROM cafes WHERE slug = 'elicit-2025';

-- Also check if there are any other ELICIT entries
SELECT 'ALL ELICIT ENTRIES:' as status;
SELECT id, name, slug, image_url, accepting_orders FROM cafes WHERE name LIKE '%ELICIT%';
