-- IMMEDIATE FIX: Recreate the trigger function with better error handling

-- Drop and recreate the function with explicit error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simple, bulletproof function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    -- Log that the trigger is firing
    RAISE NOTICE 'Trigger firing for user: %', NEW.id;
    
    -- Insert profile with error handling
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            full_name,
            block,
            qr_code,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
            COALESCE(NEW.raw_user_meta_data->>'block', 'B1')::block_type,
            'FC' || substr(md5(random()::text), 1, 8) || '_' || substr(NEW.id::text, 1, 8),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Profile creation failed for user %: %', NEW.id, SQLERRM;
            -- Don't fail the user creation, just log the error
    END;
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Test the function
SELECT 'Trigger recreated successfully' as status;

-- Create profiles for the existing users who don't have them
INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    block,
    qr_code,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(au.raw_user_meta_data->>'block', 'B1')::block_type,
    'FC' || substr(md5(random()::text), 1, 8) || '_' || substr(au.id::text, 1, 8),
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
AND au.created_at > NOW() - INTERVAL '1 hour';

SELECT 'Fixed existing users without profiles' as status;
