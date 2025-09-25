// Optimized Query Hooks
// Addresses performance issues and implements best practices

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_OPTIMIZATIONS, CACHE_CONFIG, PERFORMANCE_MONITORING } from '@/lib/queryOptimization';

// Optimized Cafes Hook
export const useOptimizedCafes = () => {
  return useQuery({
    queryKey: ['cafes'],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('cafes')
        .select(QUERY_OPTIMIZATIONS.getCafesOptimized().select)
        .order('priority', { ascending: false })
        .order('average_rating', { ascending: false, nullsFirst: false })
        .limit(20);
      
      PERFORMANCE_MONITORING.trackQuery('getCafes', startTime);
      
      if (error) throw error;
      return data;
    },
    staleTime: CACHE_CONFIG.CAFES,
    cacheTime: CACHE_CONFIG.CAFES * 2,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

// Optimized Menu Items Hook
export const useOptimizedMenuItems = (cafeId: string) => {
  return useQuery({
    queryKey: ['menuItems', cafeId],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('menu_items')
        .select(QUERY_OPTIMIZATIONS.getMenuItemsOptimized(cafeId).select)
        .eq('cafe_id', cafeId)
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })
        .limit(50);
      
      PERFORMANCE_MONITORING.trackQuery('getMenuItems', startTime);
      
      if (error) throw error;
      return data;
    },
    enabled: !!cafeId,
    staleTime: CACHE_CONFIG.MENU_ITEMS,
    cacheTime: CACHE_CONFIG.MENU_ITEMS * 2,
    refetchOnWindowFocus: false
  });
};

// Optimized Orders Hook
export const useOptimizedOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('orders')
        .select(QUERY_OPTIMIZATIONS.getOrdersOptimized(userId).select)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      PERFORMANCE_MONITORING.trackQuery('getOrders', startTime);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: CACHE_CONFIG.ORDERS,
    cacheTime: CACHE_CONFIG.ORDERS * 2,
    refetchOnWindowFocus: false
  });
};

// Optimized Profile Hook
export const useOptimizedProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .select(QUERY_OPTIMIZATIONS.getProfileOptimized(userId).select)
        .eq('id', userId)
        .single();
      
      PERFORMANCE_MONITORING.trackQuery('getProfile', startTime);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: CACHE_CONFIG.PROFILES,
    cacheTime: CACHE_CONFIG.PROFILES * 2,
    refetchOnWindowFocus: false
  });
};

// Optimized Cafe Orders Hook (for cafe owners)
export const useOptimizedCafeOrders = (cafeId: string) => {
  return useQuery({
    queryKey: ['cafeOrders', cafeId],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('orders')
        .select(QUERY_OPTIMIZATIONS.getCafeOrdersOptimized(cafeId).select)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      PERFORMANCE_MONITORING.trackQuery('getCafeOrders', startTime);
      
      if (error) throw error;
      return data;
    },
    enabled: !!cafeId,
    staleTime: CACHE_CONFIG.ORDERS,
    cacheTime: CACHE_CONFIG.ORDERS * 2,
    refetchOnWindowFocus: false
  });
};

// Optimized Loyalty Transactions Hook
export const useOptimizedLoyaltyTransactions = (userId: string) => {
  return useQuery({
    queryKey: ['loyaltyTransactions', userId],
    queryFn: async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('id, points_change, transaction_type, description, created_at, order_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      PERFORMANCE_MONITORING.trackQuery('getLoyaltyTransactions', startTime);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: CACHE_CONFIG.LOYALTY_TRANSACTIONS,
    cacheTime: CACHE_CONFIG.LOYALTY_TRANSACTIONS * 2,
    refetchOnWindowFocus: false
  });
};

// Optimized Mutations
export const useOptimizedOrderMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: any) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      PERFORMANCE_MONITORING.trackQuery('createOrder', startTime);
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cafeOrders'] });
    }
  });
};

export const useOptimizedOrderUpdateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: any }) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();
      
      PERFORMANCE_MONITORING.trackQuery('updateOrder', startTime);
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cafeOrders'] });
    }
  });
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const queryClient = useQueryClient();
  
  const getQueryStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: JSON.stringify(cache).length
    };
  };
  
  const clearCache = () => {
    queryClient.clear();
  };
  
  const invalidateAll = () => {
    queryClient.invalidateQueries();
  };
  
  return {
    getQueryStats,
    clearCache,
    invalidateAll
  };
};

// Real-time optimization hook
export const useOptimizedRealtime = (table: string, filters: any, onUpdate: (payload: any) => void) => {
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: filters
      }, (payload) => {
        console.log(`📡 Real-time update for ${table}:`, payload);
        onUpdate(payload);
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: [table] });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filters, onUpdate, queryClient]);
};

export default {
  useOptimizedCafes,
  useOptimizedMenuItems,
  useOptimizedOrders,
  useOptimizedProfile,
  useOptimizedCafeOrders,
  useOptimizedLoyaltyTransactions,
  useOptimizedOrderMutation,
  useOptimizedOrderUpdateMutation,
  usePerformanceMonitoring,
  useOptimizedRealtime
};





