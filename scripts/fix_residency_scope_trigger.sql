-- Fix handle_new_user trigger to properly set residency_scope
-- This ensures new signups with @muj.manipal.edu get 'ghs' residency

-- First, ensure the residency_scope enum type exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'residency_scope') THEN
    CREATE TYPE residency_scope AS ENUM ('ghs', 'off_campus');
  END IF;
END$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  resolved_block block_type;
  resolved_residency residency_scope;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  
  -- Determine block from metadata or default
  resolved_block := COALESCE((NEW.raw_user_meta_data->>'block')::block_type, 'B1');
  
  -- Determine residency_scope:
  -- 1. First check if it's in user metadata (from regular signup)
  -- 2. If not, determine from email domain:
  --    - @mujfoodclub.in -> 'ghs'
  --    - @muj.manipal.edu -> 'ghs' (for regular signups, not Google OAuth)
  --    - Everything else -> 'off_campus'
  resolved_residency := COALESCE(
    (NEW.raw_user_meta_data->>'residency_scope')::residency_scope,
    CASE 
      WHEN user_email LIKE '%@mujfoodclub.in' THEN 'ghs'::residency_scope
      WHEN user_email LIKE '%@muj.manipal.edu' THEN 'ghs'::residency_scope
      ELSE 'off_campus'::residency_scope
    END
  );

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    block,
    qr_code,
    residency_scope,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    resolved_block,
    'FC' || substr(md5(random()::text), 1, 8) || '_' || substr(NEW.id::text, 1, 8),
    resolved_residency,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function was created
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

SELECT '✅ Trigger fixed to properly set residency_scope for new signups!' as status;

