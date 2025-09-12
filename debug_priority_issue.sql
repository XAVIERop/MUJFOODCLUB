-- Debug the priority ordering issue
-- Check data types and values

-- 1. Check the data type of priority column
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cafes' AND column_name = 'priority';

-- 2. Check actual priority values and their types
SELECT 
  name, 
  priority, 
  pg_typeof(priority) as priority_type,
  is_active,
  accepting_orders
FROM cafes 
WHERE is_active = true
ORDER BY priority ASC, name ASC
LIMIT 10;

-- 3. Try ordering by priority as integer explicitly
SELECT 
  name, 
  priority, 
  is_active,
  accepting_orders
FROM cafes 
WHERE is_active = true
ORDER BY priority::integer ASC, name ASC
LIMIT 10;
