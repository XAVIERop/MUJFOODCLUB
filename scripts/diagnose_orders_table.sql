-- Diagnose Orders Table Structure
-- Run this script in your Supabase SQL Editor to see what's wrong

-- 1. Check if orders table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- 3. Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'orders';

-- 4. Check user permissions
SELECT 
    current_user,
    session_user,
    has_table_privilege('public.orders', 'SELECT') as can_select,
    has_table_privilege('public.orders', 'INSERT') as can_insert,
    has_table_privilege('public.orders', 'UPDATE') as can_update,
    has_table_privilege('public.orders', 'DELETE') as can_delete;

-- 5. Check if the specific columns needed for status updates exist
SELECT 
    column_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = c.column_name
        ) THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status
FROM (VALUES 
    ('status'),
    ('status_updated_at'),
    ('accepted_at'),
    ('preparing_at'),
    ('out_for_delivery_at'),
    ('completed_at'),
    ('points_credited')
) AS c(column_name);

-- 6. Show a sample order to see the current structure
SELECT 
    id,
    order_number,
    status,
    cafe_id,
    created_at
FROM public.orders 
LIMIT 1;
