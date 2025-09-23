-- Check for any triggers on auth.users table
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
