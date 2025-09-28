-- Fix Chatkara menu: Remove "Chinese -" prefix from BOTH categories and item names
-- This script will update all menu items in Chatkara that have "Chinese -" prefix

-- First, let's see what we're working with
SELECT 
    name,
    category,
    COUNT(*) as count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
AND (name LIKE 'Chinese -%' OR category LIKE 'Chinese -%')
GROUP BY name, category
ORDER BY category, name;

-- Update item names to remove "Chinese - " prefix
UPDATE public.menu_items 
SET name = REPLACE(name, 'Chinese - ', '')
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
AND name LIKE 'Chinese -%';

-- Update categories to remove "Chinese - " prefix  
UPDATE public.menu_items 
SET category = REPLACE(category, 'Chinese - ', '')
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
AND category LIKE 'Chinese -%';

-- Verify the changes
SELECT 
    name,
    category,
    COUNT(*) as count
FROM public.menu_items 
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
GROUP BY name, category
ORDER BY category, name;
