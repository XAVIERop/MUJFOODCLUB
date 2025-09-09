-- Add menu_pdf_url column to cafes table if it doesn't exist
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS menu_pdf_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.cafes.menu_pdf_url IS 'URL to the cafe menu PDF file';

-- Update Havmor cafe with menu PDF URL
UPDATE public.cafes 
SET menu_pdf_url = '/havmormenu.pdf'
WHERE name = 'Havmor';

-- Verify the update
SELECT id, name, menu_pdf_url 
FROM public.cafes 
WHERE name = 'Havmor';
