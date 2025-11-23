-- Create saved_addresses table for storing user delivery addresses
-- This allows users to save multiple addresses (Home, Work, etc.) like Swiggy

CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Address identification
  label VARCHAR(50) NOT NULL, -- 'Home', 'Work', 'Other', custom name
  address_type VARCHAR(20) DEFAULT 'other', -- 'home', 'work', 'other'
  
  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Address components
  flat_number VARCHAR(100), -- Room/Flat/Door No.
  building_name VARCHAR(200) NOT NULL, -- Building/PG/Hostel Name
  landmark VARCHAR(200), -- Nearby landmark
  complete_address TEXT NOT NULL, -- Full formatted address from Google
  
  -- Metadata
  is_default BOOLEAN DEFAULT false, -- User's default address
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_address_type CHECK (address_type IN ('home', 'work', 'other'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_active ON public.saved_addresses(user_id, is_active);

-- RLS Policies
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own addresses
CREATE POLICY "users_view_own_addresses" ON public.saved_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "users_insert_own_addresses" ON public.saved_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "users_update_own_addresses" ON public.saved_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "users_delete_own_addresses" ON public.saved_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER saved_addresses_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_addresses_updated_at();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Set all other addresses for this user to non-default
    UPDATE public.saved_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default address
CREATE TRIGGER saved_addresses_default_check
  BEFORE INSERT OR UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_addresses TO authenticated;
GRANT SELECT ON public.saved_addresses TO anon;

-- Verify the table was created
SELECT 
  'saved_addresses table created successfully!' as status,
  COUNT(*) as total_addresses
FROM public.saved_addresses;

