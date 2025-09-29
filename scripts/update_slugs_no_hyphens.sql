-- Update existing slugs to remove hyphens and combine words
-- This will regenerate all slugs with the new format

-- Update the slug generation function
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s]', '', 'g'),
            '\s+', '', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Regenerate all slugs with the new format
UPDATE public.cafes 
SET slug = generate_slug(name)
WHERE slug IS NOT NULL;

-- Show the updated slugs
SELECT 
    name,
    slug,
    CASE 
        WHEN slug IS NULL THEN '❌ NO SLUG'
        WHEN slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '', 'g')) THEN '✅ CORRECT'
        ELSE '⚠️ DIFFERENT'
    END as slug_status
FROM public.cafes 
ORDER BY name;








