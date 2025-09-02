import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByHour: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface SalesDashboardProps {
  cafeId: string;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ cafeId }) => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Mock data for demonstration - replace with actual API calls
  const mockSalesData: SalesData = {
    totalRevenue: 45241,
    totalOrders: 156,
    averageOrderValue: 290.01,
    todayRevenue: 3240,
    todayOrders: 12,
    weeklyRevenue: 18750,
    monthlyRevenue: 45241,
    topItems: [
      { name: 'Cappuccino', quantity: 45, revenue: 3150 },
      { name: 'Grilled Sandwich', quantity: 38, revenue: 3040 },
      { name: 'Masala Dosa', quantity: 32, revenue: 3840 },
      { name: 'Coffee', quantity: 67, revenue: 2680 },
      { name: 'Pizza', quantity: 28, revenue: 2240 }
    ],
    revenueByHour: [
      { hour: 8, revenue: 450, orders: 3 },
      { hour: 9, revenue: 680, orders: 4 },
      { hour: 10, revenue: 890, orders: 5 },
      { hour: 11, revenue: 1200, orders: 7 },
      { hour: 12, revenue: 2100, orders: 12 },
      { hour: 13, revenue: 1800, orders: 10 },
      { hour: 14, revenue: 950, orders: 6 },
      { hour: 15, revenue: 1100, orders: 7 },
      { hour: 16, revenue: 1350, orders: 8 },
      { hour: 17, revenue: 1600, orders: 9 },
      { hour: 18, revenue: 1900, orders: 11 },
      { hour: 19, revenue: 2100, orders: 12 },
      { hour: 20, revenue: 1800, orders: 10 },
      { hour: 21, revenue: 1200, orders: 7 },
      { hour: 22, revenue: 800, orders: 5 }
    ],
    revenueByDay: [
      { date: 'Mon', revenue: 8500, orders: 45 },
      { date: 'Tue', revenue: 9200, orders: 52 },
      { date: 'Wed', revenue: 7800, orders: 38 },
      { date: 'Thu', revenue: 10500, orders: 58 },
      { date: 'Fri', revenue: 12000, orders: 65 },
      { date: 'Sat', revenue: 13500, orders: 72 },
      { date: 'Sun', revenue: 9800, orders: 48 }
    ]
  };

  useEffect(() => {
    fetchSalesData();
  }, [cafeId, timeRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSalesData(mockSalesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getRevenueChange = (current: number, previous: number) => {
    if (previous === 0) return { change: 100, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { change: Math.abs(change), isPositive: change >= 0 };
  };

  const exportSalesReport = () => {
    // Generate and download CSV report
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Sales report has been downloaded successfully",
    });
  };

  const generateCSVReport = () => {
    if (!salesData) return '';
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', formatCurrency(salesData.totalRevenue)],
      ['Total Orders', salesData.totalOrders.toString()],
      ['Average Order Value', formatCurrency(salesData.averageOrderValue)],
      ['Today Revenue', formatCurrency(salesData.todayRevenue)],
      ['Today Orders', salesData.todayOrders.toString()]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!salesData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sales data available</p>
      </div>
    );
  }

  const todayChange = getRevenueChange(salesData.todayRevenue, salesData.weeklyRevenue / 7);
  const weeklyChange = getRevenueChange(salesData.weeklyRevenue, salesData.monthlyRevenue / 4);

  return (
    <div className="sales-dashboard space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sales Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time insights into your cafe performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSalesData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportSalesReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(salesData.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Performance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesData.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {salesData.todayOrders} orders today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today vs Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {formatCurrency(salesData.todayRevenue)}
              </div>
              <div className="flex items-center space-x-1">
                {todayChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={todayChange.isPositive ? "default" : "destructive"}>
                  {todayChange.isPositive ? '+' : '-'}{todayChange.change.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(salesData.weeklyRevenue / 7)} daily average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly vs Monthly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {formatCurrency(salesData.weeklyRevenue)}
              </div>
              <div className="flex items-center space-x-1">
                {weeklyChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={weeklyChange.isPositive ? "default" : "destructive"}>
                  {weeklyChange.isPositive ? '+' : '-'}{weeklyChange.change.toFixed(1)}%
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs {formatCurrency(salesData.monthlyRevenue / 4)} weekly average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top-items">Top Items</TabsTrigger>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(salesData.todayRevenue / salesData.monthlyRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(salesData.todayRevenue)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Week</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(salesData.weeklyRevenue / salesData.monthlyRevenue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(salesData.weeklyRevenue)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-full"></div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(salesData.monthlyRevenue)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Orders</span>
                    <span className="font-medium">{formatNumber(salesData.totalOrders)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today's Orders</span>
                    <span className="font-medium">{formatNumber(salesData.todayOrders)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Order Value</span>
                    <span className="font-medium">{formatCurrency(salesData.averageOrderValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">{(salesData.todayOrders / salesData.totalOrders * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.revenue / item.quantity)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Hourly Revenue Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.revenueByHour.map((hourData) => (
                  <div key={hourData.hour} className="flex items-center justify-between">
                    <span className="text-sm w-12">
                      {hourData.hour}:00
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${(hourData.revenue / Math.max(...salesData.revenueByHour.map(h => h.revenue))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right w-20">
                      <p className="font-medium">{formatCurrency(hourData.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {hourData.orders} orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Revenue Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.revenueByDay.map((dayData) => (
                  <div key={dayData.date} className="flex items-center justify-between">
                    <span className="text-sm w-12 font-medium">
                      {dayData.date}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${(dayData.revenue / Math.max(...salesData.revenueByDay.map(d => d.revenue))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right w-20">
                      <p className="font-medium">{formatCurrency(dayData.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayData.orders} orders
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

export default SalesDashboard;
