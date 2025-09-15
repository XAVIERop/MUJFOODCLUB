import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export interface Order {
  id: string;
  user_id: string;
  cafe_id: string;
  order_number: string;
  total_amount: number;
  delivery_block: string;
  delivery_notes?: string | null;
  payment_method: string;
  points_earned: number;
  estimated_delivery?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  processing_time_minutes?: number | null;
  queue_position?: number | null;
  priority_level?: string | null;
  estimated_completion_time?: string | null;
  actual_completion_time?: string | null;
}

export const useUserOrdersQuery = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userOrders(userId),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          cafe_id,
          order_number,
          total_amount,
          delivery_block,
          delivery_notes,
          payment_method,
          points_earned,
          estimated_delivery,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCafeOrdersQuery = (cafeId: string) => {
  return useQuery({
    queryKey: queryKeys.cafeOrders(cafeId),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          cafe_id,
          order_number,
          total_amount,
          delivery_block,
          delivery_notes,
          payment_method,
          points_earned,
          estimated_delivery,
          status,
          created_at,
          updated_at
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cafe orders:', error);
        throw new Error(`Failed to fetch cafe orders: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!cafeId,
    staleTime: 30 * 1000, // 30 seconds for real-time updates
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrderQuery = (orderId: string) => {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: async (): Promise<Order | null> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          cafe_id,
          order_number,
          total_amount,
          delivery_block,
          delivery_notes,
          payment_method,
          points_earned,
          estimated_delivery,
          status,
          created_at,
          updated_at
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      return data;
    },
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrderByNumberQuery = (orderNumber: string) => {
  return useQuery({
    queryKey: ['orders', 'number', orderNumber],
    queryFn: async (): Promise<Order | null> => {
      // Try to fetch by order_number first, then by ID if that fails
      let { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          cafe_id,
          order_number,
          total_amount,
          delivery_block,
          delivery_notes,
          payment_method,
          points_earned,
          estimated_delivery,
          status,
          created_at,
          updated_at
        `)
        .eq('order_number', orderNumber)
        .single();

      // If order_number fails, try by ID (in case orderNumber is actually an ID)
      if (error && error.code === 'PGRST116') {
        console.log('Order not found by number, trying by ID...');
        const { data: idData, error: idError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            cafe_id,
            order_number,
            total_amount,
            delivery_block,
            delivery_notes,
            payment_method,
            points_earned,
            estimated_delivery,
            status,
            created_at,
            updated_at
          `)
          .eq('id', orderNumber)
          .single();
        
        if (idError) {
          console.error('Error fetching order by ID:', idError);
          throw new Error(`Failed to fetch order: ${idError.message}`);
        }
        
        return idData;
      }

      if (error) {
        console.error('Error fetching order by number:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      return data;
    },
    enabled: !!orderNumber,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation for creating orders with optimistic updates
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newOrder) => {
      // Invalidate and refetch orders for the user
      if (newOrder.user_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userOrders(newOrder.user_id)
        });
      }
      
      // Invalidate and refetch orders for the cafe
      if (newOrder.cafe_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cafeOrders(newOrder.cafe_id)
        });
      }
    },
  });
};

// Mutation for updating order status
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order:', error);
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedOrder) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.order(updatedOrder.id),
        updatedOrder
      );

      // Invalidate related queries
      if (updatedOrder.user_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userOrders(updatedOrder.user_id)
        });
      }
      
      if (updatedOrder.cafe_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.cafeOrders(updatedOrder.cafe_id)
        });
      }
    },
  });
};
