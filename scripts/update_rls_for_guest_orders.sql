-- Update RLS policy to allow guest orders for Banna's Chowki dine-in
-- Note: user_id column is already nullable, so we only need to update the RLS policy

-- Step 1: Drop existing INSERT policy that requires user_id
DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;

-- Step 2: Create new INSERT policy that allows both authenticated users and guest orders
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

-- Step 3: Verify the foreign key constraint allows NULL (it should if column is nullable)
-- If needed, update the foreign key constraint to ensure ON DELETE SET NULL
DO $$
BEGIN
  -- Check if foreign key constraint exists and update it if needed
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    -- Drop and recreate with ON DELETE SET NULL
    ALTER TABLE public.orders 
    DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
    
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Foreign key constraint updated to allow NULL values';
  ELSE
    RAISE NOTICE 'Foreign key constraint does not exist, creating it';
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Step 4: Add a comment to document this change
COMMENT ON COLUMN public.orders.user_id IS 'User ID for logged-in users. NULL for guest orders (Banna''s Chowki dine-in only).';

-- Step 5: Verify the changes
SELECT 
  'RLS Policy Updated' as status,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname = 'users_create_own_orders';

SELECT 
  'Column Status' as status,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'user_id'
AND table_schema = 'public';

