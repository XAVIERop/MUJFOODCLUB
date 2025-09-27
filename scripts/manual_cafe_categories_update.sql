-- Manual SQL script to update cafe categories
-- Run this directly in your Supabase SQL editor or database admin panel

-- Update cafe categories according to new requirements
-- First 6 cafes: Chatkara, Food Court, Mini Meals, Punjabi Tadka, Munch Box, Cook House

-- 1. CHATKARA: Chaap + Multi-Cuisine
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Chaap', 'Multi-Cuisine'] 
WHERE name = 'CHATKARA';

-- 2. FOOD COURT: Desserts + Multi-Cuisine  
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Desserts', 'Multi-Cuisine'] 
WHERE name = 'FOOD COURT';

-- 3. Mini Meals: Ice Cream + Beverages + Fast Food + Multi-Cuisine
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Ice Cream', 'Beverages', 'Fast Food', 'Multi-Cuisine'] 
WHERE name = 'Mini Meals';

-- 4. Punjabi Tadka: Pizza + North Indian + Chinese + Multi-Cuisine
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Pizza', 'North Indian', 'Chinese', 'Multi-Cuisine'] 
WHERE name = 'Punjabi Tadka';

-- 5. Munch Box: Pizza + North Indian + Chinese + Fast Food + Multi-Cuisine
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Pizza', 'North Indian', 'Chinese', 'Fast Food', 'Multi-Cuisine'] 
WHERE name = 'Munch Box';

-- 6. COOK HOUSE: Pizza + North Indian + Chinese + Multi-Cuisine
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Pizza', 'North Indian', 'Chinese', 'Multi-Cuisine'] 
WHERE name = 'COOK HOUSE';

-- Verify the updates
SELECT name, priority, cuisine_categories 
FROM public.cafes 
WHERE name IN ('CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE')
ORDER BY priority;
