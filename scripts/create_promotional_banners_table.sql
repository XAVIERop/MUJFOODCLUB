-- =====================================================
-- 📢 CREATE PROMOTIONAL BANNERS TABLE
-- =====================================================
-- This script creates the promotional_banners table
-- that's referenced in the modern menu layout

-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID REFERENCES public.cafes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  discount TEXT, -- e.g., "20% OFF", "Buy 1 Get 1"
  image_url TEXT,
  button_text TEXT DEFAULT 'Order Now',
  button_action TEXT DEFAULT 'order', -- 'order', 'menu', 'cafe', 'external'
  button_url TEXT, -- for external actions
  background_color TEXT DEFAULT '#3B82F6',
  text_color TEXT DEFAULT '#FFFFFF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher numbers show first
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active promotional banners" ON public.promotional_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Cafe staff can manage their promotional banners" ON public.promotional_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cafe_staff 
      WHERE cafe_staff.cafe_id = promotional_banners.cafe_id 
      AND cafe_staff.user_id = auth.uid()
      AND cafe_staff.role IN ('owner', 'manager')
      AND cafe_staff.is_active = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotional_banners_cafe_id ON public.promotional_banners(cafe_id);
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active ON public.promotional_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_banners_priority ON public.promotional_banners(priority DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_promotional_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promotional_banners_updated_at
  BEFORE UPDATE ON public.promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_promotional_banners_updated_at();

-- Insert sample promotional banners
INSERT INTO public.promotional_banners (
  cafe_id, title, subtitle, description, discount, 
  button_text, background_color, text_color, priority
) VALUES 
(
  (SELECT id FROM public.cafes WHERE name = 'Chatkara' LIMIT 1),
  'Special Combo Offer',
  'Limited Time Only',
  'Get our signature combo with a refreshing drink',
  '15% OFF',
  'Order Now',
  '#FF6B6B',
  '#FFFFFF',
  100
),
(
  (SELECT id FROM public.cafes WHERE name = 'Food Court' LIMIT 1),
  'Weekend Special',
  'Every Weekend',
  'Enjoy our weekend special menu with amazing discounts',
  '20% OFF',
  'View Menu',
  '#4ECDC4',
  '#FFFFFF',
  90
),
(
  NULL, -- Generic banner for all cafes
  'Welcome to MUJ Food Club',
  'Your Campus Food Partner',
  'Order from your favorite cafes and earn rewards with every order',
  'Free Delivery',
  'Explore Cafes',
  '#45B7D1',
  '#FFFFFF',
  50
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Promotional banners table created successfully!';
    RAISE NOTICE '✅ Table structure created with proper constraints';
    RAISE NOTICE '✅ RLS policies applied';
    RAISE NOTICE '✅ Sample banners inserted';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '';
    RAISE NOTICE '📢 You can now manage promotional banners from the cafe dashboard';
END $$;