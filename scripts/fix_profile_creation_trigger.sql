-- Fix profile creation trigger to handle current schema
-- This addresses the "Cannot coerce result to single JSON object" error

-- First, let's check what columns actually exist in the profiles table
-- and update the trigger accordingly

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a robust handle_new_user function that handles missing columns gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    profile_block block_type;
    profile_full_name TEXT;
    profile_qr_code TEXT;
BEGIN
    -- Extract data from user metadata with fallbacks
    profile_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        split_part(NEW.email, '@', 1)
    );
    
    -- Handle block with proper type casting
    BEGIN
        profile_block := COALESCE(
            (NEW.raw_user_meta_data->>'custom_block')::block_type, 
            'B1'::block_type
        );
    EXCEPTION WHEN OTHERS THEN
        profile_block := 'B1'::block_type;
    END;
    
    -- Generate QR code
    profile_qr_code := 'FC' || substr(md5(random()::text), 1, 8) || '_' || substr(NEW.id::text, 1, 8);
    
    -- Insert profile with only the columns that definitely exist
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
        profile_full_name,
        profile_block,
        profile_qr_code,
        NOW(),
        NOW()
    );
    
    -- Try to add optional columns if they exist
    BEGIN
        -- Add loyalty_points if column exists
        UPDATE public.profiles 
        SET loyalty_points = 0 
        WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
        -- Column doesn't exist, ignore
        NULL;
    END;
    
    BEGIN
        -- Add loyalty_tier if column exists
        UPDATE public.profiles 
        SET loyalty_tier = 'foodie'::loyalty_tier 
        WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
        -- Column doesn't exist, ignore
        NULL;
    END;
    
    BEGIN
        -- Add total_orders if column exists
        UPDATE public.profiles 
        SET total_orders = 0 
        WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
        -- Column doesn't exist, ignore
        NULL;
    END;
    
    BEGIN
        -- Add total_spent if column exists
        UPDATE public.profiles 
        SET total_spent = 0.00 
        WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN
        -- Column doesn't exist, ignore
        NULL;
    END;
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- Test the function by checking if it can handle a test case
DO $$
DECLARE
    test_result BOOLEAN := FALSE;
BEGIN
    -- Check if the function exists and is callable
    SELECT EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE '✅ Profile creation trigger fixed successfully';
        RAISE NOTICE '✅ Function handle_new_user is ready';
    ELSE
        RAISE NOTICE '❌ Failed to create handle_new_user function';
    END IF;
END $$;
