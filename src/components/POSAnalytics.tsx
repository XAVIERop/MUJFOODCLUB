import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart,
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
}

const POSAnalytics: React.FC<POSAnalyticsProps> = ({
  orders,
  orderItems,
  loading = false
}) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Filter orders based on time range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let startDate: Date;
    switch (timeRange) {
      case 'today':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = startOfWeek;
        break;
      case 'month':
        startDate = startOfMonth;
        break;
      case 'year':
        startDate = startOfYear;
        break;
      default:
        startDate = startOfWeek;
    }

    return orders.filter(order => new Date(order.created_at) >= startDate);
  }, [orders, timeRange]);

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

  const formatTimeRange = (range: string) => {
    switch (range) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  const handleDownloadAnalytics = () => {
    try {
      const analyticsData = {
        timeRange: formatTimeRange(timeRange),
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
        description: `Successfully downloaded ${formatTimeRange(timeRange)} analytics data`,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleDownloadAnalytics} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {formatTimeRange(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatTimeRange(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Orders completed successfully
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default POSAnalytics;
