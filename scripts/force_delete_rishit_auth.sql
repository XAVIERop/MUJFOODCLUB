-- Force Delete Rishit Account from ALL Auth Tables
-- This script will completely remove the account from all authentication systems
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    user_email TEXT := 'rishit.2428020220@muj.manipal.edu';
    auth_user_id UUID;
    profile_user_id UUID;
    deleted_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== FORCE DELETING AUTH ACCOUNT ===';
    RAISE NOTICE 'Email: %', user_email;
    
    -- Get user IDs
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    SELECT id INTO profile_user_id FROM public.profiles WHERE email = user_email;
    
    RAISE NOTICE 'Auth User ID: %', COALESCE(auth_user_id::text, 'NULL');
    RAISE NOTICE 'Profile User ID: %', COALESCE(profile_user_id::text, 'NULL');
    
    -- Step 1: Delete from auth.identities (if exists)
    RAISE NOTICE '=== STEP 1: Deleting Auth Identities ===';
    BEGIN
        DELETE FROM auth.identities WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % identity records', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Identities table not accessible or does not exist';
    END;
    
    -- Step 2: Delete from auth.sessions (if exists)
    RAISE NOTICE '=== STEP 2: Deleting Auth Sessions ===';
    BEGIN
        DELETE FROM auth.sessions WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % session records', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Sessions table not accessible or does not exist';
    END;
    
    -- Step 3: Delete from auth.refresh_tokens (if exists)
    RAISE NOTICE '=== STEP 3: Deleting Refresh Tokens ===';
    BEGIN
        DELETE FROM auth.refresh_tokens WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % refresh token records', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Refresh tokens table not accessible or does not exist';
    END;
    
    -- Step 4: Delete from auth.mfa_factors (if exists)
    RAISE NOTICE '=== STEP 4: Deleting MFA Factors ===';
    BEGIN
        DELETE FROM auth.mfa_factors WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % MFA factor records', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'MFA factors table not accessible or does not exist';
    END;
    
    -- Step 5: Delete from auth.mfa_challenges (if exists)
    RAISE NOTICE '=== STEP 5: Deleting MFA Challenges ===';
    BEGIN
        DELETE FROM auth.mfa_challenges WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % MFA challenge records', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'MFA challenges table not accessible or does not exist';
    END;
    
    -- Step 6: Delete from auth.audit_log_entries (if exists)
    RAISE NOTICE '=== STEP 6: Deleting Audit Log Entries ===';
    BEGIN
        DELETE FROM auth.audit_log_entries WHERE user_id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % audit log entries', deleted_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Audit log entries table not accessible or does not exist';
    END;
    
    -- Step 7: Delete from public.profiles
    RAISE NOTICE '=== STEP 7: Deleting Profile ===';
    DELETE FROM public.profiles WHERE email = user_email;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % profile records', deleted_count;
    
    -- Step 8: Delete from auth.users (this should be last)
    RAISE NOTICE '=== STEP 8: Deleting Auth User ===';
    IF auth_user_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = auth_user_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % auth user records', deleted_count;
    ELSE
        RAISE NOTICE 'No auth user found to delete';
    END IF;
    
    -- Final verification
    RAISE NOTICE '=== FINAL VERIFICATION ===';
    
    -- Check auth.users
    SELECT COUNT(*) INTO deleted_count FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'Auth users remaining: %', deleted_count;
    
    -- Check profiles
    SELECT COUNT(*) INTO deleted_count FROM public.profiles WHERE email = user_email;
    RAISE NOTICE 'Profiles remaining: %', deleted_count;
    
    IF deleted_count = 0 THEN
        RAISE NOTICE '✅ AUTH ACCOUNT COMPLETELY DELETED';
        RAISE NOTICE '✅ Safe to sign up again with this email';
    ELSE
        RAISE NOTICE '❌ WARNING: Some auth data may still exist';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR during auth deletion: %', SQLERRM;
    RAISE;
END $$;
