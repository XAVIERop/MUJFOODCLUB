-- Fix Chatkara Owner Account Link
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Check current status
SELECT 
  'BEFORE FIX - Chatkara Owner Status:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';

-- 2. Check if Chatkara cafe exists
SELECT 
  'Chatkara Cafe Info:' as section,
  id,
  name,
  type,
  location,
  is_active
FROM public.cafes 
WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA';

-- 3. Fix the link - Connect Chatkara owner to Chatkara cafe
UPDATE public.profiles 
SET cafe_id = (
  SELECT id FROM public.cafes 
  WHERE name ILIKE '%chatkara%' OR name = 'CHATKARA' 
  LIMIT 1
)
WHERE email = 'chatkara.owner@mujfoodclub.in';

-- 4. Verify the fix
SELECT 
  'AFTER FIX - Chatkara Owner Status:' as section,
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.location as cafe_location,
  c.is_active as cafe_active
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'chatkara.owner@mujfoodclub.in';

-- 5. Final verification
SELECT 
  'FIX COMPLETE' as status,
  'Chatkara owner is now linked to Chatkara cafe' as result;
