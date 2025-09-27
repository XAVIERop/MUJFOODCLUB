-- Update cafe categories according to new requirements
-- First 6 cafes: Chatkara, Food Court, Mini Meals, Punjabi Tadka, Munch Box, Cook House

-- 1. Pizza category: Cook House, Punjabi Tadka, Munch Box
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Pizza'] 
WHERE name IN ('COOK HOUSE', 'Punjabi Tadka', 'Munch Box');

-- 2. North Indian category: First 5 cafes excluding Food Court (Chatkara, Mini Meals, Punjabi Tadka, Munch Box, Cook House)
UPDATE public.cafes 
SET cuisine_categories = ARRAY['North Indian'] 
WHERE name IN ('CHATKARA', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE');

-- 3. Chinese category: First 6 cafes (Chatkara, Food Court, Mini Meals, Punjabi Tadka, Munch Box, Cook House)
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Chinese'] 
WHERE name IN ('CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE');

-- 4. Desserts category: Only Food Court
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Desserts'] 
WHERE name = 'FOOD COURT';

-- 5. Chaap category (renamed from Street Food): Only Chatkara
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Chaap'] 
WHERE name = 'CHATKARA';

-- 6. Multi Cuisine category: First 6 cafes
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Multi-Cuisine'] 
WHERE name IN ('CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE');

-- 7. Ice Cream category: Only Mini Meals
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Ice Cream'] 
WHERE name = 'Mini Meals';

-- 8. Beverages category: Only Mini Meals
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Beverages'] 
WHERE name = 'Mini Meals';

-- 9. Fast Food category: Mini Meals and Munch Box
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Fast Food'] 
WHERE name IN ('Mini Meals', 'Munch Box');

-- 10. Reset other cafes to Multi-Cuisine (for cafes not in priority list)
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Multi-Cuisine'] 
WHERE name NOT IN (
  'CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE'
);

-- Verify the updates
SELECT name, priority, cuisine_categories 
FROM public.cafes 
ORDER BY priority;
