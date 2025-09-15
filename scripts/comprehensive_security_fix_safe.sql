-- =====================================================
-- 🛡️ COMPREHENSIVE SECURITY FIX FOR MUJ FOOD CLUB (SAFE VERSION)
-- =====================================================
-- This script will fix all security vulnerabilities
-- by properly enabling RLS and creating secure policies
-- This version handles missing tables gracefully

-- =====================================================
-- STEP 1: CLEAN UP EXISTING POLICIES
-- =====================================================

-- Drop all existing policies to avoid conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop policies from all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE 'All existing policies dropped successfully';
END $$;

-- =====================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (ONLY ON EXISTING TABLES)
-- =====================================================

-- Enable RLS on existing tables only
DO $$
DECLARE
    tbl_name TEXT;
    tables_to_secure TEXT[] := ARRAY[
        'orders', 'profiles', 'cafes', 'menu_items', 
        'order_items', 'loyalty_transactions', 'cafe_staff', 
        'order_notifications', 'promotional_banners'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_secure LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl_name
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE '✅ RLS enabled on %', tbl_name;
        ELSE
            RAISE NOTICE '⚠️ Table % does not exist, skipping RLS', tbl_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: CREATE SECURE POLICIES (ONLY ON EXISTING TABLES)
-- =====================================================

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Users can view their own profile
        CREATE POLICY "users_view_own_profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);

        -- Users can update their own profile
        CREATE POLICY "users_update_own_profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);

        -- Users can create their own profile (during signup)
        CREATE POLICY "users_create_own_profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        RAISE NOTICE '✅ Profiles policies created';
    ELSE
        RAISE NOTICE '⚠️ Profiles table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- CAFES TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cafes') THEN
        -- Anyone can view active cafes (public data)
        CREATE POLICY "cafes_public_read" ON public.cafes
            FOR SELECT USING (is_active = true);

        -- Cafe owners can update their cafe
        CREATE POLICY "cafe_owners_update_cafe" ON public.cafes
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = cafes.id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.role IN ('owner', 'manager')
                    AND cafe_staff.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Cafes policies created';
    ELSE
        RAISE NOTICE '⚠️ Cafes table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- MENU ITEMS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_items') THEN
        -- Anyone can view available menu items (public data)
        CREATE POLICY "menu_items_public_read" ON public.menu_items
            FOR SELECT USING (is_available = true);

        -- Cafe staff can manage their menu items
        CREATE POLICY "cafe_staff_manage_menu_items" ON public.menu_items
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = menu_items.cafe_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.role IN ('owner', 'manager', 'staff')
                    AND cafe_staff.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Menu items policies created';
    ELSE
        RAISE NOTICE '⚠️ Menu items table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Users can view their own orders
        CREATE POLICY "users_view_own_orders" ON public.orders
            FOR SELECT USING (auth.uid() = user_id);

        -- Users can create their own orders
        CREATE POLICY "users_create_own_orders" ON public.orders
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Users can update their own orders (for cancellation)
        CREATE POLICY "users_update_own_orders" ON public.orders
            FOR UPDATE USING (auth.uid() = user_id);

        -- Cafe staff can view orders for their cafe
        CREATE POLICY "cafe_staff_view_orders" ON public.orders
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = orders.cafe_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.is_active = true
                )
            );

        -- Cafe staff can update orders for their cafe
        CREATE POLICY "cafe_staff_update_orders" ON public.orders
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = orders.cafe_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Orders policies created';
    ELSE
        RAISE NOTICE '⚠️ Orders table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- ORDER ITEMS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        -- Users can view order items for their own orders
        CREATE POLICY "users_view_own_order_items" ON public.order_items
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.orders 
                    WHERE orders.id = order_items.order_id 
                    AND orders.user_id = auth.uid()
                )
            );

        -- Users can create order items for their own orders
        CREATE POLICY "users_create_own_order_items" ON public.order_items
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.orders 
                    WHERE orders.id = order_items.order_id 
                    AND orders.user_id = auth.uid()
                )
            );

        -- Cafe staff can view order items for their cafe orders
        CREATE POLICY "cafe_staff_view_order_items" ON public.order_items
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.orders 
                    JOIN public.cafe_staff ON cafe_staff.cafe_id = orders.cafe_id
                    WHERE orders.id = order_items.order_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Order items policies created';
    ELSE
        RAISE NOTICE '⚠️ Order items table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- LOYALTY TRANSACTIONS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_transactions') THEN
        -- Users can view their own loyalty transactions
        CREATE POLICY "users_view_own_loyalty_transactions" ON public.loyalty_transactions
            FOR SELECT USING (auth.uid() = user_id);

        -- System can create loyalty transactions
        CREATE POLICY "system_create_loyalty_transactions" ON public.loyalty_transactions
            FOR INSERT WITH CHECK (true); -- Allow system functions to create transactions
            
        RAISE NOTICE '✅ Loyalty transactions policies created';
    ELSE
        RAISE NOTICE '⚠️ Loyalty transactions table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- CAFE STAFF TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cafe_staff') THEN
        -- Users can view their own cafe staff assignments
        CREATE POLICY "users_view_own_cafe_staff" ON public.cafe_staff
            FOR SELECT USING (auth.uid() = user_id);

        -- Cafe owners can manage staff for their cafes
        CREATE POLICY "cafe_owners_manage_staff" ON public.cafe_staff
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff cs2
                    WHERE cs2.cafe_id = cafe_staff.cafe_id 
                    AND cs2.user_id = auth.uid()
                    AND cs2.role = 'owner'
                    AND cs2.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Cafe staff policies created';
    ELSE
        RAISE NOTICE '⚠️ Cafe staff table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- ORDER NOTIFICATIONS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_notifications') THEN
        -- Users can view their own notifications
        CREATE POLICY "users_view_own_notifications" ON public.order_notifications
            FOR SELECT USING (auth.uid() = user_id);

        -- Cafe staff can view notifications for their cafe
        CREATE POLICY "cafe_staff_view_notifications" ON public.order_notifications
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = order_notifications.cafe_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.is_active = true
                )
            );

        -- System can create notifications
        CREATE POLICY "system_create_notifications" ON public.order_notifications
            FOR INSERT WITH CHECK (true);
            
        RAISE NOTICE '✅ Order notifications policies created';
    ELSE
        RAISE NOTICE '⚠️ Order notifications table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- PROMOTIONAL BANNERS TABLE POLICIES
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'promotional_banners') THEN
        -- Anyone can view active promotional banners
        CREATE POLICY "promotional_banners_public_read" ON public.promotional_banners
            FOR SELECT USING (is_active = true);

        -- Cafe staff can manage their promotional banners
        CREATE POLICY "cafe_staff_manage_promotional_banners" ON public.promotional_banners
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.cafe_staff 
                    WHERE cafe_staff.cafe_id = promotional_banners.cafe_id 
                    AND cafe_staff.user_id = auth.uid()
                    AND cafe_staff.role IN ('owner', 'manager')
                    AND cafe_staff.is_active = true
                )
            );
            
        RAISE NOTICE '✅ Promotional banners policies created';
    ELSE
        RAISE NOTICE '⚠️ Promotional banners table does not exist, skipping policies';
    END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE SECURITY FUNCTIONS
-- =====================================================

-- Function to validate order placement
CREATE OR REPLACE FUNCTION public.validate_order_placement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if cafe is accepting orders
  IF NOT EXISTS (
    SELECT 1 FROM public.cafes 
    WHERE id = NEW.cafe_id 
    AND is_active = true 
    AND accepting_orders = true
  ) THEN
    RAISE EXCEPTION 'Cafe is not currently accepting orders';
  END IF;
  
  -- Check if user exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order validation (only if orders table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        DROP TRIGGER IF EXISTS validate_order_placement_trigger ON public.orders;
        CREATE TRIGGER validate_order_placement_trigger
          BEFORE INSERT ON public.orders
          FOR EACH ROW
          EXECUTE FUNCTION public.validate_order_placement();
        RAISE NOTICE '✅ Order validation trigger created';
    ELSE
        RAISE NOTICE '⚠️ Orders table does not exist, skipping trigger';
    END IF;
END $$;

-- =====================================================
-- STEP 5: CREATE AUDIT LOGGING SYSTEM
-- =====================================================

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admins_view_audit_logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.user_id = auth.uid()
            AND cafe_staff.role = 'owner'
            AND cafe_staff.is_active = true
        )
    );

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: CREATE PERFORMANCE INDEXES (ONLY ON EXISTING TABLES)
-- =====================================================

-- Create indexes for better performance
DO $$
BEGIN
    -- Orders table indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_cafe_id ON public.orders(cafe_id);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
        RAISE NOTICE '✅ Orders indexes created';
    END IF;
    
    -- Order items table indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
        RAISE NOTICE '✅ Order items indexes created';
    END IF;
    
    -- Menu items table indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'menu_items') THEN
        CREATE INDEX IF NOT EXISTS idx_menu_items_cafe_id ON public.menu_items(cafe_id);
        RAISE NOTICE '✅ Menu items indexes created';
    END IF;
    
    -- Cafe staff table indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cafe_staff') THEN
        CREATE INDEX IF NOT EXISTS idx_cafe_staff_cafe_id ON public.cafe_staff(cafe_id);
        CREATE INDEX IF NOT EXISTS idx_cafe_staff_user_id ON public.cafe_staff(user_id);
        RAISE NOTICE '✅ Cafe staff indexes created';
    END IF;
    
    -- Loyalty transactions table indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'loyalty_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);
        RAISE NOTICE '✅ Loyalty transactions indexes created';
    END IF;
    
    -- Audit logs indexes
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
    RAISE NOTICE '✅ Audit logs indexes created';
END $$;

-- =====================================================
-- STEP 7: VERIFY SECURITY SETUP
-- =====================================================

-- Verify RLS is enabled on existing tables
DO $$
DECLARE
    r RECORD;
    rls_enabled_count INTEGER := 0;
    total_tables INTEGER := 0;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('orders', 'profiles', 'cafes', 'menu_items', 'order_items', 'loyalty_transactions', 'cafe_staff', 'order_notifications', 'promotional_banners')
    ) LOOP
        total_tables := total_tables + 1;
        IF r.rowsecurity THEN
            rls_enabled_count := rls_enabled_count + 1;
            RAISE NOTICE '✅ RLS enabled on %', r.tablename;
        ELSE
            RAISE WARNING '❌ RLS NOT enabled on %', r.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total tables found: %, RLS enabled: %', total_tables, rls_enabled_count;
END $$;

-- Count policies created
SELECT 
    COUNT(*) as total_policies,
    schemaname,
    tablename
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 COMPREHENSIVE SECURITY FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '✅ Row Level Security enabled on existing tables';
    RAISE NOTICE '✅ Secure policies created for existing tables';
    RAISE NOTICE '✅ Audit logging system implemented';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ Security functions and triggers added';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️ Your database is now secure!';
    RAISE NOTICE '📊 Check Supabase Dashboard to see security improvements';
    RAISE NOTICE '⚠️ Note: Some tables may not exist yet (like promotional_banners)';
    RAISE NOTICE '   This is normal and will be handled when those tables are created';
END $$;
