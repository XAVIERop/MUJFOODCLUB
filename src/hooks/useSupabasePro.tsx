import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook for optimized order fetching using Pro plan features
export const useOptimizedOrders = (cafeId: string, limit: number = 50) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the optimized function we created
      const { data, error } = await supabase.rpc('get_optimized_orders', {
        p_cafe_id: cafeId,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching optimized orders:', error);
        setError(error.message);
        return;
      }

      setOrders(data || []);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [cafeId, limit]);

  useEffect(() => {
    if (cafeId) {
      fetchOrders();
    }
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};

// Hook for cafe analytics using Pro plan features
export const useCafeAnalytics = (cafeId: string, days: number = 30) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_cafe_analytics', {
        p_cafe_id: cafeId,
        p_days: days
      });

      if (error) {
        console.error('Error fetching cafe analytics:', error);
        setError(error.message);
        return;
      }

      setAnalytics(data?.[0] || null);
    } catch (err) {
      console.error('Error in fetchAnalytics:', err);
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [cafeId, days]);

  useEffect(() => {
    if (cafeId) {
      fetchAnalytics();
    }
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

// Hook for real-time connections with Pro plan optimization
export const useOptimizedRealtime = (cafeId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    if (!cafeId) return;

    // Create optimized real-time connection
    const channel = supabase
      .channel(`cafe-${cafeId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: cafeId }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `cafe_id=eq.${cafeId}`
      }, (payload) => {
        console.log('Real-time update:', payload);
        // Handle real-time updates
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setConnectionCount(Object.keys(state).length);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId]);

  return { isConnected, connectionCount };
};

// Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<any>(null);

  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_slow_queries');
      
      if (error) {
        console.error('Error fetching performance metrics:', error);
        return;
      }

      setMetrics(data);
    } catch (err) {
      console.error('Error in fetchPerformanceMetrics:', err);
    }
  }, []);

  useEffect(() => {
    // Fetch performance metrics every 5 minutes
    fetchPerformanceMetrics();
    const interval = setInterval(fetchPerformanceMetrics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchPerformanceMetrics]);

  return { metrics, refetch: fetchPerformanceMetrics };
};

// Hook for data cleanup and maintenance
export const useDataMaintenance = () => {
  const [isCleaning, setIsCleaning] = useState(false);

  const performCleanup = useCallback(async () => {
    try {
      setIsCleaning(true);
      
      const { error } = await supabase.rpc('cleanup_old_data');
      
      if (error) {
        console.error('Error during cleanup:', error);
        throw error;
      }

      console.log('Data cleanup completed successfully');
    } catch (err) {
      console.error('Error in performCleanup:', err);
      throw err;
    } finally {
      setIsCleaning(false);
    }
  }, []);

  return { performCleanup, isCleaning };
};

// Hook for refreshing materialized views
export const useMaterializedViewRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCafePerformance = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      const { error } = await supabase.rpc('refresh_cafe_performance');
      
      if (error) {
        console.error('Error refreshing cafe performance:', error);
        throw error;
      }

      console.log('Cafe performance view refreshed successfully');
    } catch (err) {
      console.error('Error in refreshCafePerformance:', err);
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { refreshCafePerformance, isRefreshing };
};
