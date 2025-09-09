-- Update Chatkara cafe with menu PDF URL
UPDATE public.cafes 
SET menu_pdf_url = '/chatkaramenu.pdf'
WHERE name ILIKE '%chatkara%';

-- Verify the update
SELECT id, name, menu_pdf_url, accepting_orders 
FROM public.cafes 
WHERE name ILIKE '%chatkara%';
