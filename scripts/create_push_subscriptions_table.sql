-- Create push subscriptions table for browser push notifications
-- This table stores OneSignal player IDs and subscription details

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL UNIQUE, -- OneSignal player ID
  device_type TEXT, -- 'web', 'ios', 'android'
  browser TEXT, -- 'chrome', 'firefox', 'safari', etc.
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  preferences JSONB DEFAULT '{
    "order_received": true,
    "order_confirmed": true,
    "order_preparing": true,
    "order_on_the_way": true,
    "order_completed": true,
    "order_cancelled": true,
    "new_order_for_cafe": true
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_notification_sent_at TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_player_id ON public.push_subscriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view and manage their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Cafe staff can view subscriptions for their cafe's orders (for sending notifications)
-- This is handled through a function that checks cafe_staff relationship

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Function to get active push subscriptions for a user
CREATE OR REPLACE FUNCTION get_user_push_subscriptions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  player_id TEXT,
  device_type TEXT,
  browser TEXT,
  preferences JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.player_id,
    ps.device_type,
    ps.browser,
    ps.preferences,
    ps.is_active
  FROM public.push_subscriptions ps
  WHERE ps.user_id = p_user_id
    AND ps.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_push_subscriptions(UUID) TO authenticated;

-- Function to get active push subscriptions for cafe staff (for new order notifications)
CREATE OR REPLACE FUNCTION get_cafe_staff_push_subscriptions(p_cafe_id UUID)
RETURNS TABLE (
  id UUID,
  player_id TEXT,
  user_id UUID,
  preferences JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.player_id,
    ps.user_id,
    ps.preferences
  FROM public.push_subscriptions ps
  INNER JOIN public.cafe_staff cs ON cs.user_id = ps.user_id
  WHERE cs.cafe_id = p_cafe_id
    AND cs.is_active = true
    AND ps.is_active = true
    AND (ps.preferences->>'new_order_for_cafe')::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_cafe_staff_push_subscriptions(UUID) TO authenticated;

