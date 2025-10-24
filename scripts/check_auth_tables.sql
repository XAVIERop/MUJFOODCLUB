-- Check All Auth Tables for Rishit Account
-- This will show what auth data still exists
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    user_email TEXT := 'rishit.2428020220@muj.manipal.edu';
    auth_user_id UUID;
    count_result INTEGER;
BEGIN
    RAISE NOTICE '=== CHECKING ALL AUTH TABLES ===';
    RAISE NOTICE 'Email: %', user_email;
    
    -- Get auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'Auth User ID: %', COALESCE(auth_user_id::text, 'NULL');
    
    -- Check auth.users
    SELECT COUNT(*) INTO count_result FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'auth.users: % records', count_result;
    
    -- Check auth.identities
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.identities WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.identities: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.identities: Table not accessible';
    END;
    
    -- Check auth.sessions
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.sessions WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.sessions: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.sessions: Table not accessible';
    END;
    
    -- Check auth.refresh_tokens
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.refresh_tokens WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.refresh_tokens: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.refresh_tokens: Table not accessible';
    END;
    
    -- Check auth.mfa_factors
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.mfa_factors WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.mfa_factors: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.mfa_factors: Table not accessible';
    END;
    
    -- Check auth.mfa_challenges
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.mfa_challenges WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.mfa_challenges: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.mfa_challenges: Table not accessible';
    END;
    
    -- Check auth.audit_log_entries
    BEGIN
        SELECT COUNT(*) INTO count_result FROM auth.audit_log_entries WHERE user_id = auth_user_id;
        RAISE NOTICE 'auth.audit_log_entries: % records', count_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'auth.audit_log_entries: Table not accessible';
    END;
    
    -- Check public.profiles
    SELECT COUNT(*) INTO count_result FROM public.profiles WHERE email = user_email;
    RAISE NOTICE 'public.profiles: % records', count_result;
    
    RAISE NOTICE '=== AUTH CHECK COMPLETED ===';
    
END $$;
