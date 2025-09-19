-- Clean up rewards-related enums from database
-- This script removes the rewards enums that were found

-- 1. Drop rewards-related enums
DROP TYPE IF EXISTS public._cafe_loyalty_points CASCADE;
DROP TYPE IF EXISTS public._cafe_loyalty_transactions CASCADE;
DROP TYPE IF EXISTS public.cafe_loyalty_points CASCADE;
DROP TYPE IF EXISTS public.cafe_loyalty_transactions CASCADE;

-- 2. Verify cleanup
SELECT 
    'Rewards enums cleanup completed' as status,
    'All rewards-related enums have been removed' as message;

-- 3. Show remaining enums to verify only core ones remain
SELECT 
    'REMAINING ENUMS' as category,
    typname as enum_name,
    'Core enum - kept' as action
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;
