-- Step 2: Restore all cafes from migration files
-- Run this in Supabase Dashboard → SQL Editor
-- This will restore all cafes and their menu items

-- ========================================
-- TASTE OF INDIA CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190040_add_taste_of_india_cafe.sql

-- ========================================
-- CHATKARA CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190041_add_chatkara_cafe.sql

-- ========================================
-- ITALIAN OVEN CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190042_add_italian_oven_cafe.sql

-- ========================================
-- FOOD COURT CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190043_add_food_court_cafe.sql

-- ========================================
-- KITCHEN CURRY CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190044_add_kitchen_curry_cafe.sql

-- ========================================
-- HAVMOR CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190045_add_havmor_cafe.sql

-- ========================================
-- COOK HOUSE CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190046_add_cook_house_cafe.sql

-- ========================================
-- STARDOM CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190047_add_stardom_cafe.sql

-- ========================================
-- WAFFLE FIT N FRESH CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190048_add_waffle_fit_n_fresh_cafe.sql

-- ========================================
-- THE CRAZY CHEF CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190049_add_the_crazy_chef_cafe.sql

-- ========================================
-- ZERO DEGREE CAFE
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190050_add_zero_degree_cafe.sql

-- ========================================
-- ZAIKA RESTAURANT
-- ========================================
-- Copy and paste the ENTIRE content from:
-- supabase/migrations/20250825190051_add_zaika_restaurant.sql

-- After running all the above, run this verification:
SELECT 'ALL CAFES RESTORED' as status;
SELECT COUNT(*) as total_cafes FROM public.cafes;
SELECT COUNT(*) as total_menu_items FROM public.menu_items;
