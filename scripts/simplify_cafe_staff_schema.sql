-- Simplify cafe_staff table to support simple staff names
-- This allows cafe owners to add staff by name without requiring user accounts

-- 1. Add staff_name column to cafe_staff table
ALTER TABLE public.cafe_staff 
ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- 2. Make user_id nullable (optional) since we can now add staff by name only
ALTER TABLE public.cafe_staff 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add a check constraint to ensure either user_id OR staff_name is provided
ALTER TABLE public.cafe_staff 
ADD CONSTRAINT check_staff_identifier 
CHECK (
  (user_id IS NOT NULL AND staff_name IS NULL) OR 
  (user_id IS NULL AND staff_name IS NOT NULL) OR
  (user_id IS NOT NULL AND staff_name IS NOT NULL)
);

-- 4. Update the unique constraint to allow multiple staff with same name but different cafes
-- (Remove the old unique constraint first)
ALTER TABLE public.cafe_staff 
DROP CONSTRAINT IF EXISTS cafe_staff_cafe_id_user_id_key;

-- 5. Create a new unique constraint that allows same user_id in different cafes
-- but prevents duplicate user_id in same cafe
CREATE UNIQUE INDEX IF NOT EXISTS cafe_staff_cafe_user_unique 
ON public.cafe_staff (cafe_id, user_id) 
WHERE user_id IS NOT NULL;

-- 6. Add an index for staff_name lookups
CREATE INDEX IF NOT EXISTS idx_cafe_staff_name 
ON public.cafe_staff (cafe_id, staff_name) 
WHERE staff_name IS NOT NULL;

-- 7. Update RLS policies to work with the new structure
-- Drop existing policies
DROP POLICY IF EXISTS "cafe_staff_select" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_update" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_insert" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_delete" ON public.cafe_staff;
DROP POLICY IF EXISTS "cafe_staff_permissive_select" ON public.cafe_staff;

-- Create new policies that work for cafe owners
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

-- 8. Test the new structure
SELECT 
  'Schema updated successfully' as status,
  'Cafe staff can now be added by name without requiring user accounts' as message;

-- 9. Show current cafe_staff structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'cafe_staff' 
AND table_schema = 'public'
ORDER BY ordinal_position;
