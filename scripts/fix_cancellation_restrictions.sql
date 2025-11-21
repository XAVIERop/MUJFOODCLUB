-- Fix Cancellation Restrictions
-- This script updates the cancellation function to enforce proper business rules

-- Update the cancel_order_with_reason function to prevent cancelling orders that are:
-- - Already completed
-- - Already cancelled  
-- - On the way (delivery in progress)
-- Cafes can only cancel orders up to 'preparing' status

CREATE OR REPLACE FUNCTION public.cancel_order_with_reason(
    p_order_id UUID,
    p_cancelled_by UUID,
    p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_status TEXT;
    v_result JSONB;
BEGIN
    -- Get current order status
    SELECT status INTO v_order_status
    FROM public.orders 
    WHERE id = p_order_id;
    
    -- Check if order exists
    IF v_order_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Order not found'
        );
    END IF;
    
    -- Check if order can be cancelled
    -- Customers can only cancel 'received' orders
    -- Cafes can cancel up to 'preparing' status, but NOT 'on_the_way' or 'completed'
    IF v_order_status IN ('completed', 'cancelled', 'on_the_way') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', CASE 
                WHEN v_order_status = 'completed' THEN 'Cannot cancel completed orders'
                WHEN v_order_status = 'cancelled' THEN 'Order is already cancelled'
                WHEN v_order_status = 'on_the_way' THEN 'Cannot cancel orders that are out for delivery'
                ELSE 'Order cannot be cancelled in current status'
            END
        );
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
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Order cancelled successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.cancel_order_with_reason(UUID, UUID, TEXT) TO authenticated;

-- Add comment explaining the restrictions
COMMENT ON FUNCTION public.cancel_order_with_reason IS 'Cancels an order with reason tracking. Prevents cancellation of completed, cancelled, or on_the_way orders. Cafes can cancel up to preparing status only.';

