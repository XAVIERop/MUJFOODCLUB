import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCafeAnalytics, useMaterializedViewRefresh } from '@/hooks/useSupabasePro';
import { TrendingUp, TrendingDown, Users, Clock, Star, RefreshCw } from 'lucide-react';

interface ProAnalyticsProps {
  cafeId: string;
  days?: number;
}

export const ProAnalytics = ({ cafeId, days = 30 }: ProAnalyticsProps) => {
  const { analytics, loading, error, refetch } = useCafeAnalytics(cafeId, days);
  const { refreshCafePerformance, isRefreshing } = useMaterializedViewRefresh();

  const handleRefresh = async () => {
    await refreshCafePerformance();
    refetch();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading analytics</p>
            <p className="text-sm">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pro Analytics ({days} days)</h3>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.total_orders)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.orders_today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.orders_this_week} orders this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.avg_order_value)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.peak_hours?.[0]?.hour || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.peak_hours?.[0]?.orders || 0} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      {analytics.top_items && analytics.top_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.orders} orders</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Hours Chart */}
      {analytics.peak_hours && analytics.peak_hours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.peak_hours.map((hour: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{hour.hour}:00</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(hour.orders / analytics.peak_hours[0].orders) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{hour.orders} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
