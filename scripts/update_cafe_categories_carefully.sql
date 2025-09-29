-- Update Cafe Categories Based on User Requirements
-- This script carefully updates only the cuisine_categories field for each cafe
-- No other fields are modified

-- =====================================================
-- 1. PIZZA CATEGORY
-- =====================================================
-- Pizza: Cook House, Munch Box
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Pizza', 'Multi-Cuisine'] 
WHERE name IN ('COOK HOUSE', 'Munch Box');

-- =====================================================
-- 2. NORTH INDIAN CATEGORY  
-- =====================================================
-- North Indian: First 6 priority cafes
UPDATE public.cafes 
SET cuisine_categories = ARRAY['North Indian', 'Multi-Cuisine'] 
WHERE name IN ('CHATKARA', 'FOOD COURT', 'Mini Meals', 'Punjabi Tadka', 'Munch Box', 'COOK HOUSE');

-- =====================================================
-- 3. CHINESE CATEGORY
-- =====================================================
-- Chinese: Chatkara, Food Court, Munch Box, Cook House
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Chinese', 'Multi-Cuisine'] 
WHERE name IN ('CHATKARA', 'FOOD COURT', 'Munch Box', 'COOK HOUSE');

-- =====================================================
-- 4. DESSERTS CATEGORY
-- =====================================================
-- Desserts: Food Court
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Desserts', 'Multi-Cuisine'] 
WHERE name = 'FOOD COURT';

-- =====================================================
-- 5. CHAAP CATEGORY
-- =====================================================
-- Chaap: Chatkara
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Chaap', 'Multi-Cuisine'] 
WHERE name = 'CHATKARA';

-- =====================================================
-- 6. ICE CREAM CATEGORY
-- =====================================================
-- Ice Cream: Mini Meals
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Ice Cream', 'Multi-Cuisine'] 
WHERE name = 'Mini Meals';

-- =====================================================
-- 7. BEVERAGES CATEGORY
-- =====================================================
-- Beverages: Mini Meals, Cook House, Food Court
UPDATE public.cafes 
SET cuisine_categories = ARRAY['Beverages', 'Multi-Cuisine'] 
WHERE name IN ('Mini Meals', 'COOK HOUSE', 'FOOD COURT');

-- =====================================================
-- 8. MULTI-CUISINE CATEGORY
-- =====================================================
-- Multi-Cuisine: All cafes (already have this, but ensure it's there)
-- No changes needed - all cafes already have 'Multi-Cuisine'

-- =====================================================
-- 9. VERIFICATION QUERY
-- =====================================================
-- Run this to verify the updates:
-- SELECT name, cuisine_categories FROM cafes WHERE is_active = true ORDER BY name;

