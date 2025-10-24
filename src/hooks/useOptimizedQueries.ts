import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Query optimization configurations
const QUERY_CONFIGS = {
  // Fast queries (cached for 5 minutes)
  fast: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  },
  
  // Medium queries (cached for 2 minutes)
  medium: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  },
  
  // Slow queries (cached for 30 seconds)
  slow: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  },
  
  // Real-time queries (no caching)
  realtime: {
    staleTime: 0,
    cacheTime: 0,
    retry: 1,
  },
};

// Optimized cafe queries
export const useOptimizedCafes = () => {
  return useQuery({
    queryKey: ['cafes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cafes')
        .select(`
          id,
          name,
          slug,
          description,
          location,
          phone,
          accepting_orders,
          average_rating,
          total_ratings,
          image_url,
          type,
          created_at
        `)
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    ...QUERY_CONFIGS.fast,
  });
};

// Optimized menu items query
export const useOptimizedMenuItems = (cafeId: string) => {
  return useQuery({
    queryKey: ['menu-items', cafeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          category,
          is_vegetarian,
          image_url,
          out_of_stock,
          portions (
            id,
            name,
            price,
            out_of_stock
          )
        `)
        .eq('cafe_id', cafeId)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!cafeId,
    ...QUERY_CONFIGS.medium,
  });
};

// Optimized user profile query
export const useOptimizedProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          block,
          total_points,
          current_tier,
          created_at
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    ...QUERY_CONFIGS.fast,
  });
};

// Optimized orders query with pagination
export const useOptimizedOrders = (userId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['orders', userId, page, limit],
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          cafe:name,
          order_items (
            id,
            quantity,
            unit_price,
            menu_item:name
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      return { data, count: count || 0 };
    },
    enabled: !!userId,
    ...QUERY_CONFIGS.medium,
  });
};

// Optimized analytics query
export const useOptimizedAnalytics = (cafeId: string, timeRange: 'today' | 'week' | 'month') => {
  return useQuery({
    queryKey: ['analytics', cafeId, timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            unit_price
          )
        `)
        .eq('cafe_id', cafeId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process analytics data
      const totalRevenue = data.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = data.length;
      const completedOrders = data.filter(order => order.status === 'completed').length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        averageOrderValue,
        orders: data,
      };
    },
    enabled: !!cafeId,
    ...QUERY_CONFIGS.slow,
  });
};

// Query prefetching utility
export const useQueryPrefetch = () => {
  const queryClient = useQueryClient();
  
  const prefetchCafes = () => {
    queryClient.prefetchQuery({
      queryKey: ['cafes'],
      queryFn: async () => {
        const { data } = await supabase
          .from('cafes')
          .select('id, name, slug, accepting_orders')
          .eq('is_active', true);
        return data;
      },
      ...QUERY_CONFIGS.fast,
    });
  };
  
  const prefetchMenuItems = (cafeId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['menu-items', cafeId],
      queryFn: async () => {
        const { data } = await supabase
          .from('menu_items')
          .select('id, name, price, category, is_vegetarian')
          .eq('cafe_id', cafeId)
          .eq('is_active', true);
        return data;
      },
      ...QUERY_CONFIGS.medium,
    });
  };
  
  return { prefetchCafes, prefetchMenuItems };
};

// Query invalidation utility
export const useQueryInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidateCafes = () => {
    queryClient.invalidateQueries({ queryKey: ['cafes'] });
  };
  
  const invalidateMenuItems = (cafeId: string) => {
    queryClient.invalidateQueries({ queryKey: ['menu-items', cafeId] });
  };
  
  const invalidateOrders = (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['orders', userId] });
  };
  
  const invalidateAnalytics = (cafeId: string) => {
    queryClient.invalidateQueries({ queryKey: ['analytics', cafeId] });
  };
  
  return {
    invalidateCafes,
    invalidateMenuItems,
    invalidateOrders,
    invalidateAnalytics,
  };
};

// Performance monitoring for queries
export const useQueryPerformance = () => {
  const queryClient = useQueryClient();
  
  const getQueryStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  };
  
  const clearStaleQueries = () => {
    queryClient.removeQueries({ stale: true });
  };
  
  const clearAllQueries = () => {
    queryClient.clear();
  };
  
  return {
    getQueryStats,
    clearStaleQueries,
    clearAllQueries,
  };
};