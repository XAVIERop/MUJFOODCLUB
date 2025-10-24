import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Users, 
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Award,
  Clock3,
  Package,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item: {
    name: string;
    description: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  delivery_block: string;
  customer_name?: string;
  phone_number?: string;
  user?: {
    full_name: string;
    phone: string | null;
    block: string;
    email: string;
  };
}

interface POSAnalyticsProps {
  orders: Order[];
  orderItems: {[key: string]: OrderItem[]};
  loading?: boolean;
  // Date range props for synchronization
  dateRange?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'all' | 'custom';
  customDateRange?: { startDate: string; endDate: string };
  onDateRangeChange?: (dateRange: string, customRange?: { startDate: string; endDate: string }) => void;
}

const POSAnalytics: React.FC<POSAnalyticsProps> = ({
  orders,
  orderItems,
  loading = false,
  dateRange: propDateRange = 'today',
  customDateRange: propCustomDateRange = { startDate: '', endDate: '' },
  onDateRangeChange
}) => {
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState('overview');

  // Local state for date range (synced with props)
  const [dateRange, setDateRange] = useState(propDateRange);
  const [customDateRange, setCustomDateRange] = useState(propCustomDateRange);

  // Sync local state with props when they change
  React.useEffect(() => {
    setDateRange(propDateRange);
  }, [propDateRange]);

  React.useEffect(() => {
    setCustomDateRange(propCustomDateRange);
  }, [propCustomDateRange]);

  // Handle date range changes and notify parent
  const handleDateRangeChange = (newDateRange: string) => {
    setDateRange(newDateRange as any);
    onDateRangeChange?.(newDateRange, customDateRange);
  };

  const handleCustomDateRangeChange = (newCustomRange: { startDate: string; endDate: string }) => {
    setCustomDateRange(newCustomRange);
    onDateRangeChange?.(dateRange, newCustomRange);
  };

  // Date range filter function (same as POSDashboard)
  const getDateRangeFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'today':
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        return {
          startDate: startOfToday.toISOString(),
          endDate: endOfToday.toISOString()
        };
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const endOfYesterday = new Date(today);
        endOfYesterday.setHours(0, 0, 0, 0);
        
        return {
          startDate: yesterday.toISOString(),
          endDate: endOfYesterday.toISOString()
        };
      
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(0, 0, 0, 0);
        
        return {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString()
        };
      
      case 'last_week':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        startOfLastWeek.setHours(0, 0, 0, 0);
        
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
        endOfLastWeek.setHours(0, 0, 0, 0);
        
        return {
          startDate: startOfLastWeek.toISOString(),
          endDate: endOfLastWeek.toISOString()
        };
      
      case 'this_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endOfMonth.setHours(0, 0, 0, 0);
        
        return {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        };
      
      case 'custom':
        return {
          startDate: customDateRange.startDate ? new Date(customDateRange.startDate).toISOString() : '',
          endDate: customDateRange.endDate ? new Date(customDateRange.endDate).toISOString() : ''
        };
      
      case 'all':
      default:
        return null; // No date filter
    }
  };

  // Format date range display
  const formatDateRangeDisplay = () => {
    const filter = getDateRangeFilter();
    if (!filter) return 'All Time';
    
    const start = new Date(filter.startDate);
    const end = new Date(filter.endDate);
    
    if (dateRange === 'custom') {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  // Filter orders based on selected date range
  const filteredOrders = useMemo(() => {
    const filter = getDateRangeFilter();
    if (!filter) return orders;
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, dateRange, customDateRange]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');
    const pendingOrders = filteredOrders.filter(order => 
      ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)
    );

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    const completionRate = filteredOrders.length > 0 ? (completedOrders.length / filteredOrders.length) * 100 : 0;
    const cancellationRate = filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0;

    return {
      totalOrders: filteredOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      avgOrderValue,
      completionRate,
      cancellationRate
    };
  }, [filteredOrders]);

  // Calculate hourly order distribution
  const hourlyData = useMemo(() => {
    const hourly = new Array(24).fill(0);
    const hourlyRevenue = new Array(24).fill(0);

    filteredOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourly[hour]++;
      if (order.status === 'completed') {
        hourlyRevenue[hour] += order.total_amount;
      }
    });

    return { hourly, hourlyRevenue };
  }, [filteredOrders]);

  // Calculate daily order distribution for the week
  const dailyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daily = new Array(7).fill(0);
    const dailyRevenue = new Array(7).fill(0);

    filteredOrders.forEach(order => {
      const day = new Date(order.created_at).getDay();
      daily[day]++;
      if (order.status === 'completed') {
        dailyRevenue[day] += order.total_amount;
      }
    });

    return { days, daily, dailyRevenue };
  }, [filteredOrders]);

  // Prepare chart data for Recharts
  const revenueChartData = useMemo(() => {
    return dailyData.days.map((day, index) => ({
      name: day,
      revenue: dailyData.dailyRevenue[index],
      orders: dailyData.daily[index]
    }));
  }, [dailyData]);

  const orderStatusData = useMemo(() => {
    const statusCounts = {
      completed: filteredOrders.filter(order => order.status === 'completed').length,
      pending: filteredOrders.filter(order => ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)).length,
      cancelled: filteredOrders.filter(order => order.status === 'cancelled').length
    };

    return [
      { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
      { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [filteredOrders]);

  // Calculate top performing items
  const topItems = useMemo(() => {
    const itemStats: {[key: string]: { name: string; quantity: number; revenue: number; orders: number }} = {};

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const items = orderItems[order.id] || [];
        items.forEach(item => {
          const key = item.menu_item.name;
          if (!itemStats[key]) {
            itemStats[key] = { name: key, quantity: 0, revenue: 0, orders: 0 };
          }
          itemStats[key].quantity += item.quantity;
          itemStats[key].revenue += item.total_price;
          itemStats[key].orders += 1;
        });
      }
    });

    return Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders, orderItems]);

  // Calculate customer analytics
  const customerAnalytics = useMemo(() => {
    const customerOrders: {[key: string]: { name: string; orders: number; totalSpent: number; lastOrder: string }} = {};

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const customerKey = order.user?.phone || order.phone_number || 'unknown';
        const customerName = order.user?.full_name || order.customer_name || 'Unknown Customer';
        
        if (!customerOrders[customerKey]) {
          customerOrders[customerKey] = {
            name: customerName,
            orders: 0,
            totalSpent: 0,
            lastOrder: order.created_at
          };
        }
        
        customerOrders[customerKey].orders += 1;
        customerOrders[customerKey].totalSpent += order.total_amount;
        if (new Date(order.created_at) > new Date(customerOrders[customerKey].lastOrder)) {
          customerOrders[customerKey].lastOrder = order.created_at;
        }
      }
    });

    return Object.values(customerOrders)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }, [filteredOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // formatTimeRange function removed - no longer needed

  const handleDownloadAnalytics = () => {
    try {
      const analyticsData = {
        timeRange: 'Filtered by Orders page',
        metrics,
        topItems,
        customerAnalytics,
        hourlyData,
        dailyData
      };

      const csvData = [
        ['Metric', 'Value'],
        ['Total Orders', metrics.totalOrders],
        ['Completed Orders', metrics.completedOrders],
        ['Cancelled Orders', metrics.cancelledOrders],
        ['Pending Orders', metrics.pendingOrders],
        ['Total Revenue', formatCurrency(metrics.totalRevenue)],
        ['Average Order Value', formatCurrency(metrics.avgOrderValue)],
        ['Completion Rate', `${metrics.completionRate.toFixed(1)}%`],
        ['Cancellation Rate', `${metrics.cancellationRate.toFixed(1)}%`]
      ];

      const csvString = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pos_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Analytics Downloaded",
        description: "Successfully downloaded analytics data (filtered by Orders page)",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download analytics data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleDownloadAnalytics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">📅 Date Range:</span>
            <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
              {formatDateRangeDisplay()}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Date Range Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRange === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('today')}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                variant={dateRange === 'yesterday' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('yesterday')}
                className="text-xs"
              >
                Yesterday
              </Button>
              <Button
                variant={dateRange === 'this_week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('this_week')}
                className="text-xs"
              >
                This Week
              </Button>
              <Button
                variant={dateRange === 'last_week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('last_week')}
                className="text-xs"
              >
                Last Week
              </Button>
              <Button
                variant={dateRange === 'this_month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('this_month')}
                className="text-xs"
              >
                This Month
              </Button>
              <Button
                variant={dateRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('all')}
                className="text-xs"
              >
                All Time
              </Button>
            </div>
            
            {/* Custom Date Range */}
            <div className="flex items-center gap-2">
              <Button
                variant={dateRange === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange('custom')}
                className="text-xs"
              >
                Custom
              </Button>
            </div>
          </div>
        </div>
        
        {/* Custom Date Range Inputs */}
        {dateRange === 'custom' && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="text-sm font-medium text-blue-800">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => handleCustomDateRangeChange({ ...customDateRange, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm font-medium text-blue-800">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => handleCustomDateRangeChange({ ...customDateRange, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Key Metrics - Single Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                <p className="text-xs text-muted-foreground">{formatDateRangeDisplay()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">{formatDateRangeDisplay()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.avgOrderValue)}</p>
                <p className="text-xs text-muted-foreground">Per completed order</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Orders completed successfully</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(Number(value)) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'Completed', count: metrics.completedOrders, color: 'bg-green-500' },
                    { status: 'Pending', count: metrics.pendingOrders, color: 'bg-yellow-500' },
                    { status: 'Cancelled', count: metrics.cancelledOrders, color: 'bg-red-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${metrics.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{metrics.completionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cancellation Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${metrics.cancellationRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{metrics.cancellationRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hourly Order Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hourly Order Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hourlyData.hourly.map((count, hour) => (
                    <div key={hour} className="flex items-center gap-2">
                      <span className="text-xs w-8">{hour}:00</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${count > 0 ? Math.max((count / Math.max(...hourlyData.hourly)) * 100, 5) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Order Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Order Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dailyData.days.map((day, index) => (
                    <div key={day} className="flex items-center gap-2">
                      <span className="text-xs w-8">{day}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${dailyData.daily[index] > 0 ? Math.max((dailyData.daily[index] / Math.max(...dailyData.daily)) * 100, 5) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs w-8 text-right">{dailyData.daily[index]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top Performing Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} sold • {item.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.revenue / item.quantity)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerAnalytics.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.orders} orders • Last: {new Date(customer.lastOrder).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(customer.totalSpent)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(customer.totalSpent / customer.orders)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Completion Rate</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{metrics.completionRate.toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Avg Order Value</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(metrics.avgOrderValue)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Peak Hours</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {hourlyData.hourly.indexOf(Math.max(...hourlyData.hourly))}:00
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Business Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Business Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.completionRate < 80 && (
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm font-medium text-yellow-800">Improve Order Completion</p>
                    <p className="text-xs text-yellow-700">Consider optimizing kitchen workflow to reduce cancellations</p>
                  </div>
                )}
                
                {metrics.avgOrderValue < 200 && (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm font-medium text-blue-800">Increase Order Value</p>
                    <p className="text-xs text-blue-700">Promote combo meals or upselling to boost average order value</p>
                  </div>
                )}

                {topItems.length > 0 && (
                  <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <p className="text-sm font-medium text-green-800">Top Performer</p>
                    <p className="text-xs text-green-700">"{topItems[0]?.name}" is your best-selling item - consider promoting it more</p>
                  </div>
                )}

                {customerAnalytics.length > 0 && (
                  <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                    <p className="text-sm font-medium text-purple-800">Customer Insights</p>
                    <p className="text-xs text-purple-700">You have {customerAnalytics.length} active customers this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5" />
                Real-time Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.completedOrders}</div>
                  <div className="text-sm text-green-700">Completed Today</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.pendingOrders}</div>
                  <div className="text-sm text-yellow-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalRevenue)}</div>
                  <div className="text-sm text-blue-700">Revenue Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default POSAnalytics;
