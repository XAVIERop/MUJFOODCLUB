-- Add Tuesday Non-Veg Disabled setting to cafes table
-- This allows Banna's Chowki to enable/disable the Tuesday non-veg restriction

-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cafes' AND column_name = 'tuesday_nonveg_disabled'
    ) THEN
        ALTER TABLE public.cafes ADD COLUMN tuesday_nonveg_disabled BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN public.cafes.tuesday_nonveg_disabled IS 'When true, non-veg items are automatically marked as out of stock on Tuesdays. Only applicable for cafes that serve both veg and non-veg items.';

-- Set default to false for all cafes (non-veg available by default)
UPDATE public.cafes 
SET tuesday_nonveg_disabled = COALESCE(tuesday_nonveg_disabled, false)
WHERE tuesday_nonveg_disabled IS NULL;

