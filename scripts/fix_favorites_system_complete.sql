-- Complete Fix for Favorites System
-- This script implements the exact working favorites system from the reference project

-- 1. Drop existing user_favorites table and recreate it properly
DROP TABLE IF EXISTS public.user_favorites CASCADE;

-- 2. Create user_favorites table with proper foreign keys
CREATE TABLE public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cafe_id)
);

-- 3. Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies and create proper ones
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- 5. Create proper RLS policies (exact copy from reference project)
CREATE POLICY "Users can view their own favorites" ON public.user_favorites 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.user_favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.user_favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create proper indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_cafe_id ON public.user_favorites(cafe_id);

-- 7. Grant permissions
GRANT ALL ON public.user_favorites TO authenticated;
GRANT SELECT ON public.user_favorites TO anon;

-- 8. Success message
DO $$
BEGIN
    RAISE NOTICE 'Favorites system completely fixed!';
    RAISE NOTICE 'Table: user_favorites recreated with proper foreign keys';
    RAISE NOTICE 'RLS policies updated to match reference project';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Permissions granted correctly';
END $$;
