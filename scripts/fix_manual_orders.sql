-- Fix Manual Orders System
-- This script adds the necessary columns and system user for manual orders

-- 1. Add columns to orders table for manual order support
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_manual_order BOOLEAN DEFAULT false;

-- 2. Update delivery_block to allow more flexible values for manual orders
-- Change from enum to text to allow "Counter", "Walk-in", etc.
ALTER TABLE public.orders 
ALTER COLUMN delivery_block TYPE TEXT;

-- 3. Create a system user for manual orders (if it doesn't exist)
-- First, create the auth user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'manual-orders@mujfoodclub.com',
  crypt('manual-orders-password', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 4. Create a system profile for manual orders (if it doesn't exist)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  student_id,
  block,
  phone,
  qr_code,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'manual-orders@mujfoodclub.com',
  'Manual Orders System',
  'MANUAL-001',
  'B1'::block_type,
  '0000000000',
  'MANUAL-ORDERS-QR',
  0,
  'foodie'::loyalty_tier,
  0,
  0.00,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Create coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create order_coupons table to track applied coupons
CREATE TABLE IF NOT EXISTS public.order_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, coupon_id)
);

-- 7. Enable RLS for new tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_coupons ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for coupons
CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Cafe staff can manage coupons" ON public.coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cafe_staff cs 
      WHERE cs.user_id = auth.uid() 
      AND cs.is_active = true
    )
  );

-- 9. Create RLS policies for order_coupons
CREATE POLICY "Cafe staff can view order coupons" ON public.order_coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
      WHERE o.id = order_coupons.order_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

CREATE POLICY "Cafe staff can insert order coupons" ON public.order_coupons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.cafe_staff cs ON cs.cafe_id = o.cafe_id
      WHERE o.id = order_coupons.order_id
      AND cs.user_id = auth.uid()
      AND cs.is_active = true
    )
  );

-- 10. Add some sample coupons
INSERT INTO public.coupons (code, name, description, discount_type, discount_value, min_order_amount, max_discount, is_active) VALUES
('WELCOME10', 'Welcome Discount', '10% off for new customers', 'percentage', 10, 100, 50, true),
('SAVE50', 'Fixed Discount', '₹50 off on orders above ₹200', 'fixed', 50, 200, 50, true),
('STUDENT15', 'Student Special', '15% off for students', 'percentage', 15, 150, 100, true)
ON CONFLICT (code) DO NOTHING;

-- Success message
SELECT 'Manual orders system setup completed successfully!' as status;
