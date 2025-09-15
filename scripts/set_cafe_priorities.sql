-- Set cafe priorities according to the specified order
-- 1st priority: Chatkara, 2nd: Food Court, 3rd: Mini Meals, 4th: Punjabi Tadka, 5th: Munch Box, 6th: Cook House

-- Step 1: Check current cafe priorities
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders
FROM public.cafes 
ORDER BY priority ASC, name ASC;

-- Step 2: Update cafe priorities
UPDATE public.cafes 
SET priority = CASE 
    WHEN LOWER(name) LIKE '%chatkara%' THEN 1
    WHEN LOWER(name) LIKE '%food court%' OR LOWER(name) LIKE '%foodcourt%' THEN 2
    WHEN LOWER(name) LIKE '%mini meals%' OR LOWER(name) LIKE '%minimeals%' THEN 3
    WHEN LOWER(name) LIKE '%punjabi%' AND LOWER(name) LIKE '%tadka%' THEN 4
    WHEN LOWER(name) LIKE '%munch%' AND LOWER(name) LIKE '%box%' THEN 5
    WHEN LOWER(name) LIKE '%cook%' AND LOWER(name) LIKE '%house%' THEN 6
    ELSE 99 -- Any other cafes get lowest priority
END,
updated_at = now()
WHERE name IS NOT NULL;

-- Step 3: Verify the updated priorities
SELECT 
    id,
    name,
    priority,
    is_active,
    accepting_orders,
    updated_at
FROM public.cafes 
ORDER BY priority ASC, name ASC;

-- Step 4: Check if all expected cafes have the correct priorities
SELECT 
    CASE 
        WHEN COUNT(*) = 6 THEN 'SUCCESS: All 6 cafes have priorities set'
        ELSE 'WARNING: Only ' || COUNT(*) || ' cafes found with priorities 1-6'
    END as priority_check
FROM public.cafes 
WHERE priority BETWEEN 1 AND 6;

-- Step 5: Show the final cafe order
SELECT 
    'Priority ' || priority || ': ' || name as cafe_order
FROM public.cafes 
WHERE priority BETWEEN 1 AND 6
ORDER BY priority ASC;
