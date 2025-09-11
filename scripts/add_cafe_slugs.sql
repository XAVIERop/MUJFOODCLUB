-- Add slug support for URL-friendly cafe names
-- This migration adds a slug field and generates URL-friendly slugs

-- 1. Add slug column to cafes table
ALTER TABLE public.cafes ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create function to generate URL-friendly slugs (combining words without hyphens)
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

-- 3. Generate slugs for existing cafes
UPDATE public.cafes 
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- 4. Add unique constraint on slug
ALTER TABLE public.cafes ADD CONSTRAINT unique_cafe_slug UNIQUE (slug);

-- 5. Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_cafes_slug ON public.cafes(slug);

-- 6. Create function to get cafe by slug
CREATE OR REPLACE FUNCTION get_cafe_by_slug(cafe_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    type TEXT,
    description TEXT,
    location TEXT,
    phone TEXT,
    hours TEXT,
    accepting_orders BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.type,
        c.description,
        c.location,
        c.phone,
        c.hours,
        c.accepting_orders,
        c.created_at,
        c.updated_at
    FROM public.cafes c
    WHERE c.slug = cafe_slug;
END;
$$ LANGUAGE plpgsql;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION get_cafe_by_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO authenticated;

-- 8. Test the slugs
SELECT name, slug FROM public.cafes ORDER BY name;
