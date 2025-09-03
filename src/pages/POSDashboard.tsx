import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  Receipt, 
  Bell, 
  Grid, 
  List,
  Plus,
  RefreshCw,
  BarChart3,
  Settings,
  Users,
  Package
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import CompactOrderGrid from '@/components/CompactOrderGrid';
import POSAnalytics from '@/components/POSAnalytics';
import NotificationCenter from '@/components/NotificationCenter';

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
  user_id: string;
  cafe_id: string;
  points_credited: boolean;
  phone_number?: string;
  user?: {
    full_name: string;
    phone: string | null;
    block: string;
    email: string;
  };
}

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

const POSDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [useCompactLayout, setUseCompactLayout] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [cafeId, setCafeId] = useState<string | null>(null);

  // Scroll to top hook
  const { scrollToTopOnTabChange } = useScrollToTop();

  const fetchOrders = async () => {
    try {
      // First, try a simple query without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.error('Simple query failed:', simpleError);
        throw simpleError;
      }

      console.log('Simple query successful, found orders:', simpleData?.length || 0);

      // If simple query works, try the full query with joins
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Full query failed, using simple data:', error);
        // Use simple data if full query fails, but we need to transform it
        const transformedOrders = (simpleData || []).map(order => ({
          ...order,
          user: { full_name: 'Unknown', phone: null, block: 'Unknown', email: 'unknown@example.com' },
          order_items: []
        }));
        setOrders(transformedOrders);
        
        // Fetch order items separately for simple data
        const itemsData: {[key: string]: OrderItem[]} = {};
        for (const order of transformedOrders) {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              menu_item:menu_items(name, description)
            `)
            .eq('order_id', order.id);

          if (itemsError) {
            console.error(`Error fetching items for order ${order.id}:`, itemsError);
          } else if (items && items.length > 0) {
            itemsData[order.id] = items;
          }
        }
        setOrderItems(itemsData);
      } else {
        console.log('Full query successful, found orders:', data?.length || 0);
        setOrders(data || []);
        
        // Extract order items from the joined data
        const itemsData: {[key: string]: OrderItem[]} = {};
        for (const order of data || []) {
          if (order.order_items && order.order_items.length > 0) {
            itemsData[order.id] = order.order_items;
          }
        }
        setOrderItems(itemsData);
      }
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

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Database error updating order status:', error);
        throw new Error(`Database error: ${error.message || 'Unknown database error'}`);
      }

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast({
        title: "Update Failed",
        description: `Failed to update order status: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCompactStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'received': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return ChefHat;
      case 'on_the_way': return Truck;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-500';
      case 'confirmed': return 'bg-green-500';
      case 'preparing': return 'bg-yellow-500';
      case 'on_the_way': return 'bg-purple-500';
      case 'completed': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextStatus = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'on_the_way';
      case 'on_the_way': return 'completed';
      default: return null;
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    if (profile?.cafe_id) {
      setCafeId(profile.cafe_id);
    }
  }, [profile]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`pos-orders-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        async (payload) => {
          fetchOrders();
          setUnreadNotifications(prev => prev + 1);
          
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
          setOrders(prev => 
            prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
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
    }
  }, [cafeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
              <p className="text-gray-600 mt-2">Professional Point of Sale System for High-Volume Operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsNotificationOpen(true)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button onClick={fetchOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + order.total_amount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(order => order.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            scrollToTopOnTabChange(value);
          }} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 gap-1 sm:gap-2">
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">O</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">A</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">I</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Customers</span>
              <span className="sm:hidden">C</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">S</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Layout Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Button
                  variant={useCompactLayout ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCompactLayout(true)}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Compact Grid
                </Button>
                <Button
                  variant={!useCompactLayout ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCompactLayout(false)}
                >
                  <List className="w-4 h-4 mr-2" />
                  Detailed List
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {useCompactLayout ? 'Grid view for high-volume orders' : 'Detailed view for individual orders'}
              </div>
            </div>

            {/* Compact Grid View */}
            {useCompactLayout && (
              <CompactOrderGrid
                orders={orders}
                orderItems={orderItems}
                onOrderSelect={handleOrderSelect}
                onStatusUpdate={handleCompactStatusUpdate}
                loading={loading}
              />
            )}

            {/* Detailed List View */}
            {!useCompactLayout && (
              <div className="space-y-4">
                {['received', 'confirmed', 'preparing', 'on_the_way', 'completed'].map((status) => (
                  <div key={status} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">{status.replace('_', ' ')} Orders</h3>
                    {filterOrdersByStatus(status).length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No {status.replace('_', ' ')} orders</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filterOrdersByStatus(status).map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const nextStatus = getNextStatus(order.status);
                        const items = orderItems[order.id] || [];

                        return (
                          <Card key={order.id} className="food-card">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center">
                                    <span>Order #{order.order_number}</span>
                                    <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                                      <StatusIcon className="w-4 h-4 mr-1" />
                                      {order.status.toUpperCase()}
                                    </Badge>
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(order.created_at)} • Block {order.delivery_block}
                                    {order.phone_number && (
                                      <span className="ml-2">• 📞 {order.phone_number}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">₹{order.total_amount}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.payment_method.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Order Items */}
                              <div className="space-y-2">
                                <h4 className="font-semibold">Order Items ({items.length} items):</h4>
                                {items.length > 0 ? (
                                  items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                      <div>
                                        <span className="font-medium">{item.quantity}x {item.menu_item.name}</span>
                                        {item.special_instructions && (
                                          <p className="text-muted-foreground text-xs">
                                            Note: {item.special_instructions}
                                          </p>
                                        )}
                                      </div>
                                      <span>₹{item.total_price}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <p>No items found for this order</p>
                                    <p className="text-xs mt-1">Order total: ₹{order.total_amount}</p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                {nextStatus && (
                                  <Button
                                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                                    disabled={updatingOrder === order.id}
                                    className="flex-1"
                                  >
                                    {updatingOrder === order.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as {nextStatus.replace('_', ' ')}
                                      </>
                                    )}
                                  </Button>
                                )}
                                {order.status === 'received' && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                    disabled={updatingOrder === order.id}
                                  >
                                    Cancel Order
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <POSAnalytics 
              orders={orders}
              orderItems={orderItems}
              loading={loading}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Inventory features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customer features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>POS Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          userType="cafe_staff"
          cafeId={cafeId}
        />
      </div>
    </div>
  );
};

export default POSDashboard;
