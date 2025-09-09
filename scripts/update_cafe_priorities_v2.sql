-- Update Cafe Priorities - Version 2
-- This script updates cafe priorities and makes Havmor exclusive

-- Step 1: Update Cook House priority to 5
UPDATE public.cafes 
SET 
    priority = 5,
    updated_at = NOW()
WHERE name ILIKE '%cook house%';

-- Step 2: Update Havmor priority to 6 and make it exclusive
UPDATE public.cafes 
SET 
    priority = 6,
    is_exclusive = true,
    updated_at = NOW()
WHERE name ILIKE '%havmor%';

-- Step 3: Update Mini Meals priority to 8
UPDATE public.cafes 
SET 
    priority = 8,
    updated_at = NOW()
WHERE name ILIKE '%mini meals%';

-- Step 4: Update China Town priority to 7 (keeping it in the same position)
UPDATE public.cafes 
SET 
    priority = 7,
    updated_at = NOW()
WHERE name ILIKE '%china town%';

-- Step 5: Show current priority order
SELECT 
    name,
    priority,
    is_exclusive,
    average_rating,
    total_ratings
FROM public.cafes 
WHERE is_active = true
ORDER BY priority ASC, average_rating DESC NULLS LAST;
