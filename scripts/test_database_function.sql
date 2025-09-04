-- Test the database function directly
-- This will show us exactly what the function returns

-- Test 1: Check if function exists
SELECT 'Function exists:' as test, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.routines 
           WHERE routine_name = 'get_cafes_ordered'
       ) THEN 'YES' ELSE 'NO' END as result;

-- Test 2: Check priority values
SELECT 'Priority values:' as test, 
       name, priority, average_rating 
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name ILIKE '%food court%' OR name ILIKE '%mini meals%'
ORDER BY priority;

-- Test 3: Call the function directly
SELECT 'Function result:' as test, 
       name, priority, average_rating 
FROM get_cafes_ordered() 
LIMIT 5;

-- Test 4: Check total cafes
SELECT 'Total cafes:' as test, COUNT(*) as count FROM public.cafes WHERE is_active = true;
