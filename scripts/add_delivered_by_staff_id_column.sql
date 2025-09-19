-- Add delivered_by_staff_id column to orders table
-- This column was missing, causing the "Could not find column" error

-- Check if the column already exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'delivered_by_staff_id';

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivered_by_staff_id'
    ) THEN
        ALTER TABLE public.orders
        ADD COLUMN delivered_by_staff_id uuid NULL;
        
        RAISE NOTICE 'Column delivered_by_staff_id added to orders table';
    ELSE
        RAISE NOTICE 'Column delivered_by_staff_id already exists in orders table';
    END IF;
END $$;

-- Add foreign key constraint to cafe_staff table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_delivered_by_staff_id_fkey'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT orders_delivered_by_staff_id_fkey
        FOREIGN KEY (delivered_by_staff_id) REFERENCES public.cafe_staff(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Foreign key constraint added for delivered_by_staff_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists for delivered_by_staff_id';
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_orders_delivered_by_staff_id 
ON public.orders (delivered_by_staff_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'delivered_by_staff_id';

SELECT 
    'delivered_by_staff_id column added successfully' as status,
    'You can now assign staff to orders' as message;
