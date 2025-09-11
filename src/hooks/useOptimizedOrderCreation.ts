import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withSupabaseClient } from '@/lib/supabasePool';
import { orderRateLimiter } from '@/lib/rateLimiter';
import { queryKeys } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export interface OrderCreationData {
  cafe_id: string;
  order_number: string;
  total_amount: number;
  delivery_block: string;
  table_number?: string | null;
  delivery_notes?: string | null;
  payment_method: string;
  points_earned: number;
  estimated_delivery: string;
  phone_number: string;
  order_items: Array<{
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string | null;
  }>;
}

export const useOptimizedOrderCreation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: OrderCreationData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check rate limit
      const rateLimit = orderRateLimiter.isAllowed(user.id);
      if (!rateLimit) {
        const remaining = orderRateLimiter.getRemainingRequests(user.id);
        const resetTime = orderRateLimiter.getResetTime(user.id);
        throw new Error(
          `Rate limit exceeded. You can place ${remaining} more orders. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds.`
        );
      }

      // Use connection pool for better concurrent handling
      return await withSupabaseClient(async (supabase) => {
        // Start transaction-like operation
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            ...orderData,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Order creation error:', orderError);
          throw new Error(`Failed to create order: ${orderError.message}`);
        }

        // Create order items
        const orderItems = orderData.order_items.map(item => ({
          order_id: order.id,
          ...item,
        }));

        const { data: insertedItems, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)
          .select();

        if (itemsError) {
          console.error('Order items creation error:', itemsError);
          // Try to clean up the order if items creation fails
          await supabase.from('orders').delete().eq('id', order.id);
          throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        return {
          order,
          order_items: insertedItems,
        };
      });
    },
    onSuccess: (data, variables) => {
      // Optimistically update caches
      if (data.order) {
        // Update user orders cache
        queryClient.setQueryData(
          queryKeys.userOrders(data.order.user_id),
          (oldData: any) => {
            if (!oldData) return [data.order];
            return [data.order, ...oldData];
          }
        );

        // Update cafe orders cache
        queryClient.setQueryData(
          queryKeys.cafeOrders(data.order.cafe_id),
          (oldData: any) => {
            if (!oldData) return [data.order];
            return [data.order, ...oldData];
          }
        );

        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.userOrders(data.order.user_id)
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.cafeOrders(data.order.cafe_id)
        });
      }
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
    },
  });
};

// Hook for checking rate limit status
export const useOrderRateLimit = () => {
  const { user } = useAuth();
  
  if (!user) {
    return {
      isAllowed: false,
      remaining: 0,
      resetIn: 0,
    };
  }

  const isAllowed = orderRateLimiter.isAllowed(user.id);
  const remaining = orderRateLimiter.getRemainingRequests(user.id);
  const resetTime = orderRateLimiter.getResetTime(user.id);
  const resetIn = Math.max(0, resetTime - Date.now());

  return {
    isAllowed,
    remaining,
    resetIn,
  };
};
