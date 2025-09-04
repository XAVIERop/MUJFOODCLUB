-- Simple Permission Fix for Cafe Priority System
-- This will resolve the 406 errors without conflicting with existing policies

-- 1. Test the current function first
SELECT 'Testing current function...' as status;
SELECT name, priority, average_rating 
FROM get_cafes_ordered() 
LIMIT 5;

-- 2. If the function works, just fix the permissions
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cafes_ordered() TO anon;

-- 3. Ensure cafes table has proper read permissions
DROP POLICY IF EXISTS "Anyone can view active cafes" ON public.cafes;
CREATE POLICY "Anyone can view active cafes" ON public.cafes
  FOR SELECT USING (is_active = true);

-- 4. Test the function again
SELECT 'Testing function after permission fix...' as status;
SELECT name, priority, average_rating 
FROM get_cafes_ordered() 
LIMIT 5;

-- 5. Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simple permission fix applied successfully!';
    RAISE NOTICE '✅ get_cafes_ordered() function should now work from frontend';
    RAISE NOTICE '✅ Try refreshing your homepage now';
END $$;
