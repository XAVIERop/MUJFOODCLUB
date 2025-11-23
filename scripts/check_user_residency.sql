-- Check user's residency_scope (replace email with actual user email)
-- Example: Check for a Gmail user
SELECT 
  id,
  email,
  residency_scope,
  full_name,
  created_at
FROM public.profiles
WHERE email LIKE '%@gmail.com'
ORDER BY created_at DESC
LIMIT 5;

