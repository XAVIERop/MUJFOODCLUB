-- Test staff insertion to debug the issue

-- 1. Check if staff_name column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cafe_staff' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check current RLS policies on cafe_staff
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'cafe_staff';

-- 3. Test inserting a staff member (replace with actual cafe_id)
-- This will show us what error occurs
INSERT INTO public.cafe_staff (cafe_id, staff_name, role, is_active)
VALUES (
  (SELECT id FROM public.cafes LIMIT 1), -- Get first cafe_id
  'Test Staff',
  'delivery',
  true
);

-- 4. Check if the insert worked
SELECT * FROM public.cafe_staff WHERE staff_name = 'Test Staff';
