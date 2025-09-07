import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  cafe_id: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  points_earned: number;
  delivery_block: string;
  delivery_notes?: string;
  payment_method: string;
  estimated_delivery: string;
  special_instructions: string;
  created_at: string;
  updated_at: string;
  status_updated_at: string;
  completed_at: string | null;
  points_credited: boolean;
  has_rating?: boolean;
  rating_submitted_at?: string;
  user: {
    full_name: string;
    phone: string;
    block: string;
    email: string;
  };
  cafe?: {
    id: string;
    name: string;
    location: string;
  };
  order_items: Array<{
    id: string;
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions: string;
    menu_item: {
      name: string;
      description: string;
    };
  }>;
}

// Query key factory for orders
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  cafe: (cafeId: string) => [...orderKeys.all, 'cafe', cafeId] as const,
  user: (userId: string) => [...orderKeys.all, 'user', userId] as const,
};

// Hook to fetch orders for a specific cafe
export const useCafeOrdersQuery = (cafeId: string | null, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) => {
  return useQuery({
    queryKey: orderKeys.cafe(cafeId || ''),
    queryFn: async (): Promise<Order[]> => {
      if (!cafeId) return [];
      
      console.log('🔄 Fetching orders for cafe:', cafeId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cafe orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      const orders = Array.isArray(data) ? data : [];
      console.log(`✅ Fetched ${orders.length} orders for cafe`);
      
      return orders;
    },
    staleTime: options?.staleTime || 30 * 1000, // 30 seconds for orders
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false && !!cafeId,
    retry: 2,
    refetchInterval: options?.refetchInterval || 30 * 1000, // 30 seconds
    refetchIntervalInBackground: false,
  });
};

// Hook to fetch user's orders
export const useUserOrdersQuery = (userId: string | null, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: orderKeys.user(userId || ''),
    queryFn: async (): Promise<Order[]> => {
      if (!userId) return [];
      
      console.log('🔄 Fetching orders for user:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      const orders = Array.isArray(data) ? data : [];
      console.log(`✅ Fetched ${orders.length} orders for user`);
      
      return orders;
    },
    staleTime: options?.staleTime || 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false && !!userId,
    retry: 2,
  });
};

// Hook to fetch a specific order by ID
export const useOrderQuery = (orderId: string | null, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId || ''),
    queryFn: async (): Promise<Order | null> => {
      if (!orderId) return null;
      
      console.log('🔄 Fetching order details by ID:', orderId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      console.log('✅ Fetched order details:', data?.order_number);
      return data;
    },
    staleTime: options?.staleTime || 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false && !!orderId,
    retry: 2,
  });
};

// Hook to fetch a specific order by order number
export const useOrderByNumberQuery = (orderNumber: string | null, userId: string | null, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: [...orderKeys.details(), 'byNumber', orderNumber || '', userId || ''],
    queryFn: async (): Promise<Order | null> => {
      if (!orderNumber || !userId) return null;
      
      console.log('🔄 Fetching order details by number:', orderNumber, 'for user:', userId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          ),
          cafe:cafes(name, location, id)
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching order by number:', error);
        throw new Error(`Failed to fetch order: ${error.message}`);
      }

      console.log('✅ Fetched order details by number:', data?.order_number);
      return data;
    },
    staleTime: options?.staleTime || 10 * 1000, // 10 seconds for real-time updates
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false && !!orderNumber && !!userId,
    retry: 2,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    refetchIntervalInBackground: false,
  });
};

// Mutation to update order status
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      console.log('🔄 Updating order status:', orderId, 'to', status);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && { completed_at: new Date().toISOString() })
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw new Error(`Failed to update order: ${error.message}`);
      }

      console.log('✅ Order status updated successfully');
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: orderKeys.cafe(data.cafe_id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.user(data.user_id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
    },
    onError: (error) => {
      console.error('❌ Failed to update order status:', error);
    },
  });
};

// Hook to invalidate orders cache
export const useInvalidateOrders = () => {
  const queryClient = useQueryClient();

  return (cafeId?: string, userId?: string) => {
    if (cafeId) {
      queryClient.invalidateQueries({ queryKey: orderKeys.cafe(cafeId) });
    }
    if (userId) {
      queryClient.invalidateQueries({ queryKey: orderKeys.user(userId) });
    }
    if (!cafeId && !userId) {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    }
  };
};
