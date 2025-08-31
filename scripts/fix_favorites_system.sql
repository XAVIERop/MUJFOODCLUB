-- Fix Favorites System
-- This script sets up the user_favorites table and RLS policies

-- 1. Create user_favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cafe_id) -- Prevent duplicate favorites
);

-- 2. Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert their own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Grant permissions
GRANT ALL ON public.user_favorites TO authenticated;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_cafe_id ON public.user_favorites(cafe_id);

-- 6. Success message
DO $$
BEGIN
    RAISE NOTICE 'Favorites system setup completed successfully!';
    RAISE NOTICE 'Table: user_favorites';
    RAISE NOTICE 'RLS policies created';
    RAISE NOTICE 'Indexes created';
END $$;
