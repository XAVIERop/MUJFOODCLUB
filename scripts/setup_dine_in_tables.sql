-- Simple SQL script to set up dine-in tables
-- Run this in Supabase SQL Editor

-- Step 1: Add DINE_IN to block_type enum
ALTER TYPE block_type ADD VALUE 'DINE_IN';

-- Step 2: Create cafe_tables table
CREATE TABLE IF NOT EXISTS public.cafe_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL DEFAULT 'QR_' || gen_random_uuid()::text,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cafe_id, table_number)
);

-- Step 3: Add table_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.cafe_tables(id);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_cafe_tables_cafe_id ON public.cafe_tables(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cafe_tables_qr_code ON public.cafe_tables(qr_code);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);

-- Step 5: Enable RLS
ALTER TABLE public.cafe_tables ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY IF NOT EXISTS "Anyone can view cafe tables" ON public.cafe_tables
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Cafe owners can manage their tables" ON public.cafe_tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.cafe_id = cafe_tables.cafe_id
      AND profiles.user_type IN ('cafe_owner', 'cafe_staff')
    )
  );

-- Step 7: Insert tables for Cook House (12 tables)
INSERT INTO public.cafe_tables (cafe_id, table_number) 
SELECT 
  c.id as cafe_id,
  'Table ' || generate_series(1, 12) as table_number
FROM public.cafes c
WHERE c.is_active = true AND LOWER(c.name) LIKE '%cook house%';

-- Step 8: Insert tables for Food Court (8 tables)
INSERT INTO public.cafe_tables (cafe_id, table_number) 
SELECT 
  c.id as cafe_id,
  'Table ' || generate_series(1, 8) as table_number
FROM public.cafes c
WHERE c.is_active = true AND LOWER(c.name) LIKE '%food court%';

-- Step 9: Insert tables for all other cafes (5 tables each)
INSERT INTO public.cafe_tables (cafe_id, table_number) 
SELECT 
  c.id as cafe_id,
  'Table ' || generate_series(1, 5) as table_number
FROM public.cafes c
WHERE c.is_active = true 
  AND LOWER(c.name) NOT LIKE '%cook house%' 
  AND LOWER(c.name) NOT LIKE '%food court%';

-- Step 10: Verify the setup
SELECT 
  'Dine In system setup complete' as status,
  COUNT(*) as total_tables_created
FROM public.cafe_tables;

-- Step 11: Show table distribution
SELECT 
  c.name as cafe_name,
  COUNT(ct.id) as table_count
FROM public.cafes c
LEFT JOIN public.cafe_tables ct ON c.id = ct.cafe_id
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;
