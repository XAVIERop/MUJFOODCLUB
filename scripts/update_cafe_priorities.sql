-- Update Cafe Priorities and Make Cook House Exclusive
-- Run this in Supabase SQL Editor

-- Update Cook House priority to 6 and make it exclusive
UPDATE public.cafes 
SET 
    priority = 6,
    is_exclusive = true,
    updated_at = NOW()
WHERE name ILIKE '%cook house%';

-- Update China Town priority to 7
UPDATE public.cafes 
SET 
    priority = 7,
    updated_at = NOW()
WHERE name ILIKE '%china town%';

-- Show current priority order
SELECT 
    name,
    priority,
    is_exclusive,
    average_rating,
    total_ratings
FROM public.cafes 
WHERE is_active = true
ORDER BY priority ASC, average_rating DESC NULLS LAST;
