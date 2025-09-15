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

interface UsePOSOrderUpdatesProps {
  cafeId: string | null;
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  onError?: (error: Error) => void;
}

export const usePOSOrderUpdates = ({
  cafeId,
  onNewOrder,
  onOrderUpdate,
  onError
}: UsePOSOrderUpdatesProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastOrderTime, setLastOrderTime] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(5);

  const handleNewOrder = useCallback((order: Order) => {
    console.log('🆕 POS: New order received:', order);
    setLastOrderTime(order.created_at);
    onNewOrder?.(order);
    
    toast({
      title: "New Order!",
      description: `Order #${order.order_number} received`,
    });
  }, [onNewOrder, toast]);

  const handleOrderUpdate = useCallback((order: Order) => {
    console.log('🔄 POS: Order updated:', order);
    onOrderUpdate?.(order);
  }, [onOrderUpdate]);

  const handleError = useCallback((error: Error) => {
    console.error('❌ POS: Subscription error:', error);
    onError?.(error);
    
    if (retryCount < maxRetries) {
      console.log(`🔄 POS: Retrying connection (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
    }
  }, [onError, retryCount, maxRetries]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!cafeId) {
      setIsConnected(false);
      return;
    }

    console.log('🔌 POS: Setting up subscriptions for cafe:', cafeId);
    
    let orderChannel: any = null;
    let notificationChannel: any = null;
    let retryTimeout: NodeJS.Timeout | null = null;

    const setupSubscriptions = () => {
      try {
        // Clean up existing subscriptions
        if (orderChannel) {
          supabase.removeChannel(orderChannel);
        }
        if (notificationChannel) {
          supabase.removeChannel(notificationChannel);
        }

        // Set up order subscription
        orderChannel = supabase
          .channel(`pos-orders-${cafeId}-${Date.now()}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'orders',
              filter: `cafe_id=eq.${cafeId}`
            }, 
            (payload) => {
              console.log('📦 POS: Order INSERT received:', payload);
              if (payload.new) {
                handleNewOrder(payload.new as Order);
              }
            }
          )
          .on('postgres_changes', 
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'orders',
              filter: `cafe_id=eq.${cafeId}`
            }, 
            (payload) => {
              console.log('🔄 POS: Order UPDATE received:', payload);
              if (payload.new) {
                handleOrderUpdate(payload.new as Order);
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 POS: Order subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setRetryCount(0);
            } else if (status === 'CHANNEL_ERROR') {
              handleError(new Error('Order subscription failed'));
            }
          });

        // Set up notification subscription
        notificationChannel = supabase
          .channel(`pos-notifications-${cafeId}-${Date.now()}`)
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'order_notifications',
              filter: `cafe_id=eq.${cafeId}`
            }, 
            (payload) => {
              console.log('🔔 POS: Notification received:', payload);
              if (payload.new) {
                toast({
                  title: "New Order Notification",
                  description: payload.new.message || "You have a new order",
                });
              }
            }
          )
          .subscribe((status) => {
            console.log('📡 POS: Notification subscription status:', status);
          });

      } catch (error) {
        console.error('❌ POS: Error setting up subscriptions:', error);
        handleError(error as Error);
      }
    };

    // Initial setup
    setupSubscriptions();

    // Retry logic
    if (retryCount > 0 && retryCount < maxRetries) {
      retryTimeout = setTimeout(() => {
        console.log('🔄 POS: Retrying subscription setup...');
        setupSubscriptions();
      }, Math.min(1000 * Math.pow(2, retryCount), 10000)); // Exponential backoff, max 10s
    }

    return () => {
      console.log('🧹 POS: Cleaning up subscriptions');
      if (orderChannel) {
        supabase.removeChannel(orderChannel);
      }
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      setIsConnected(false);
    };
  }, [cafeId, retryCount, handleNewOrder, handleOrderUpdate, handleError, toast]);

  // Manual refresh function
  const refreshOrders = useCallback(async () => {
    if (!cafeId) return [];

    try {
      console.log('🔄 POS: Manually refreshing orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ POS: Error refreshing orders:', error);
        throw error;
      }

      console.log('✅ POS: Orders refreshed successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ POS: Error in refreshOrders:', error);
      throw error;
    }
  }, [cafeId]);

  // Test connection function
  const testConnection = useCallback(async () => {
    if (!cafeId) return false;

    try {
      console.log('🧪 POS: Testing connection...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('count')
        .eq('cafe_id', cafeId)
        .limit(1);

      if (error) {
        console.error('❌ POS: Connection test failed:', error);
        return false;
      }

      console.log('✅ POS: Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ POS: Connection test error:', error);
      return false;
    }
  }, [cafeId]);

  return {
    isConnected,
    lastOrderTime,
    retryCount,
    refreshOrders,
    testConnection
  };
};

export default usePOSOrderUpdates;
