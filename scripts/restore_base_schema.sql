-- Restore base database schema
-- Run this in Supabase Dashboard → SQL Editor

-- Create enum types for better data integrity
CREATE TYPE block_type AS ENUM ('B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7');
CREATE TYPE order_status AS ENUM ('received', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled');
CREATE TYPE loyalty_tier AS ENUM ('foodie', 'gourmet', 'connoisseur');

-- Create profiles table for students
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  block block_type NOT NULL,
  phone TEXT,
  qr_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier loyalty_tier NOT NULL DEFAULT 'foodie',
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cafes table
CREATE TABLE public.cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(8,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'received',
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_block block_type NOT NULL,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  points_earned INTEGER NOT NULL DEFAULT 0,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,
  total_price DECIMAL(8,2) NOT NULL,
  special_instructions TEXT
);

-- Create loyalty transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'redeemed', 'bonus'
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT 'BASE SCHEMA RESTORED' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
