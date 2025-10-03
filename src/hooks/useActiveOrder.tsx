import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ActiveOrder {
  id: string;
  status: string;
  estimatedTime: number;
  cafeName: string;
  orderNumber: string;
  created_at: string;
}

export const useActiveOrder = () => {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setActiveOrders([]);
      setLoading(false);
      return;
    }

    const fetchActiveOrders = async () => {
      try {
        // Get all active orders for the user
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            created_at,
            order_number,
            cafes!inner(name)
          `)
          .eq('user_id', user.id)
          .in('status', ['received', 'confirmed', 'preparing', 'on_the_way'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching active orders:', error);
          setActiveOrders([]);
        } else if (data && data.length > 0) {
          // Process all active orders
          const processedOrders = data.map(order => {
            return {
              id: order.id,
              status: order.status,
              estimatedTime: 0, // Not used anymore
              cafeName: order.cafes.name,
              orderNumber: order.order_number,
              created_at: order.created_at
            };
          });

          setActiveOrders(processedOrders);
        } else {
          setActiveOrders([]);
        }
      } catch (error) {
        console.error('Error in fetchActiveOrders:', error);
        setActiveOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('active_order_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedOrder = payload.new;
          
          // If order is completed or cancelled, remove it from active orders
          if (['completed', 'cancelled'].includes(updatedOrder.status)) {
            setActiveOrders(prev => prev.filter(order => order.id !== updatedOrder.id));
          } else {
            // Update the specific order in the list
            setActiveOrders(prev => 
              prev.map(order => 
                order.id === updatedOrder.id 
                  ? { ...order, status: updatedOrder.status }
                  : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { activeOrders, loading };
};
