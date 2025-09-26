-- Auto-Cancellation Setup
-- This sets up the auto-cancellation system for orders that remain in 'received' status for 10+ minutes

-- Create a function to check and auto-cancel old orders
-- This can be called manually or via a scheduled job
CREATE OR REPLACE FUNCTION public.check_and_auto_cancel_orders()
RETURNS TABLE (
    cancelled_count INTEGER,
    cancelled_order_numbers TEXT[]
) AS $$
DECLARE
    cancelled_count INTEGER := 0;
    order_numbers TEXT[] := '{}';
    order_record RECORD;
BEGIN
    -- Find orders that should be auto-cancelled
    FOR order_record IN
        SELECT id, order_number, cafe_id, user_id
        FROM public.orders 
        WHERE 
            status = 'received' 
            AND created_at < (now() - INTERVAL '10 minutes')
    LOOP
        -- Cancel the order using our existing function
        PERFORM public.cancel_order_with_reason(
            order_record.id,
            NULL, -- Auto-cancelled (no user)
            'Auto-cancelled: Order not confirmed within 10 minutes'
        );
        
        -- Track cancelled orders
        cancelled_count := cancelled_count + 1;
        order_numbers := array_append(order_numbers, order_record.order_number);
    END LOOP;
    
    RETURN QUERY SELECT cancelled_count, order_numbers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that automatically checks for auto-cancellation on order status updates
-- This ensures that when a cafe confirms an order, we don't accidentally auto-cancel it
CREATE OR REPLACE FUNCTION public.prevent_auto_cancel_on_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- If order is being confirmed, make sure it's not auto-cancelled
    IF NEW.status = 'confirmed' AND OLD.status = 'received' THEN
        -- Clear any auto-cancellation flags if they exist
        NEW.cancelled_at := NULL;
        NEW.cancellation_reason := NULL;
        NEW.cancelled_by := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS prevent_auto_cancel_on_confirmation_trigger ON public.orders;
CREATE TRIGGER prevent_auto_cancel_on_confirmation_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_auto_cancel_on_confirmation();

-- Create a simple function to manually trigger auto-cancellation
-- This can be called from the frontend or manually
CREATE OR REPLACE FUNCTION public.trigger_auto_cancellation()
RETURNS JSON AS $$
DECLARE
    result RECORD;
    response JSON;
BEGIN
    -- Call the auto-cancellation function
    SELECT * INTO result FROM public.check_and_auto_cancel_orders();
    
    -- Return result as JSON
    response := json_build_object(
        'success', true,
        'cancelled_count', result.cancelled_count,
        'cancelled_orders', result.cancelled_order_numbers,
        'timestamp', now()
    );
    
    RETURN response;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.check_and_auto_cancel_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_auto_cancellation() TO authenticated;

-- Create an index for better performance on auto-cancellation queries
CREATE INDEX IF NOT EXISTS idx_orders_auto_cancel_check 
ON public.orders (status, created_at) 
WHERE status = 'received';

-- Add a comment explaining the auto-cancellation system
COMMENT ON FUNCTION public.check_and_auto_cancel_orders() IS 
'Checks for orders in received status for more than 10 minutes and auto-cancels them. Returns count and order numbers of cancelled orders.';

COMMENT ON FUNCTION public.trigger_auto_cancellation() IS 
'Manually triggers auto-cancellation check and returns JSON result with cancelled order details.';
