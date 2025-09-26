-- Enhanced Cancellation Schema
-- Adds fields for better cancellation tracking and auto-cancellation

-- Add new columns to orders table for cancellation tracking
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id);

-- Create index for auto-cancellation queries
CREATE INDEX IF NOT EXISTS idx_orders_received_status_created_at 
ON public.orders (status, created_at) 
WHERE status = 'received';

-- Create function for auto-cancellation (10-minute rule)
CREATE OR REPLACE FUNCTION public.auto_cancel_old_orders()
RETURNS INTEGER AS $$
DECLARE
    cancelled_count INTEGER := 0;
BEGIN
    -- Cancel orders that have been in 'received' status for more than 10 minutes
    UPDATE public.orders 
    SET 
        status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = 'Auto-cancelled: Order not confirmed within 10 minutes',
        status_updated_at = now()
    WHERE 
        status = 'received' 
        AND created_at < (now() - INTERVAL '10 minutes');
    
    GET DIAGNOSTICS cancelled_count = ROW_COUNT;
    
    -- Create notifications for auto-cancelled orders
    INSERT INTO public.order_notifications (
        order_id,
        cafe_id,
        user_id,
        notification_type,
        message
    )
    SELECT 
        o.id,
        o.cafe_id,
        o.user_id,
        'order_cancelled',
        'Order #' || o.order_number || ' was automatically cancelled due to no confirmation within 10 minutes.'
    FROM public.orders o
    WHERE 
        o.status = 'cancelled' 
        AND o.cancelled_at > (now() - INTERVAL '1 minute')
        AND o.cancellation_reason = 'Auto-cancelled: Order not confirmed within 10 minutes';
    
    RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle manual cancellation with reason
CREATE OR REPLACE FUNCTION public.cancel_order_with_reason(
    p_order_id UUID,
    p_cancelled_by UUID,
    p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if order can be cancelled (not completed or already cancelled)
    IF NOT EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = p_order_id 
        AND status NOT IN ('completed', 'cancelled')
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Update order status
    UPDATE public.orders 
    SET 
        status = 'cancelled',
        cancelled_at = now(),
        cancellation_reason = p_cancellation_reason,
        cancelled_by = p_cancelled_by,
        status_updated_at = now()
    WHERE id = p_order_id;
    
    -- Create notification
    INSERT INTO public.order_notifications (
        order_id,
        cafe_id,
        user_id,
        notification_type,
        message
    )
    SELECT 
        o.id,
        o.cafe_id,
        o.user_id,
        'order_cancelled',
        'Order #' || o.order_number || ' has been cancelled.' || 
        CASE 
            WHEN p_cancellation_reason IS NOT NULL 
            THEN ' Reason: ' || p_cancellation_reason 
            ELSE '' 
        END
    FROM public.orders o
    WHERE o.id = p_order_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.auto_cancel_old_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_with_reason(UUID, UUID, TEXT) TO authenticated;

-- Add RLS policy for cancelled_by field
CREATE POLICY "Users can view cancellation info for their orders" ON public.orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.cafe_staff 
            WHERE cafe_staff.cafe_id = orders.cafe_id 
            AND cafe_staff.user_id = auth.uid()
            AND cafe_staff.is_active = true
        )
    );

-- Create a view for easier querying of cancellation data
CREATE OR REPLACE VIEW public.order_cancellation_details AS
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.created_at,
    o.cancelled_at,
    o.cancellation_reason,
    o.cancelled_by,
    p_cancelled_by.full_name as cancelled_by_name,
    p_cancelled_by.email as cancelled_by_email,
    CASE 
        WHEN o.cancellation_reason LIKE 'Auto-cancelled%' THEN 'auto'
        WHEN o.cancelled_by = o.user_id THEN 'customer'
        ELSE 'cafe'
    END as cancellation_type
FROM public.orders o
LEFT JOIN public.profiles p_cancelled_by ON p_cancelled_by.id = o.cancelled_by
WHERE o.status = 'cancelled';

-- Grant access to the view
GRANT SELECT ON public.order_cancellation_details TO authenticated;
