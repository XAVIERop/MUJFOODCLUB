import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { supabasePool } from '@/lib/supabasePool';
import { advancedConnectionManager } from '@/lib/advancedConnectionManager';
import AdminAccessControl from '@/components/AdminAccessControl';
import { 
  Activity, 
  Users, 
  ShoppingCart, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  Server,
  Smartphone,
  Monitor,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SystemMetrics {
  totalOrdersToday: number;
  activeCafes: number;
  avgOrderValue: number;
  peakHour: number;
  connectionPoolStatus: {
    totalClients: number;
    availableClients: number;
    inUseClients: number;
    waitingRequests: number;
    utilizationPercentage?: number;
    queueUtilizationPercentage?: number;
    healthStatus?: 'healthy' | 'warning' | 'critical';
  };
  systemHealth: 'healthy' | 'warning' | 'critical';
  advancedMetrics?: {
    totalConnections: number;
    activeConnections: number;
    availableConnections: number;
    waitingRequests: number;
    peakConcurrency: number;
    avgResponseTime: number;
    connectionErrors: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
    utilizationPercentage: number;
    queueUtilizationPercentage: number;
    isScaling: boolean;
    queueAge: number;
  };
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderTime: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  topCafes: Array<{ name: string; orders: number }>;
}

const AdminDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [errors, setErrors] = useState<string[]>([]);

  const fetchSystemMetrics = async () => {
    try {
      // Get system performance metrics
      const { data: systemMetrics, error: systemError } = await supabase
        .rpc('get_system_performance_metrics');

      if (systemError) {
        console.error('System metrics error:', systemError);
        throw new Error(`Failed to fetch system metrics: ${systemError.message}`);
      }

      // Handle both table and JSON response formats
      let metricsData;
      if (Array.isArray(systemMetrics) && systemMetrics.length > 0) {
        metricsData = systemMetrics[0];
      } else if (systemMetrics && typeof systemMetrics === 'object') {
        metricsData = systemMetrics;
      } else {
        metricsData = {
          total_orders_today: 0,
          active_cafes: 0,
          avg_order_value: 0,
          peak_hour: 0
        };
      }

      // Get connection pool status
      const connectionPoolStatus = supabasePool.getPoolStatus();
      
      // Get advanced metrics with error handling
      let advancedMetrics;
      try {
        advancedMetrics = advancedConnectionManager.getDetailedStatus();
      } catch (err) {
        console.warn('Advanced connection manager not available:', err);
        advancedMetrics = {
          totalConnections: 0,
          activeConnections: 0,
          availableConnections: 0,
          waitingRequests: 0,
          peakConcurrency: 0,
          avgResponseTime: 0,
          connectionErrors: 0,
          healthStatus: 'healthy' as const,
          utilizationPercentage: 0,
          queueUtilizationPercentage: 0,
          isScaling: false,
          queueAge: 0,
        };
      }

      // Determine system health using advanced metrics
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (advancedMetrics.healthStatus === 'critical' || connectionPoolStatus.waitingRequests > 10) {
        systemHealth = 'critical';
      } else if (advancedMetrics.healthStatus === 'warning' || connectionPoolStatus.waitingRequests > 5) {
        systemHealth = 'warning';
      }

      setSystemMetrics({
        totalOrdersToday: metricsData?.total_orders_today || 0,
        activeCafes: metricsData?.active_cafes || 0,
        avgOrderValue: metricsData?.avg_order_value || 0,
        peakHour: metricsData?.peak_hour || 0,
        connectionPoolStatus,
        systemHealth,
        advancedMetrics,
      });
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setErrors(prev => [...prev, `System Metrics: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get order statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status, total_amount, created_at, updated_at')
        .gte('created_at', today);

      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      
      // Calculate average order time (simplified)
      const avgOrderTime = orders?.length > 0 ? 
        orders.reduce((sum, o) => {
          const created = new Date(o.created_at).getTime();
          const updated = new Date(o.updated_at).getTime();
          return sum + (updated - created) / (1000 * 60); // minutes
        }, 0) / orders.length : 0;

      setOrderStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        avgOrderTime: Math.round(avgOrderTime)
      });
    } catch (err) {
      console.error('Error fetching order stats:', err);
      setErrors(prev => [...prev, `Order Stats: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    }
  };

  const fetchUserStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get user statistics
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      const { data: activeUsers, error: activeError } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', today);

      // Get top cafes
      const { data: cafeStats, error: cafeError } = await supabase
        .from('orders')
        .select(`
          cafe_id,
          cafes(name)
        `)
        .gte('created_at', today);

      if (usersError) throw usersError;
      if (activeError) throw activeError;
      if (cafeError) throw cafeError;

      const totalUsers = users?.length || 0;
      const uniqueActiveUsers = new Set(activeUsers?.map(o => o.user_id)).size;
      const newUsersToday = users?.filter(u => u.created_at.startsWith(today)).length || 0;

      // Process cafe stats
      const cafeCounts: { [key: string]: number } = {};
      cafeStats?.forEach(order => {
        const cafeName = order.cafes?.name || 'Unknown';
        cafeCounts[cafeName] = (cafeCounts[cafeName] || 0) + 1;
      });

      const topCafes = Object.entries(cafeCounts)
        .map(([name, orders]) => ({ name, orders }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      setUserStats({
        totalUsers,
        activeUsers: uniqueActiveUsers,
        newUsersToday,
        topCafes
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setErrors(prev => [...prev, `User Stats: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    }
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    setErrors([]);
    setLastUpdated(new Date());
    
    await Promise.all([
      fetchSystemMetrics(),
      fetchOrderStats(),
      fetchUserStats()
    ]);
    
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AdminAccessControl>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Real-time system monitoring for Pulkit Verma</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
              <Button onClick={refreshAllData} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {errors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Errors detected:</strong>
              <ul className="mt-2 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* System Health Overview */}
        {systemMetrics && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${getHealthColor(systemMetrics.systemHealth)}`}>
                    {getHealthIcon(systemMetrics.systemHealth)}
                    <span className="font-semibold capitalize">{systemMetrics.systemHealth}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Connection Pool: {systemMetrics.connectionPoolStatus.availableClients}/{systemMetrics.connectionPoolStatus.totalClients} available
                  </div>
                  {systemMetrics.connectionPoolStatus.waitingRequests > 0 && (
                    <Badge variant="destructive">
                      {systemMetrics.connectionPoolStatus.waitingRequests} waiting
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Today's Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemMetrics?.totalOrdersToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemMetrics?.activeCafes || 0} active cafes
                  </p>
                </CardContent>
              </Card>

              {/* Average Order Value */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{systemMetrics?.avgOrderValue?.toFixed(0) || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Peak hour: {systemMetrics?.peakHour || 0}:00
                  </p>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.activeUsers || 0} active today
                  </p>
                </CardContent>
              </Card>

              {/* New Users Today */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats?.newUsersToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Cafes */}
            {userStats?.topCafes && userStats.topCafes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Cafes Today</CardTitle>
                  <CardDescription>Most popular cafes by order count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userStats.topCafes.map((cafe, index) => (
                      <div key={cafe.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{cafe.name}</span>
                        </div>
                        <Badge variant="secondary">{cafe.orders} orders</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {orderStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderStats.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{orderStats.pendingOrders}</div>
                    <p className="text-xs text-muted-foreground">Awaiting processing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{orderStats.completedOrders}</div>
                    <p className="text-xs text-muted-foreground">Successfully delivered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{orderStats.cancelledOrders}</div>
                    <p className="text-xs text-muted-foreground">Cancelled orders</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {orderStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">₹{orderStats.totalRevenue.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">
                      From {orderStats.totalOrders} orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Order Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{orderStats.avgOrderTime} min</div>
                    <p className="text-sm text-muted-foreground">
                      From order to completion
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                    <CardDescription>All registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userStats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Today</CardTitle>
                    <CardDescription>Users who placed orders today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{userStats.activeUsers}</div>
                    <p className="text-sm text-muted-foreground">
                      {((userStats.activeUsers / userStats.totalUsers) * 100).toFixed(1)}% of total users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>New Registrations</CardTitle>
                    <CardDescription>Users who joined today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{userStats.newUsersToday}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            {systemMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Connection Pool */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Connection Pool</CardTitle>
                    <CardDescription>Standard connection management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Connections</span>
                      <span className="font-mono">{systemMetrics.connectionPoolStatus.totalClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available</span>
                      <span className="font-mono text-green-600">{systemMetrics.connectionPoolStatus.availableClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Use</span>
                      <span className="font-mono text-blue-600">{systemMetrics.connectionPoolStatus.inUseClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting</span>
                      <span className={`font-mono ${systemMetrics.connectionPoolStatus.waitingRequests > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {systemMetrics.connectionPoolStatus.waitingRequests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization</span>
                      <span className="font-mono">{systemMetrics.connectionPoolStatus.utilizationPercentage || 0}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Connection Manager */}
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Pool</CardTitle>
                    <CardDescription>High-scale connection management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Connections</span>
                      <span className="font-mono">{systemMetrics?.advancedMetrics?.totalConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active</span>
                      <span className="font-mono text-blue-600">{systemMetrics?.advancedMetrics?.activeConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available</span>
                      <span className="font-mono text-green-600">{systemMetrics?.advancedMetrics?.availableConnections || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting</span>
                      <span className={`font-mono ${(systemMetrics?.advancedMetrics?.waitingRequests || 0) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {systemMetrics?.advancedMetrics?.waitingRequests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Concurrency</span>
                      <span className="font-mono text-purple-600">{systemMetrics?.advancedMetrics?.peakConcurrency || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-mono">{Math.round(systemMetrics?.advancedMetrics?.avgResponseTime || 0)}ms</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Connection Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>Connection Health</CardTitle>
                    <CardDescription>System performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <Badge variant={systemMetrics?.advancedMetrics?.healthStatus === 'healthy' ? 'default' : 'destructive'}>
                        {systemMetrics?.advancedMetrics?.healthStatus || 'unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization</span>
                      <span className="font-mono">{systemMetrics?.advancedMetrics?.utilizationPercentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queue Utilization</span>
                      <span className="font-mono">{systemMetrics?.advancedMetrics?.queueUtilizationPercentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connection Errors</span>
                      <span className="font-mono text-red-600">{systemMetrics?.advancedMetrics?.connectionErrors || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Is Scaling</span>
                      <span className="font-mono">{systemMetrics?.advancedMetrics?.isScaling ? 'Yes' : 'No'}</span>
                    </div>
                    {(systemMetrics?.advancedMetrics?.queueAge || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Oldest Queue Item</span>
                        <span className="font-mono text-orange-600">{Math.round((systemMetrics?.advancedMetrics?.queueAge || 0) / 1000)}s</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Connection Capacity Info */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Capacity</CardTitle>
                <CardDescription>Current system limits and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Current Limits</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Supabase Pro:</strong> 500 max connections</li>
                      <li>• <strong>Basic Pool:</strong> 10 connections</li>
                      <li>• <strong>Advanced Pool:</strong> 20-100 connections (auto-scaling)</li>
                      <li>• <strong>Waiting Queue:</strong> 100 max requests</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Performance Targets</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Target:</strong> 500 concurrent users</li>
                      <li>• <strong>Response Time:</strong> &lt; 500ms average</li>
                      <li>• <strong>Utilization:</strong> &lt; 80% for healthy operation</li>
                      <li>• <strong>Queue Time:</strong> &lt; 5 seconds wait time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            {systemMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Performance</CardTitle>
                    <CardDescription>Connection pool status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Connections</span>
                      <span className="font-mono">{systemMetrics.connectionPoolStatus.totalClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available</span>
                      <span className="font-mono text-green-600">{systemMetrics.connectionPoolStatus.availableClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Use</span>
                      <span className="font-mono text-blue-600">{systemMetrics.connectionPoolStatus.inUseClients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting</span>
                      <span className={`font-mono ${systemMetrics.connectionPoolStatus.waitingRequests > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {systemMetrics.connectionPoolStatus.waitingRequests}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Overall system status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <Badge variant={systemMetrics.systemHealth === 'healthy' ? 'default' : 'destructive'}>
                        {systemMetrics.systemHealth}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders Today</span>
                      <span className="font-mono">{systemMetrics.totalOrdersToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Cafes</span>
                      <span className="font-mono">{systemMetrics.activeCafes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Hour</span>
                      <span className="font-mono">{systemMetrics.peakHour}:00</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminAccessControl>
  );
};

export default AdminDashboard;
