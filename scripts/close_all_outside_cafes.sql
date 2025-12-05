-- Close all outside cafes (off_campus cafes)
-- This sets accepting_orders = false for all cafes with location_scope = 'off_campus'

-- Step 1: Check current status of outside cafes (before update)
SELECT 
    'BEFORE UPDATE' as status,
    id,
    name,
    slug,
    location_scope,
    is_active,
    accepting_orders
FROM public.cafes
WHERE location_scope = 'off_campus'
ORDER BY name;

-- Step 2: Update all outside cafes to stop accepting orders
UPDATE public.cafes
SET 
    accepting_orders = false,
    updated_at = NOW()
WHERE location_scope = 'off_campus';

-- Step 3: Verify the update (after update)
SELECT 
    'AFTER UPDATE' as status,
    id,
    name,
    slug,
    location_scope,
    is_active,
    accepting_orders,
    updated_at
FROM public.cafes
WHERE location_scope = 'off_campus'
ORDER BY name;

-- Step 4: Summary
SELECT 
    'SUMMARY' as report_type,
    COUNT(*) FILTER (WHERE location_scope = 'off_campus' AND accepting_orders = false) as closed_outside_cafes,
    COUNT(*) FILTER (WHERE location_scope = 'off_campus' AND accepting_orders = true) as still_open_outside_cafes,
    COUNT(*) FILTER (WHERE location_scope = 'off_campus') as total_outside_cafes
FROM public.cafes;

-- Step 5: List all closed outside cafes
SELECT 
    'Closed Outside Cafes' as report_type,
    name,
    slug,
    location_scope,
    accepting_orders,
    updated_at
FROM public.cafes
WHERE location_scope = 'off_campus'
    AND accepting_orders = false
ORDER BY name;

