-- Set Banna's Chowki cafe priority to 1 (highest priority)
UPDATE public.cafes 
SET 
    priority = 1,
    updated_at = NOW()
WHERE LOWER(name) LIKE '%banna%chowki%' OR slug = 'bannas-chowki';

-- Verify the update
SELECT 
    id,
    name,
    slug,
    priority,
    updated_at
FROM public.cafes 
WHERE LOWER(name) LIKE '%banna%chowki%' OR slug = 'bannas-chowki';

SELECT '✅ Banna''s Chowki priority set to 1 successfully!' as status;

