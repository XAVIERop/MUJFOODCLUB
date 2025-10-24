import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  cafe_id: string;
  user_id: string;
}

interface UseSimplePOSUpdatesProps {
  cafeId: string | null;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
}

export const useSimplePOSUpdates = ({
  cafeId,
  onNewOrder,
  onOrderUpdate
}: UseSimplePOSUpdatesProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrderTime, setLastOrderTime] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  // Simple polling-based updates instead of complex subscriptions
  useEffect(() => {
    if (!cafeId) {
      setIsConnected(false);
      return;
    }

    console.log('🔌 Simple POS: Setting up polling for cafe:', cafeId);
    setIsConnected(true);

    // Poll every 3 seconds for both new orders and order updates
    const pollInterval = setInterval(async () => {
      try {
        // Check for new orders (created_at changes)
        const { data: newOrders, error: newOrdersError } = await supabase
          .from('orders')
          .select('*')
          .eq('cafe_id', cafeId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (newOrdersError) {
          console.error('❌ Simple POS: New orders polling error:', newOrdersError);
        } else if (newOrders && newOrders.length > 0) {
          const latestOrder = newOrders[0];
          const orderTime = latestOrder.created_at;
          
          if (lastOrderTime && orderTime > lastOrderTime) {
            // Additional check: Only trigger for orders in 'received' status
            if (latestOrder.status === 'received') {
              setLastOrderTime(orderTime);
              onNewOrder?.(latestOrder);
              
              toast({
                title: "New Order!",
                description: `Order #${latestOrder.order_number} received`,
              });
            } else {
              // Still update the time to prevent re-triggering
              setLastOrderTime(orderTime);
            }
          } else if (!lastOrderTime) {
            // First time, just set the baseline
            setLastOrderTime(orderTime);
          }
        }

        // Check for order updates (status_updated_at changes)
        const { data: updatedOrders, error: updatedOrdersError } = await supabase
          .from('orders')
          .select('*')
          .eq('cafe_id', cafeId)
          .not('status_updated_at', 'is', null)
          .order('status_updated_at', { ascending: false })
          .limit(10);

        if (updatedOrdersError) {
          console.error('❌ Simple POS: Order updates polling error:', updatedOrdersError);
        } else if (updatedOrders && updatedOrders.length > 0) {
          const latestUpdate = updatedOrders[0];
          const updateTime = latestUpdate.status_updated_at;
          
          if (lastUpdateTime && updateTime > lastUpdateTime) {
            setLastUpdateTime(updateTime);
            onOrderUpdate?.(latestUpdate);
            
            console.log('🔄 Simple POS: Order status updated:', latestUpdate.order_number, 'to', latestUpdate.status);
          } else if (!lastUpdateTime) {
            // First time, just set the baseline
            setLastUpdateTime(updateTime);
          }
        }
      } catch (error) {
        console.error('❌ Simple POS: Polling exception:', error);
      }
    }, 3000); // Poll every 3 seconds for faster updates

    return () => {
      console.log('🧹 Simple POS: Cleaning up polling');
      clearInterval(pollInterval);
      setIsConnected(false);
    };
  }, [cafeId, lastOrderTime, lastUpdateTime, onNewOrder, onOrderUpdate, toast]);

  // Manual refresh function
  const refreshOrders = useCallback(async () => {
    if (!cafeId) return [];

    try {
      console.log('🔄 Simple POS: Manual refresh...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Simple POS: Refresh error:', error);
        throw error;
      }

      console.log('✅ Simple POS: Refresh successful:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Simple POS: Refresh exception:', error);
      throw error;
    }
  }, [cafeId]);

  // Test connection function
  const testConnection = useCallback(async () => {
    if (!cafeId) return false;

    try {
      console.log('🧪 Simple POS: Testing connection...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('count')
        .eq('cafe_id', cafeId)
        .limit(1);

      if (error) {
        console.error('❌ Simple POS: Connection test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Simple POS: Connection test error:', error);
      return false;
    }
  }, [cafeId]);

  return {
    isConnected,
    lastOrderTime,
    refreshOrders,
    testConnection
  };
};

export default useSimplePOSUpdates;
