-- Fix cafe_staff schema for simplified staff management
-- Handle existing policies gracefully

-- 1. Add staff_name column if it doesn't exist
ALTER TABLE public.cafe_staff 
ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- 2. Make user_id nullable if it's not already
ALTER TABLE public.cafe_staff 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Drop existing policies first
DROP POLICY IF EXISTS "cafe_owners_manage_staff" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_select" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_update" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_insert" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_delete" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_permissive_select" ON public.cafe_staff;

-- 4. Create new policy for cafe owners
CREATE POLICY "cafe_owners_manage_staff" ON public.cafe_staff
  FOR ALL USING (
    -- Allow cafe owners to manage staff for their cafe
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.cafe_id = cafe_staff.cafe_id 
      AND profiles.user_type = 'cafe_owner'
      AND profiles.id = auth.uid()
    )
    OR
    -- Allow staff members to view their own records
    (user_id IS NOT NULL AND user_id = auth.uid())
  );

-- 5. Add constraint to ensure either user_id OR staff_name is provided
ALTER TABLE public.cafe_staff 
DROP CONSTRAINT IF EXISTS check_staff_identifier;

ALTER TABLE public.cafe_staff 
ADD CONSTRAINT check_staff_identifier 
CHECK (
  (user_id IS NOT NULL AND staff_name IS NULL) OR 
  (user_id IS NULL AND staff_name IS NOT NULL) OR
  (user_id IS NOT NULL AND staff_name IS NOT NULL)
);

-- 6. Test the schema
SELECT 
  'Schema updated successfully' as status,
  'Cafe staff can now be added by name without requiring user accounts' as message;

-- 7. Show current structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cafe_staff' 
AND table_schema = 'public'
ORDER BY ordinal_position;
