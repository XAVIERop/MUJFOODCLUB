import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt, Bell, User, MapPin, Phone, Download, Search, BarChart3, Calendar, DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import NotificationCenter from '../components/NotificationCenter';
import Header from '../components/Header';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  notes?: string;
  menu_item: {
    name: string;
    price: number;
    category: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_block: string;
  delivery_notes?: string;
  payment_method: string;
  points_earned: number;
  estimated_delivery: string;
  created_at: string;
  status_updated_at: string;
  points_credited: boolean;
  accepted_at?: string;
  preparing_at?: string;
  out_for_delivery_at?: string;
  completed_at?: string;
  user: {
    full_name: string;
    phone?: string;
    block: string;
    email: string;
  };
  order_items: OrderItem[];
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
}

const CafeDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debug logging
  useEffect(() => {
    console.log('🔧 CafeDashboard Debug Info:');
    console.log('User:', user);
    console.log('Profile:', profile);
    console.log('CafeId:', cafeId);
  }, [user, profile, cafeId]);

  // Get cafe ID for the current user
  useEffect(() => {
    const getCafeId = async () => {
      if (!user) {
        console.log('❌ No user found');
        return;
      }

      console.log('🔍 Fetching cafe ID for user:', user.id);
      console.log('🔍 User email:', user.email);

      try {
        // First, let's check if the user exists in cafe_staff
        const { data: staffData, error: staffError } = await supabase
          .from('cafe_staff')
          .select('*')
          .eq('user_id', user.id);

        console.log('Cafe staff data:', staffData);
        console.log('Cafe staff error:', staffError);

        if (staffError) {
          console.error('Error fetching cafe staff:', staffError);
          return;
        }

        if (!staffData || staffData.length === 0) {
          console.log('❌ No cafe staff record found for user');
          
          // Let's also check by email as a fallback
          const { data: emailData, error: emailError } = await supabase
            .from('cafe_staff')
            .select('*')
            .eq('user_id', user.id);

          console.log('Email-based cafe staff data:', emailData);
          console.log('Email-based cafe staff error:', emailError);
          
          return;
        }

        // Get the cafe_id from the first record
        const cafeStaffRecord = staffData[0];
        console.log('✅ Found cafe staff record:', cafeStaffRecord);
        setCafeId(cafeStaffRecord.cafe_id);

      } catch (error) {
        console.error('Error fetching cafe ID:', error);
      }
    };

    getCafeId();
  }, [user]);

  const fetchOrders = async () => {
    if (!cafeId) {
      console.log('❌ No cafeId available for fetchOrders');
      return;
    }

    console.log('🔍 Fetching orders for cafeId:', cafeId);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            notes,
            menu_item:menu_items(name, price, category)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      console.log('📊 Orders query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }

      console.log('✅ Orders fetched successfully:', data?.length || 0, 'orders');
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!cafeId) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Get all orders for analytics
      const { data: allOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('cafe_id', cafeId);

      if (error) throw error;

      const orders = allOrders || [];
      const todayOrders = orders.filter(order => 
        new Date(order.created_at) >= today
      );

      // Calculate analytics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => 
        ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)
      ).length;
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

      // Top items
      const itemStats: Record<string, { quantity: number; revenue: number }> = {};
      orders.forEach(order => {
        order.order_items.forEach(item => {
          const itemName = item.menu_item.name;
          if (!itemStats[itemName]) {
            itemStats[itemName] = { quantity: 0, revenue: 0 };
          }
          itemStats[itemName].quantity += item.quantity;
          itemStats[itemName].revenue += item.quantity * item.menu_item.price;
        });
      });

      const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      ['received', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled'].forEach(status => {
        ordersByStatus[status] = orders.filter(order => order.status === status).length;
      });

      // Revenue by day (last 7 days)
      const revenueByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDate;
        });

        revenueByDay.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
          orders: dayOrders.length
        });
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        todayOrders: todayOrders.length,
        todayRevenue,
        topItems,
        ordersByStatus,
        revenueByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updateData: any = {
        status: newStatus,
        status_updated_at: new Date().toISOString()
      };

      // Add timestamp for specific status
      switch (newStatus) {
        case 'confirmed':
          updateData.accepted_at = new Date().toISOString();
          break;
        case 'preparing':
          updateData.preparing_at = new Date().toISOString();
          break;
        case 'on_the_way':
          updateData.out_for_delivery_at = new Date().toISOString();
          break;
        case 'completed':
          updateData.completed_at = new Date().toISOString();
          updateData.points_credited = true;
          break;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus.replace('_', ' ')}`,
      });

      // Refresh orders and analytics
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const exportOrders = async () => {
    try {
      const csvData = filteredOrders.map(order => ({
        'Order Number': order.order_number,
        'Customer': order.user.full_name,
        'Email': order.user.email,
        'Phone': order.user.phone || 'N/A',
        'Block': order.user.block,
        'Status': order.status,
        'Total Amount': order.total_amount,
        'Payment Method': order.payment_method,
        'Items': order.order_items.map(item => 
          `${item.menu_item.name} (${item.quantity}x)`
        ).join(', '),
        'Order Date': new Date(order.created_at).toLocaleString(),
        'Delivery Notes': order.delivery_notes || 'N/A'
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Orders exported to CSV file",
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive"
      });
    }
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.block.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];

      if (sortBy === 'user') {
        aValue = a.user.full_name;
        bValue = b.user.full_name;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'preparing': return 'bg-orange-500';
      case 'on_the_way': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'received': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'received': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'on_the_way';
      case 'on_the_way': return 'completed';
      default: return null;
    }
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!cafeId) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('order_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('cafe_id', cafeId)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadNotifications(count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel(`cafe-notifications-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_notifications',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          setUnreadNotifications(prev => prev + 1);
          toast({
            title: "New Order!",
            description: "You have a new order to process",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`cafe-orders-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          console.log('New order received:', payload.new);
          fetchOrders();
          fetchAnalytics();
          toast({
            title: "New Order!",
            description: `Order #${payload.new.order_number} received`,
          });
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          console.log('Order updated:', payload.new);
          setOrders(prev => 
            prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  useEffect(() => {
    if (cafeId) {
      fetchOrders();
      fetchAnalytics();
    }
  }, [cafeId]);

  // Check if user is cafe staff
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">You need to be logged in to access the cafe dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cafeId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
              <p className="text-muted-foreground">You are not authorized to access any cafe dashboard.</p>
              
              {/* Debug Information */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                <h4 className="font-medium text-yellow-900 mb-2">Debug Information:</h4>
                <pre className="text-xs text-yellow-800 overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                <p className="text-sm text-yellow-700 mt-2">
                  Check browser console for more details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cafe Dashboard</h1>
            <p className="text-muted-foreground">Manage orders, track analytics, and maintain your business</p>
          </div>
          
          {/* Notifications button */}
          <Button
            variant="outline"
            size="sm"
            className="relative"
            onClick={() => setIsNotificationOpen(true)}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                    <p className="text-2xl font-bold">{analytics.todayOrders}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{analytics.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="on_the_way">Out for Delivery</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Order Date</SelectItem>
                      <SelectItem value="total_amount">Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="user">Customer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={exportOrders} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground">
                      No orders match your current filters.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="food-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status.replace('_', ' ').toUpperCase()}</span>
                            </Badge>
                            <div>
                              <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">₹{order.total_amount}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_items.length} items
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Customer Info */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{order.user.full_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Block {order.user.block}</span>
                            </div>
                            {order.user.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{order.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <h4 className="font-semibold">Order Items:</h4>
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                              <div>
                                <p className="font-medium">{item.menu_item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ₹{item.menu_item.price}
                                </p>
                                {item.notes && (
                                  <p className="text-sm text-muted-foreground italic">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                              <p className="font-semibold">₹{item.menu_item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Delivery Details:</h4>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>Block:</strong> {order.delivery_block}</p>
                            <p><strong>Payment:</strong> {order.payment_method}</p>
                            {order.delivery_notes && (
                              <p><strong>Notes:</strong> {order.delivery_notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {getNextStatus(order.status) && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              className="flex-1"
                            >
                              {getNextStatus(order.status) === 'confirmed' && 'Accept Order'}
                              {getNextStatus(order.status) === 'preparing' && 'Start Preparing'}
                              {getNextStatus(order.status) === 'on_the_way' && 'Out for Delivery'}
                              {getNextStatus(order.status) === 'completed' && 'Mark Complete'}
                            </Button>
                          )}
                          
                          {order.status === 'received' && (
                            <Button
                              variant="destructive"
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <>
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Revenue Trend (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {analytics.revenueByDay.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm font-medium">{day.date}</div>
                          <div className="text-lg font-bold text-green-600">₹{day.revenue}</div>
                          <div className="text-xs text-muted-foreground">{day.orders} orders</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} orders • ₹{item.revenue} revenue
                            </p>
                          </div>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-4 bg-muted/30 rounded">
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {status.replace('_', ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <Button onClick={exportOrders} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Orders (CSV)
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export Analytics Report
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Database Stats</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Total Orders:</strong> {analytics?.totalOrders || 0}</p>
                      <p><strong>Total Revenue:</strong> ₹{analytics?.totalRevenue.toLocaleString() || 0}</p>
                      <p><strong>Average Order Value:</strong> ₹{analytics?.averageOrderValue.toFixed(2) || 0}</p>
                      <p><strong>Completion Rate:</strong> {analytics ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userType="cafe_staff"
        cafeId={cafeId}
      />
    </div>
  );
};

export default CafeDashboard;
