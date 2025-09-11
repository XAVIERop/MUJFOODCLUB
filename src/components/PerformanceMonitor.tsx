import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Database, Users, Clock, AlertTriangle } from 'lucide-react';
import { withSupabaseClient } from '@/lib/supabasePool';
import { supabasePool } from '@/lib/supabasePool';

interface PerformanceMetrics {
  totalOrdersToday: number;
  activeCafes: number;
  avgOrderValue: number;
  peakHour: number;
  connectionPoolStatus: {
    totalClients: number;
    availableClients: number;
    inUseClients: number;
    waitingRequests: number;
  };
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get system performance metrics
      const { data: systemMetrics, error: systemError } = await withSupabaseClient(
        async (client) => {
          const { data, error } = await client.rpc('get_system_performance_metrics');
          return { data, error };
        }
      );

      if (systemError) {
        throw new Error(`Failed to fetch system metrics: ${systemError.message}`);
      }

      // Get connection pool status
      const connectionPoolStatus = supabasePool.getPoolStatus();

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (connectionPoolStatus.waitingRequests > 5) {
        systemHealth = 'critical';
      } else if (connectionPoolStatus.waitingRequests > 2 || connectionPoolStatus.availableClients < 2) {
        systemHealth = 'warning';
      }

      setMetrics({
        totalOrdersToday: systemMetrics?.[0]?.total_orders_today || 0,
        activeCafes: systemMetrics?.[0]?.active_cafes || 0,
        avgOrderValue: systemMetrics?.[0]?.avg_order_value || 0,
        peakHour: systemMetrics?.[0]?.peak_hour || 0,
        connectionPoolStatus,
        systemHealth,
      });
    } catch (err) {
      console.error('Error fetching performance metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading performance metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error loading metrics: {error}
          </div>
          <Button onClick={fetchMetrics} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              className={`${getHealthColor(metrics.systemHealth)} text-white`}
            >
              {getHealthIcon(metrics.systemHealth)} {metrics.systemHealth.toUpperCase()}
            </Badge>
            <Button 
              onClick={fetchMetrics} 
              size="sm" 
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* System Metrics */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">System Metrics</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Orders Today:</span>
                <span className="font-mono text-sm">{metrics.totalOrdersToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Cafes:</span>
                <span className="font-mono text-sm">{metrics.activeCafes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Order Value:</span>
                <span className="font-mono text-sm">₹{metrics.avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Peak Hour:</span>
                <span className="font-mono text-sm">{metrics.peakHour}:00</span>
              </div>
            </div>
          </div>

          {/* Connection Pool Status */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Connection Pool</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Total Clients:</span>
                <span className="font-mono text-sm">{metrics.connectionPoolStatus.totalClients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Available:</span>
                <span className="font-mono text-sm text-green-600">
                  {metrics.connectionPoolStatus.availableClients}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Use:</span>
                <span className="font-mono text-sm text-blue-600">
                  {metrics.connectionPoolStatus.inUseClients}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Waiting:</span>
                <span className={`font-mono text-sm ${
                  metrics.connectionPoolStatus.waitingRequests > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metrics.connectionPoolStatus.waitingRequests}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Performance</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm">Pool Utilization:</span>
                <span className="font-mono text-sm">
                  {Math.round((metrics.connectionPoolStatus.inUseClients / metrics.connectionPoolStatus.totalClients) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Queue Status:</span>
                <span className={`text-sm ${
                  metrics.connectionPoolStatus.waitingRequests === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.connectionPoolStatus.waitingRequests === 0 ? 'Clear' : 'Backed Up'}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Alerts</h3>
            <div className="space-y-1">
              {metrics.systemHealth === 'critical' && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>High load detected</span>
                </div>
              )}
              {metrics.connectionPoolStatus.waitingRequests > 0 && (
                <div className="flex items-center gap-1 text-yellow-600 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Connection queue active</span>
                </div>
              )}
              {metrics.systemHealth === 'healthy' && (
                <div className="flex items-center gap-1 text-green-600 text-xs">
                  <Database className="w-3 h-3" />
                  <span>All systems normal</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};