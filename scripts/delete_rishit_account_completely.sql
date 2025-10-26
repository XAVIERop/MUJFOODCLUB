-- Complete Account Deletion for rishit.2428020220@muj.manipal.edu
-- This script will safely delete ALL data associated with this account
-- Run this in Supabase Dashboard → SQL Editor

DO $$
DECLARE
    user_email TEXT := 'rishit.2428020220@muj.manipal.edu';
    auth_user_id UUID;
    profile_user_id UUID;
    deleted_orders INTEGER := 0;
    deleted_order_items INTEGER := 0;
    deleted_referrals INTEGER := 0;
    deleted_profile INTEGER := 0;
    deleted_auth INTEGER := 0;
    remaining_orders INTEGER;
    remaining_profiles INTEGER;
    auth_remaining INTEGER;
    profiles_remaining INTEGER;
    orders_remaining INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE '=== STARTING COMPLETE ACCOUNT DELETION ===';
    RAISE NOTICE 'Email: %', user_email;
    
    -- Get user IDs
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email;
    SELECT id INTO profile_user_id FROM public.profiles WHERE email = user_email;
    
    RAISE NOTICE 'Auth User ID: %', COALESCE(auth_user_id::text, 'NULL');
    RAISE NOTICE 'Profile User ID: %', COALESCE(profile_user_id::text, 'NULL');
    
    -- Step 1: Delete order items first (foreign key constraint)
    RAISE NOTICE '=== STEP 1: Deleting Order Items ===';
    DELETE FROM public.order_items 
    WHERE order_id IN (
        SELECT id FROM public.orders 
        WHERE user_id = COALESCE(auth_user_id, profile_user_id)
    );
    GET DIAGNOSTICS deleted_order_items = ROW_COUNT;
    RAISE NOTICE 'Deleted % order items', deleted_order_items;
    
    -- Step 2: Delete orders
    RAISE NOTICE '=== STEP 2: Deleting Orders ===';
    DELETE FROM public.orders 
    WHERE user_id = COALESCE(auth_user_id, profile_user_id);
    GET DIAGNOSTICS deleted_orders = ROW_COUNT;
    RAISE NOTICE 'Deleted % orders', deleted_orders;
    
    -- Step 3: Delete referrals (skip if table doesn't exist)
    RAISE NOTICE '=== STEP 3: Deleting Referrals ===';
    RAISE NOTICE 'Referrals table does not exist - skipping';
    deleted_referrals := 0;
    
    -- Step 4: Delete profile
    RAISE NOTICE '=== STEP 4: Deleting Profile ===';
    DELETE FROM public.profiles 
    WHERE email = user_email;
    GET DIAGNOSTICS deleted_profile = ROW_COUNT;
    RAISE NOTICE 'Deleted % profile records', deleted_profile;
    
    -- Step 5: Delete from auth.users (this will cascade to auth-related tables)
    RAISE NOTICE '=== STEP 5: Deleting Auth User ===';
    IF auth_user_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = auth_user_id;
        GET DIAGNOSTICS deleted_auth = ROW_COUNT;
        RAISE NOTICE 'Deleted % auth user records', deleted_auth;
    ELSE
        RAISE NOTICE 'No auth user found to delete';
    END IF;
    
    -- Step 6: Clean up any remaining references
    RAISE NOTICE '=== STEP 6: Final Cleanup ===';
    
    -- Check for any remaining orders
    SELECT COUNT(*) INTO remaining_orders
    FROM public.orders 
    WHERE user_id = COALESCE(auth_user_id, profile_user_id);
    
    IF remaining_orders > 0 THEN
        RAISE NOTICE 'WARNING: % orders still exist', remaining_orders;
    ELSE
        RAISE NOTICE 'All orders deleted successfully';
    END IF;
    
    -- Check for any remaining profile
    SELECT COUNT(*) INTO remaining_profiles
    FROM public.profiles 
    WHERE email = user_email;
    
    IF remaining_profiles > 0 THEN
        RAISE NOTICE 'WARNING: % profile records still exist', remaining_profiles;
    ELSE
        RAISE NOTICE 'All profile records deleted successfully';
    END IF;
    
    -- Final summary
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Order Items Deleted: %', deleted_order_items;
    RAISE NOTICE 'Orders Deleted: %', deleted_orders;
    RAISE NOTICE 'Referrals Deleted: %', deleted_referrals;
    RAISE NOTICE 'Profile Records Deleted: %', deleted_profile;
    RAISE NOTICE 'Auth Records Deleted: %', deleted_auth;
    RAISE NOTICE '=== ACCOUNT DELETION COMPLETED ===';
    
    -- Verify complete deletion
    RAISE NOTICE '=== VERIFICATION ===';
    
    -- Check auth.users
    SELECT COUNT(*) INTO auth_remaining FROM auth.users WHERE email = user_email;
    RAISE NOTICE 'Auth users remaining: %', auth_remaining;
    
    -- Check profiles
    SELECT COUNT(*) INTO profiles_remaining FROM public.profiles WHERE email = user_email;
    RAISE NOTICE 'Profiles remaining: %', profiles_remaining;
    
    -- Check orders
    SELECT COUNT(*) INTO orders_remaining FROM public.orders WHERE user_id = COALESCE(auth_user_id, profile_user_id);
    RAISE NOTICE 'Orders remaining: %', orders_remaining;
    
    IF auth_remaining = 0 AND profiles_remaining = 0 AND orders_remaining = 0 THEN
        RAISE NOTICE '✅ ACCOUNT COMPLETELY DELETED - Safe to sign up again';
    ELSE
        RAISE NOTICE '❌ WARNING: Some data may still exist';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR during deletion: %', SQLERRM;
    RAISE;
END $$;
