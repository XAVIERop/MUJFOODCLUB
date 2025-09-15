-- =====================================================
-- Add Missing Columns to cafe_loyalty_points table
-- =====================================================

-- Add the missing columns
ALTER TABLE public.cafe_loyalty_points 
ADD COLUMN IF NOT EXISTS monthly_spend_30_days DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_tier TEXT DEFAULT 'foodie';

-- Verify the columns were added
SELECT 
  '=== COLUMN VERIFICATION ===' as section,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cafe_loyalty_points' 
  AND column_name IN ('monthly_spend_30_days', 'current_tier')
ORDER BY column_name;
