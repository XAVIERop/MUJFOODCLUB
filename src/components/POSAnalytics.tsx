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
  Star,
  Layers,
  Truck
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
    category?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  delivery_block: string;
  order_type?: string; // 'delivery' | 'dine_in' | 'takeaway' | 'table_order'
  accepted_at?: string;
  preparing_at?: string;
  out_for_delivery_at?: string;
  completed_at?: string;
  status_updated_at?: string;
  customer_name?: string;
  phone_number?: string;
  payment_method?: string;
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

  // Calculate operational time metrics
  const operationalMetrics = useMemo(() => {
    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    
    // Calculate average preparation time (preparing_at - accepted_at)
    const preparationTimes: number[] = [];
    completedOrders.forEach(order => {
      if (order.accepted_at && order.preparing_at) {
        const prepTime = new Date(order.preparing_at).getTime() - new Date(order.accepted_at).getTime();
        if (prepTime > 0) {
          preparationTimes.push(prepTime / 1000 / 60); // Convert to minutes
        }
      }
    });
    
    // Calculate average delivery time (completed_at - out_for_delivery_at)
    const deliveryTimes: number[] = [];
    completedOrders.forEach(order => {
      if (order.out_for_delivery_at && order.completed_at) {
        const delTime = new Date(order.completed_at).getTime() - new Date(order.out_for_delivery_at).getTime();
        if (delTime > 0) {
          deliveryTimes.push(delTime / 1000 / 60); // Convert to minutes
        }
      }
    });
    
    // Calculate total fulfillment time (completed_at - created_at)
    const fulfillmentTimes: number[] = [];
    completedOrders.forEach(order => {
      if (order.created_at && order.completed_at) {
        const fulfillTime = new Date(order.completed_at).getTime() - new Date(order.created_at).getTime();
        if (fulfillTime > 0) {
          fulfillmentTimes.push(fulfillTime / 1000 / 60); // Convert to minutes
        }
      }
    });
    
    return {
      avgPreparationTime: preparationTimes.length > 0 
        ? preparationTimes.reduce((a, b) => a + b, 0) / preparationTimes.length 
        : 0,
      avgDeliveryTime: deliveryTimes.length > 0 
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length 
        : 0,
      avgFulfillmentTime: fulfillmentTimes.length > 0 
        ? fulfillmentTimes.reduce((a, b) => a + b, 0) / fulfillmentTimes.length 
        : 0,
      ordersWithPrepTime: preparationTimes.length,
      ordersWithDeliveryTime: deliveryTimes.length,
      totalCompletedOrders: completedOrders.length
    };
  }, [filteredOrders]);

  // Calculate revenue trends and comparisons
  const revenueTrends = useMemo(() => {
    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    const currentRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const currentOrderCount = completedOrders.length;
    
    // Get date range for current period
    const currentDateRange = getDateRangeFilter();
    if (!currentDateRange) {
      return { 
        currentRevenue: 0, 
        currentOrders: 0, 
        previousRevenue: 0, 
        previousOrders: 0, 
        revenueGrowth: 0, 
        orderGrowth: 0 
      };
    }
    
    const startDate = new Date(currentDateRange.startDate);
    const endDate = new Date(currentDateRange.endDate);
    const periodDuration = endDate.getTime() - startDate.getTime();
    
    // Calculate previous period (same duration, before current period)
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = new Date(startDate.getTime());
    
    // Filter orders for previous period
    const previousPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= previousStartDate && orderDate < previousEndDate && order.status === 'completed';
    });
    
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const previousOrderCount = previousPeriodOrders.length;
    
    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0;
    
    const orderGrowth = previousOrderCount > 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
      : currentOrderCount > 0 ? 100 : 0;
    
    return {
      currentRevenue: currentRevenue || 0,
      currentOrders: currentOrderCount || 0,
      previousRevenue: previousRevenue || 0,
      previousOrders: previousOrderCount || 0,
      revenueGrowth: isNaN(revenueGrowth) ? 0 : revenueGrowth,
      orderGrowth: isNaN(orderGrowth) ? 0 : orderGrowth
    };
  }, [filteredOrders, orders, dateRange, customDateRange]);

  // Calculate order type performance
  const orderTypeMetrics = useMemo(() => {
    const typeStats: {[key: string]: { count: number; revenue: number; avgValue: number }} = {};
    
    filteredOrders.forEach(order => {
      const orderType = order.order_type || 'unknown';
      
      if (!typeStats[orderType]) {
        typeStats[orderType] = { count: 0, revenue: 0, avgValue: 0 };
      }
      
      typeStats[orderType].count += 1;
      
      if (order.status === 'completed') {
        typeStats[orderType].revenue += order.total_amount;
      }
    });
    
    // Calculate average order value per type
    Object.keys(typeStats).forEach(type => {
      const completedCount = filteredOrders.filter(
        o => (o.order_type || 'unknown') === type && o.status === 'completed'
      ).length;
      typeStats[type].avgValue = completedCount > 0 
        ? typeStats[type].revenue / completedCount 
        : 0;
    });
    
    return typeStats;
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

  // Calculate category performance analytics
  const categoryPerformance = useMemo(() => {
    const categoryStats: {[key: string]: { 
      category: string; 
      revenue: number; 
      orderIds: Set<string>;
      itemsSold: number;
    }} = {};

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const items = orderItems[order.id] || [];
        const categoriesInOrder = new Set<string>();
        
        items.forEach(item => {
          const category = item.menu_item?.category || 'Uncategorized';
          categoriesInOrder.add(category);
          
          if (!categoryStats[category]) {
            categoryStats[category] = {
              category,
              revenue: 0,
              orderIds: new Set<string>(),
              itemsSold: 0
            };
          }
          categoryStats[category].revenue += item.total_price;
          categoryStats[category].itemsSold += item.quantity;
        });
        
        // Track unique orders per category
        categoriesInOrder.forEach(category => {
          categoryStats[category].orderIds.add(order.id);
        });
      }
    });

    // Convert to final format with order counts and averages
    return Object.values(categoryStats)
      .map(stats => ({
        category: stats.category,
        revenue: stats.revenue,
        orders: stats.orderIds.size,
        itemsSold: stats.itemsSold,
        avgOrderValue: stats.orderIds.size > 0 ? stats.revenue / stats.orderIds.size : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, orderItems]);

  // Calculate location/block analytics
  const locationAnalytics = useMemo(() => {
    const locationStats: {[key: string]: { 
      location: string; 
      revenue: number; 
      orders: number;
      avgOrderValue: number;
    }} = {};

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        // Use delivery_block or fallback to order_type for dine-in/takeaway
        let location = order.delivery_block || order.order_type || 'Unknown';
        
        // Format location name for better display
        if (location === 'DINE_IN') {
          location = 'Dine-In';
        } else if (location === 'TAKEAWAY') {
          location = 'Takeaway';
        } else if (location === 'OFF_CAMPUS') {
          location = 'Off-Campus';
        } else if (location === 'table_order') {
          location = 'Table Order';
        }
        
        if (!locationStats[location]) {
          locationStats[location] = {
            location,
            revenue: 0,
            orders: 0,
            avgOrderValue: 0
          };
        }
        
        locationStats[location].revenue += order.total_amount;
        locationStats[location].orders += 1;
      }
    });

    // Calculate average order value per location
    Object.keys(locationStats).forEach(location => {
      const stats = locationStats[location];
      stats.avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;
    });

    return Object.values(locationStats)
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Calculate payment method analytics
  const paymentMethodAnalytics = useMemo(() => {
    const paymentStats: {[key: string]: { 
      method: string; 
      revenue: number; 
      orders: number;
      avgOrderValue: number;
      percentage: number;
    }} = {};

    const completedOrders = filteredOrders.filter(order => order.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);

    completedOrders.forEach(order => {
      const method = order.payment_method || 'Unknown';
      
      if (!paymentStats[method]) {
        paymentStats[method] = {
          method,
          revenue: 0,
          orders: 0,
          avgOrderValue: 0,
          percentage: 0
        };
      }
      
      paymentStats[method].revenue += order.total_amount;
      paymentStats[method].orders += 1;
    });

    // Calculate averages and percentages
    Object.keys(paymentStats).forEach(method => {
      const stats = paymentStats[method];
      stats.avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;
      stats.percentage = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0;
    });

    // Format method names for display
    const formattedStats = Object.values(paymentStats).map(stats => ({
      ...stats,
      method: stats.method === 'cod' ? 'Cash on Delivery' 
        : stats.method === 'online' ? 'Online Payment'
        : stats.method === 'upi' ? 'UPI'
        : stats.method === 'card' ? 'Card Payment'
        : stats.method.charAt(0).toUpperCase() + stats.method.slice(1)
    }));

    return formattedStats.sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Calculate new vs returning customers analytics
  const customerRetentionAnalytics = useMemo(() => {
    // Track first order per customer (by phone or user_id) at this cafe
    const customerFirstOrders: {[key: string]: string} = {}; // customer_key -> first order id
    const customerOrderCounts: {[key: string]: number} = {}; // customer_key -> order count
    const customerRevenue: {[key: string]: number} = {}; // customer_key -> total revenue
    
    let newCustomers = 0;
    let returningCustomers = 0;
    let newCustomerRevenue = 0;
    let returningCustomerRevenue = 0;

    // Sort orders by date to identify first orders correctly
    const sortedOrders = [...filteredOrders].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sortedOrders.forEach(order => {
      if (order.status === 'completed') {
        // Use phone number or user_id as customer identifier
        const customerKey = order.phone_number || order.user?.phone || order.user?.email || order.customer_name || 'unknown';
        
        // Check if this is the first order from this customer
        if (!customerFirstOrders[customerKey]) {
          customerFirstOrders[customerKey] = order.id;
          newCustomers++;
          newCustomerRevenue += order.total_amount;
        } else {
          returningCustomers++;
          returningCustomerRevenue += order.total_amount;
        }
        
        // Track order counts and revenue
        if (!customerOrderCounts[customerKey]) {
          customerOrderCounts[customerKey] = 0;
          customerRevenue[customerKey] = 0;
        }
        customerOrderCounts[customerKey]++;
        customerRevenue[customerKey] += order.total_amount;
      }
    });

    const totalCustomers = newCustomers + returningCustomers;
    const totalRevenue = newCustomerRevenue + returningCustomerRevenue;
    const newCustomerPercentage = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;
    const returningCustomerPercentage = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    
    // Calculate average order value
    const newCustomerAvgOrder = newCustomers > 0 ? newCustomerRevenue / newCustomers : 0;
    const returningCustomerAvgOrder = returningCustomers > 0 ? returningCustomerRevenue / returningCustomers : 0;
    
    // Calculate repeat rate
    const repeatRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    return {
      newCustomers,
      returningCustomers,
      totalCustomers,
      newCustomerRevenue,
      returningCustomerRevenue,
      totalRevenue,
      newCustomerPercentage,
      returningCustomerPercentage,
      newCustomerAvgOrder,
      returningCustomerAvgOrder,
      repeatRate
    };
  }, [filteredOrders]);

  // Calculate slow-moving items analytics
  const slowMovingItems = useMemo(() => {
    const itemStats: {[key: string]: { 
      name: string; 
      quantity: number; 
      revenue: number; 
      orders: number;
      lastOrdered?: string;
    }} = {};

    // Collect all items with their sales data
    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const items = orderItems[order.id] || [];
        items.forEach(item => {
          const key = item.menu_item.name;
          if (!itemStats[key]) {
            itemStats[key] = { 
              name: key, 
              quantity: 0, 
              revenue: 0, 
              orders: 0 
            };
          }
          itemStats[key].quantity += item.quantity;
          itemStats[key].revenue += item.total_price;
          itemStats[key].orders += 1;
          // Track last order date
          if (!itemStats[key].lastOrdered || new Date(order.created_at) > new Date(itemStats[key].lastOrdered!)) {
            itemStats[key].lastOrdered = order.created_at;
          }
        });
      }
    });

    // Filter for slow-moving items: items with 0-2 orders or low revenue
    const slowItems = Object.values(itemStats)
      .filter(item => item.orders <= 2 || item.revenue < 100) // Items with ≤2 orders or <₹100 revenue
      .sort((a, b) => a.orders - b.orders || a.revenue - b.revenue);

    return slowItems;
  }, [filteredOrders, orderItems]);

  // Calculate cancellation rate analytics
  const cancellationAnalytics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');
    const cancelledCount = cancelledOrders.length;
    const cancelledRevenue = cancelledOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
    const totalRevenue = filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total_amount, 0);
    const revenueLostPercentage = totalRevenue > 0 ? (cancelledRevenue / (totalRevenue + cancelledRevenue)) * 100 : 0;

    return {
      totalOrders,
      cancelledCount,
      cancellationRate,
      cancelledRevenue,
      revenueLostPercentage,
      completedOrders: filteredOrders.filter(order => order.status === 'completed').length
    };
  }, [filteredOrders]);

  // Calculate average items per order
  const itemsPerOrderAnalytics = useMemo(() => {
    let totalItems = 0;
    let totalOrders = 0;
    const itemsByOrderType: {[key: string]: { items: number; orders: number }} = {};

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const items = orderItems[order.id] || [];
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        totalItems += itemCount;
        totalOrders += 1;

        const orderType = order.order_type || 'unknown';
        if (!itemsByOrderType[orderType]) {
          itemsByOrderType[orderType] = { items: 0, orders: 0 };
        }
        itemsByOrderType[orderType].items += itemCount;
        itemsByOrderType[orderType].orders += 1;
      }
    });

    const avgItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;
    
    // Calculate average per order type
    const avgByOrderType = Object.keys(itemsByOrderType).map(type => ({
      type: type === 'dine_in' ? 'Dine-In' 
        : type === 'delivery' ? 'Delivery'
        : type === 'takeaway' ? 'Takeaway'
        : type === 'table_order' ? 'Table Order'
        : type.charAt(0).toUpperCase() + type.slice(1),
      avgItems: itemsByOrderType[type].orders > 0 
        ? itemsByOrderType[type].items / itemsByOrderType[type].orders 
        : 0,
      orders: itemsByOrderType[type].orders
    }));

    return {
      avgItemsPerOrder,
      totalItems,
      totalOrders,
      avgByOrderType
    };
  }, [filteredOrders, orderItems]);

  // Calculate best/worst performing days
  const dayPerformanceAnalytics = useMemo(() => {
    const dayStats: {[key: number]: { 
      dayName: string; 
      orders: number; 
      revenue: number;
      avgOrderValue: number;
    }} = {
      0: { dayName: 'Sunday', orders: 0, revenue: 0, avgOrderValue: 0 },
      1: { dayName: 'Monday', orders: 0, revenue: 0, avgOrderValue: 0 },
      2: { dayName: 'Tuesday', orders: 0, revenue: 0, avgOrderValue: 0 },
      3: { dayName: 'Wednesday', orders: 0, revenue: 0, avgOrderValue: 0 },
      4: { dayName: 'Thursday', orders: 0, revenue: 0, avgOrderValue: 0 },
      5: { dayName: 'Friday', orders: 0, revenue: 0, avgOrderValue: 0 },
      6: { dayName: 'Saturday', orders: 0, revenue: 0, avgOrderValue: 0 }
    };

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const day = new Date(order.created_at).getDay();
        dayStats[day].orders += 1;
        dayStats[day].revenue += order.total_amount;
      }
    });

    // Calculate average order value per day
    Object.keys(dayStats).forEach(dayKey => {
      const day = parseInt(dayKey);
      dayStats[day].avgOrderValue = dayStats[day].orders > 0 
        ? dayStats[day].revenue / dayStats[day].orders 
        : 0;
    });

    const dayArray = Object.values(dayStats);
    const bestDay = dayArray.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    );
    const worstDay = dayArray
      .filter(day => day.orders > 0)
      .reduce((worst, current) => 
        current.revenue < worst.revenue ? current : worst,
        dayArray[0]
      );

    return {
      dayStats: dayArray,
      bestDay,
      worstDay,
      totalRevenue: dayArray.reduce((sum, day) => sum + day.revenue, 0),
      totalOrders: dayArray.reduce((sum, day) => sum + day.orders, 0)
    };
  }, [filteredOrders]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                <p className={`text-2xl font-bold ${cancellationAnalytics.cancellationRate > 10 ? 'text-red-600' : cancellationAnalytics.cancellationRate > 5 ? 'text-orange-600' : 'text-green-600'}`}>
                  {cancellationAnalytics.cancellationRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {cancellationAnalytics.cancelledCount} of {cancellationAnalytics.totalOrders} orders
                </p>
              </div>
              <TrendingDown className={`h-8 w-8 ${cancellationAnalytics.cancellationRate > 10 ? 'text-red-600' : cancellationAnalytics.cancellationRate > 5 ? 'text-orange-600' : 'text-muted-foreground'}`} />
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
          {/* Revenue Trends Comparison */}
          {revenueTrends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue:</span>
                        <span className="text-lg font-bold">{formatCurrency(revenueTrends.currentRevenue || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Orders:</span>
                        <span className="text-lg font-bold">{revenueTrends.currentOrders || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDateRangeDisplay()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Previous Period</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue:</span>
                        <span className="text-lg font-bold">{formatCurrency(revenueTrends.previousRevenue || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Orders:</span>
                        <span className="text-lg font-bold">{revenueTrends.previousOrders || 0}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Revenue Growth:</span>
                          <Badge 
                            variant={(revenueTrends.revenueGrowth || 0) >= 0 ? "default" : "destructive"}
                            className={(revenueTrends.revenueGrowth || 0) >= 0 ? "bg-green-500" : ""}
                          >
                            {revenueTrends.revenueGrowth !== undefined && revenueTrends.revenueGrowth !== null && !isNaN(revenueTrends.revenueGrowth)
                              ? `${(revenueTrends.revenueGrowth || 0) >= 0 ? '+' : ''}${(revenueTrends.revenueGrowth || 0).toFixed(1)}%`
                              : 'N/A'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Order Growth:</span>
                          <Badge 
                            variant={(revenueTrends.orderGrowth || 0) >= 0 ? "default" : "destructive"}
                            className={(revenueTrends.orderGrowth || 0) >= 0 ? "bg-green-500" : ""}
                          >
                            {revenueTrends.orderGrowth !== undefined && revenueTrends.orderGrowth !== null && !isNaN(revenueTrends.orderGrowth)
                              ? `${(revenueTrends.orderGrowth || 0) >= 0 ? '+' : ''}${(revenueTrends.orderGrowth || 0).toFixed(1)}%`
                              : 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  Hourly Performance
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Orders and revenue by hour
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hourlyData.hourly.map((count, hour) => {
                    const maxCount = Math.max(...hourlyData.hourly.filter(c => c > 0), 1);
                    const maxRevenue = Math.max(...hourlyData.hourlyRevenue.filter(r => r > 0), 1);
                    const revenue = hourlyData.hourlyRevenue[hour];
                    
                    return (
                      <div key={hour} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-medium">{hour}:00</span>
                          <div className="flex gap-3">
                            <span>{count} orders</span>
                            {revenue > 0 && <span>{formatCurrency(revenue)}</span>}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-12 text-muted-foreground">Orders:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                                className="bg-blue-500 h-2 rounded-full transition-all" 
                                style={{ width: `${count > 0 ? Math.max((count / maxCount) * 100, 5) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                          {revenue > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs w-12 text-muted-foreground">Revenue:</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all" 
                                  style={{ width: `${Math.max((revenue / maxRevenue) * 100, 5)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

          {/* Operational Time Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock3 className="w-5 h-5" />
                  Avg Preparation Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {operationalMetrics.avgPreparationTime > 0 
                      ? `${operationalMetrics.avgPreparationTime.toFixed(1)} min`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {operationalMetrics.ordersWithPrepTime} orders tracked
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="w-5 h-5" />
                  Avg Delivery Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {operationalMetrics.avgDeliveryTime > 0 
                      ? `${operationalMetrics.avgDeliveryTime.toFixed(1)} min`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {operationalMetrics.ordersWithDeliveryTime} orders tracked
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-5 h-5" />
                  Avg Fulfillment Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {operationalMetrics.avgFulfillmentTime > 0 
                      ? `${operationalMetrics.avgFulfillmentTime.toFixed(1)} min`
                      : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total order to completion
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cancellation Analysis */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Cancellation Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cancellation Rate</p>
                  <p className={`text-2xl font-bold ${cancellationAnalytics.cancellationRate > 10 ? 'text-red-700' : cancellationAnalytics.cancellationRate > 5 ? 'text-orange-700' : 'text-green-700'}`}>
                    {cancellationAnalytics.cancellationRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cancellationAnalytics.cancelledCount} cancelled orders
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Revenue Lost</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(cancellationAnalytics.cancelledRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cancellationAnalytics.revenueLostPercentage.toFixed(1)}% of potential revenue
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(100 - cancellationAnalytics.cancellationRate).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cancellationAnalytics.completedOrders} completed orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Items per Order */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Average Items per Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Overall Average</p>
                  <p className="text-4xl font-bold text-blue-700">
                    {itemsPerOrderAnalytics.avgItemsPerOrder.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {itemsPerOrderAnalytics.totalItems} items across {itemsPerOrderAnalytics.totalOrders} orders
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">By Order Type</p>
                  {itemsPerOrderAnalytics.avgByOrderType.length > 0 ? (
                    itemsPerOrderAnalytics.avgByOrderType.map((type) => (
                      <div key={type.type} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm font-medium">{type.type}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{type.avgItems.toFixed(1)} items</span>
                          <span className="text-xs text-muted-foreground ml-2">({type.orders} orders)</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best/Worst Performing Days */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Day Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Best Day */}
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900">Best Performing Day</h4>
                    <Badge className="bg-green-600">Top</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-700 mb-1">{dayPerformanceAnalytics.bestDay.dayName}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium">{formatCurrency(dayPerformanceAnalytics.bestDay.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orders:</span>
                      <span className="font-medium">{dayPerformanceAnalytics.bestDay.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Order:</span>
                      <span className="font-medium">{formatCurrency(dayPerformanceAnalytics.bestDay.avgOrderValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Worst Day */}
                {dayPerformanceAnalytics.worstDay.orders > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-900">Lowest Performing Day</h4>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">Needs Attention</Badge>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 mb-1">{dayPerformanceAnalytics.worstDay.dayName}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">{formatCurrency(dayPerformanceAnalytics.worstDay.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-medium">{dayPerformanceAnalytics.worstDay.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Order:</span>
                        <span className="font-medium">{formatCurrency(dayPerformanceAnalytics.worstDay.avgOrderValue)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* All Days Breakdown */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Weekly Breakdown</p>
                {dayPerformanceAnalytics.dayStats.map((day) => (
                  <div key={day.dayName} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium w-20">{day.dayName}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${day.revenue === dayPerformanceAnalytics.bestDay.revenue ? 'bg-green-500' : day.revenue === dayPerformanceAnalytics.worstDay.revenue && day.orders > 0 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          style={{ 
                            width: `${dayPerformanceAnalytics.totalRevenue > 0 ? (day.revenue / dayPerformanceAnalytics.totalRevenue) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <span className="font-medium">{formatCurrency(day.revenue)}</span>
                      <span className="text-muted-foreground ml-2">({day.orders} orders)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Type Performance */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(orderTypeMetrics).map(([type, stats]) => (
                  <div key={type} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                      <Badge variant="secondary">{stats.count}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">{formatCurrency(stats.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Order:</span>
                        <span className="font-medium">{formatCurrency(stats.avgValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-medium">{stats.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(orderTypeMetrics).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No order type data available</p>
              )}
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Category Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue and performance breakdown by menu category
              </p>
            </CardHeader>
            <CardContent>
              {categoryPerformance.length > 0 ? (
                <div className="space-y-4">
                  {categoryPerformance.map((category, index) => {
                    const totalRevenue = categoryPerformance.reduce((sum, c) => sum + c.revenue, 0);
                    const percentage = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
                    
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <h4 className="font-medium">{category.category}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(category.revenue)}</p>
                            <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="ml-1 font-medium">{category.orders}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Items Sold:</span>
                            <span className="ml-1 font-medium">{category.itemsSold}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Order:</span>
                            <span className="ml-1 font-medium">{formatCurrency(category.avgOrderValue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No category data available</p>
              )}
            </CardContent>
          </Card>

          {/* Location/Block Analytics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Location/Block Performance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue breakdown by delivery blocks and order types
              </p>
            </CardHeader>
            <CardContent>
              {locationAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {locationAnalytics.map((location, index) => {
                    const totalRevenue = locationAnalytics.reduce((sum, l) => sum + l.revenue, 0);
                    const percentage = totalRevenue > 0 ? (location.revenue / totalRevenue) * 100 : 0;
                    
                    return (
                      <div key={location.location} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <h4 className="font-medium">{location.location}</h4>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(location.revenue)}</p>
                            <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Orders:</span>
                            <span className="ml-1 font-medium">{location.orders}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Order:</span>
                            <span className="ml-1 font-medium">{formatCurrency(location.avgOrderValue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No location data available</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Breakdown */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Method Breakdown
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue and orders by payment type
              </p>
            </CardHeader>
            <CardContent>
              {paymentMethodAnalytics.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethodAnalytics.map((payment, index) => (
                    <div key={payment.method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <h4 className="font-medium">{payment.method}</h4>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(payment.revenue)}</p>
                          <p className="text-xs text-muted-foreground">{payment.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all" 
                          style={{ width: `${payment.percentage}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Orders:</span>
                          <span className="ml-1 font-medium">{payment.orders}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Order:</span>
                          <span className="ml-1 font-medium">{formatCurrency(payment.avgOrderValue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No payment method data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
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

          {/* Slow-Moving Items */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Slow-Moving Items
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Items with low sales - consider promoting or removing
              </p>
            </CardHeader>
            <CardContent>
              {slowMovingItems.length > 0 ? (
                <div className="space-y-3">
                  {slowMovingItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-orange-700 border-orange-300">
                          {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                        </Badge>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} sold • {formatCurrency(item.revenue)} revenue
                            {item.lastOrdered && (
                              <span> • Last: {new Date(item.lastOrdered).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-700">{formatCurrency(item.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Low sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">🎉 Great news!</p>
                  <p className="text-sm text-muted-foreground">
                    No slow-moving items found. All items are performing well in the selected period.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          {/* New vs Returning Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Retention
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                New vs returning customer breakdown
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Customers */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">New Customers</h4>
                    <Badge variant="secondary">{customerRetentionAnalytics.newCustomers}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(customerRetentionAnalytics.newCustomerRevenue)}
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentage:</span>
                      <span className="font-medium">{customerRetentionAnalytics.newCustomerPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Order:</span>
                      <span className="font-medium">{formatCurrency(customerRetentionAnalytics.newCustomerAvgOrder)}</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${customerRetentionAnalytics.newCustomerPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Returning Customers */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Returning Customers</h4>
                    <Badge variant="secondary">{customerRetentionAnalytics.returningCustomers}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(customerRetentionAnalytics.returningCustomerRevenue)}
                  </p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentage:</span>
                      <span className="font-medium">{customerRetentionAnalytics.returningCustomerPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Order:</span>
                      <span className="font-medium">{formatCurrency(customerRetentionAnalytics.returningCustomerAvgOrder)}</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${customerRetentionAnalytics.returningCustomerPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                  <p className="text-xl font-bold">{customerRetentionAnalytics.totalCustomers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repeat Rate</p>
                  <p className="text-xl font-bold text-green-600">{customerRetentionAnalytics.repeatRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">{formatCurrency(customerRetentionAnalytics.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
