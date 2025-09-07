import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Star, 
  MapPin,
  CreditCard,
  Package,
  Trophy,
  Target
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_block: string;
  payment_method: string;
  points_earned: number;
  created_at: string;
  cafe: {
    name: string;
    location: string;
  };
}

interface OrderAnalyticsProps {
  orders: Order[];
}

const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({ orders }) => {
  const analytics = useMemo(() => {
    if (orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        totalPoints: 0,
        favoriteCafe: null,
        mostUsedPayment: null,
        mostUsedBlock: null,
        orderTrend: 'stable',
        completionRate: 0,
        monthlySpending: 0,
        weeklySpending: 0,
        dailySpending: 0
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Basic stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalSpent / totalOrders;
    const totalPoints = orders.reduce((sum, order) => sum + order.points_earned, 0);

    // Cafe analysis
    const cafeCounts = orders.reduce((acc, order) => {
      acc[order.cafe.name] = (acc[order.cafe.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteCafe = Object.entries(cafeCounts).reduce((a, b) => 
      cafeCounts[a[0]] > cafeCounts[b[0]] ? a : b
    );

    // Payment method analysis
    const paymentCounts = orders.reduce((acc, order) => {
      acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedPayment = Object.entries(paymentCounts).reduce((a, b) => 
      paymentCounts[a[0]] > paymentCounts[b[0]] ? a : b
    );

    // Delivery block analysis
    const blockCounts = orders.reduce((acc, order) => {
      acc[order.delivery_block] = (acc[order.delivery_block] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedBlock = Object.entries(blockCounts).reduce((a, b) => 
      blockCounts[a[0]] > blockCounts[b[0]] ? a : b
    );

    // Completion rate
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const completionRate = (completedOrders / totalOrders) * 100;

    // Time-based spending
    const monthlySpending = orders
      .filter(order => new Date(order.created_at) >= thisMonth)
      .reduce((sum, order) => sum + order.total_amount, 0);

    const weeklySpending = orders
      .filter(order => new Date(order.created_at) >= thisWeek)
      .reduce((sum, order) => sum + order.total_amount, 0);

    const dailySpending = orders
      .filter(order => new Date(order.created_at) >= today)
      .reduce((sum, order) => sum + order.total_amount, 0);

    // Order trend (comparing last 30 days vs previous 30 days)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const recentOrders = orders.filter(order => new Date(order.created_at) >= last30Days).length;
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= previous30Days && orderDate < last30Days;
    }).length;

    let orderTrend: 'up' | 'down' | 'stable' = 'stable';
    if (recentOrders > previousOrders) orderTrend = 'up';
    else if (recentOrders < previousOrders) orderTrend = 'down';

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      totalPoints,
      favoriteCafe: favoriteCafe[0],
      mostUsedPayment: mostUsedPayment[0],
      mostUsedBlock: mostUsedBlock[0],
      orderTrend,
      completionRate,
      monthlySpending,
      weeklySpending,
      dailySpending
    };
  }, [orders]);

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Order Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No order data available yet. Place your first order to see analytics!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₹{analytics.totalSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Order</p>
                <p className="text-2xl font-bold">₹{analytics.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="text-2xl font-bold">{analytics.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.dailySpending}</div>
            <p className="text-xs text-muted-foreground">Orders placed today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.weeklySpending}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.monthlySpending}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Favorite Cafe</span>
              <Badge variant="secondary">{analytics.favoriteCafe}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preferred Payment</span>
              <Badge variant="secondary">{analytics.mostUsedPayment}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Most Used Block</span>
              <Badge variant="secondary">{analytics.mostUsedBlock}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Order Trend</span>
              <div className="flex items-center">
                {analytics.orderTrend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                {analytics.orderTrend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                {analytics.orderTrend === 'stable' && <Clock className="w-4 h-4 text-gray-500 mr-1" />}
                <span className="text-sm capitalize">{analytics.orderTrend}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <Badge variant="outline">{analytics.completionRate.toFixed(1)}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.completionRate.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Order Completion Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.totalOrders}
              </div>
              <p className="text-sm text-muted-foreground">Total Orders Placed</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ₹{analytics.averageOrderValue.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderAnalytics;
