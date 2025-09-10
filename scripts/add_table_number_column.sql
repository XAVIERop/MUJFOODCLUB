-- Quick fix: Add table_number column to orders table
-- Run this in Supabase SQL Editor

-- Step 1: Add table_number column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON public.orders(table_number);

-- Step 3: Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND table_schema = 'public' 
  AND column_name = 'table_number';

-- Step 4: Test insert (optional - you can remove this)
-- INSERT INTO public.orders (id, order_number, status, total_amount, delivery_block, table_number, user_id, cafe_id, points_earned, estimated_delivery, created_at, status_updated_at, points_credited, payment_method)
-- VALUES (gen_random_uuid(), 'TEST-001', 'received', 100, 'DINE_IN', '5', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 0, '2024-01-01 12:00:00', '2024-01-01 12:00:00', false, 'cod');
