-- 🚨 FIX USER DELETION ISSUES IN SUPABASE
-- This script addresses common problems preventing user deletion

-- Step 1: Check current RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 2: Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'profiles' OR ccu.table_name = 'profiles');

-- Step 3: Check if there are any triggers on profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Step 4: Create a safe user deletion function
CREATE OR REPLACE FUNCTION safe_delete_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_exists BOOLEAN;
    orders_count INTEGER;
    notifications_count INTEGER;
BEGIN
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Count related records
    SELECT COUNT(*) INTO orders_count FROM orders WHERE user_id = user_id;
    SELECT COUNT(*) INTO notifications_count FROM order_notifications WHERE user_id = user_id;
    
    RAISE NOTICE 'Found % orders and % notifications for user %', orders_count, notifications_count, user_id;
    
    -- Delete related records first (if they exist)
    -- Delete notifications
    DELETE FROM order_notifications WHERE user_id = user_id;
    RAISE NOTICE 'Deleted notifications for user %', user_id;
    
    -- Delete orders
    DELETE FROM orders WHERE user_id = user_id;
    RAISE NOTICE 'Deleted orders for user %', user_id;
    
    -- Delete from cafe_staff if exists
    DELETE FROM cafe_staff WHERE user_id = user_id;
    RAISE NOTICE 'Deleted cafe_staff records for user %', user_id;
    
    -- Delete profile
    DELETE FROM profiles WHERE id = user_id;
    RAISE NOTICE 'Deleted profile for user %', user_id;
    
    -- Finally, delete the auth user (this will be handled by Supabase)
    -- Note: This function only handles database cleanup
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting user: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- Step 5: Grant necessary permissions
GRANT EXECUTE ON FUNCTION safe_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_delete_user(UUID) TO service_role;

-- Step 6: Create a user deletion trigger (optional - for logging)
CREATE TABLE IF NOT EXISTS user_deletion_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by UUID,
    success BOOLEAN,
    error_message TEXT
);

-- Step 7: Test the function with a sample user (replace with actual user ID)
-- SELECT safe_delete_user('your-user-id-here');

-- Step 8: Check current user count
SELECT COUNT(*) as total_users FROM profiles;

-- Step 9: Show users that might have related data
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.user_type,
    COUNT(o.id) as order_count,
    COUNT(on.id) as notification_count
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
LEFT JOIN order_notifications on ON p.id = on.user_id
GROUP BY p.id, p.email, p.full_name, p.user_type
HAVING COUNT(o.id) > 0 OR COUNT(on.id) > 0
ORDER BY order_count DESC, notification_count DESC;

-- Step 10: Manual cleanup for specific user (replace user_id)
-- BEGIN;
--     -- Delete notifications
--     DELETE FROM order_notifications WHERE user_id = 'your-user-id-here';
--     
--     -- Delete orders
--     DELETE FROM orders WHERE user_id = 'your-user-id-here';
--     
--     -- Delete cafe_staff records
--     DELETE FROM cafe_staff WHERE user_id = 'your-user-id-here';
--     
--     -- Delete profile
--     DELETE FROM profiles WHERE id = 'your-user-id-here';
--     
--     -- If successful, commit
--     COMMIT;
-- EXCEPTION
--     WHEN OTHERS THEN
--         ROLLBACK;
--         RAISE EXCEPTION 'Error during cleanup: %', SQLERRM;
-- END;
