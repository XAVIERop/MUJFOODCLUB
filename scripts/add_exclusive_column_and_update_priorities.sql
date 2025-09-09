-- Add is_exclusive column and update cafe priorities
-- Run this in Supabase SQL Editor

-- Step 1: Add is_exclusive column to cafes table
ALTER TABLE public.cafes 
ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT false;

-- Step 2: Create index for is_exclusive column
CREATE INDEX IF NOT EXISTS idx_cafes_is_exclusive ON public.cafes(is_exclusive);

-- Step 3: Set existing exclusive cafes (Chatkara and Food Court)
UPDATE public.cafes 
SET is_exclusive = true 
WHERE name ILIKE '%chatkara%' OR name ILIKE '%food court%';

-- Step 4: Update Cook House priority to 6 and make it exclusive
UPDATE public.cafes 
SET 
    priority = 6,
    is_exclusive = true,
    updated_at = NOW()
WHERE name ILIKE '%cook house%';

-- Step 5: Update China Town priority to 7
UPDATE public.cafes 
SET 
    priority = 7,
    updated_at = NOW()
WHERE name ILIKE '%china town%';

-- Step 6: Show current priority order
SELECT 
    name,
    priority,
    is_exclusive,
    average_rating,
    total_ratings
FROM public.cafes 
WHERE is_active = true
ORDER BY priority ASC, average_rating DESC NULLS LAST;
