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

  // Simple polling-based updates instead of complex subscriptions
  useEffect(() => {
    if (!cafeId) {
      setIsConnected(false);
      return;
    }

    console.log('🔌 Simple POS: Setting up polling for cafe:', cafeId);
    setIsConnected(true);

    // Poll every 5 seconds for new orders
    const pollInterval = setInterval(async () => {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('cafe_id', cafeId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('❌ Simple POS: Polling error:', error);
          return;
        }

        if (orders && orders.length > 0) {
          const latestOrder = orders[0];
          const orderTime = latestOrder.created_at;
          
          if (lastOrderTime && orderTime > lastOrderTime) {
            console.log('🆕 Simple POS: New order detected:', latestOrder);
            setLastOrderTime(orderTime);
            onNewOrder?.(latestOrder);
            
            toast({
              title: "New Order!",
              description: `Order #${latestOrder.order_number} received`,
            });
          } else if (!lastOrderTime) {
            // First time, just set the baseline
            setLastOrderTime(orderTime);
          }
        }
      } catch (error) {
        console.error('❌ Simple POS: Polling exception:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      console.log('🧹 Simple POS: Cleaning up polling');
      clearInterval(pollInterval);
      setIsConnected(false);
    };
  }, [cafeId, lastOrderTime, onNewOrder, toast]);

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

      console.log('✅ Simple POS: Connection test successful');
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
