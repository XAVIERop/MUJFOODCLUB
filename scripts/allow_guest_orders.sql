-- Allow guest orders for Banna's Chowki dine-in
-- This migration makes user_id nullable in the orders table to support guest ordering

-- Step 1: Drop the NOT NULL constraint on user_id
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Update the foreign key constraint to allow NULL values
-- First, drop the existing foreign key constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Recreate the foreign key constraint with ON DELETE SET NULL for guest orders
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Step 3: Ensure customer_name and phone_number are required for guest orders
-- (They should already exist, but let's verify they're not null when user_id is null)
-- We'll handle this in application logic, but we can add a check constraint if needed

-- Step 4: Add a comment to document this change
COMMENT ON COLUMN public.orders.user_id IS 'User ID for logged-in users. NULL for guest orders (Banna''s Chowki dine-in only).';

-- Step 5: Update RLS policies to allow guest orders (user_id IS NULL)
-- Drop existing INSERT policy that requires user_id
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Create new INSERT policy that allows both authenticated users and guest orders
-- This policy allows:
-- 1. Authenticated users to create orders with their own user_id
-- 2. Anyone (including unauthenticated) to create guest orders (user_id IS NULL)
CREATE POLICY "users_create_own_orders" ON public.orders
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (
    -- Allow if user is authenticated and user_id matches
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Allow guest orders (user_id IS NULL) - for both authenticated and unauthenticated users
    -- This enables Banna's Chowki dine-in guest ordering
    (user_id IS NULL)
  );

-- Note: Cafe staff policies should already allow viewing all orders for their cafe,
-- including guest orders (user_id IS NULL), so we don't need to modify those.

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'user_id'
AND table_schema = 'public';

