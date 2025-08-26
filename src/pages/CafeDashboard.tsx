import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt, Bell, User, MapPin, Phone } from 'lucide-react';
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
  user: {
    full_name: string;
    phone?: string;
    block: string;
  };
  order_items: OrderItem[];
}

const CafeDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cafeId, setCafeId] = useState<string | null>(null);

  // Get cafe ID for the current user
  useEffect(() => {
    const getCafeId = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('cafe_staff')
          .select('cafe_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setCafeId(data?.cafe_id);
      } catch (error) {
        console.error('Error fetching cafe ID:', error);
      }
    };

    getCafeId();
  }, [user]);

  const fetchOrders = async () => {
    if (!cafeId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block),
          order_items(
            id,
            menu_item_id,
            quantity,
            notes,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredOrders = (status: Order['status'] | 'all') => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cafe Dashboard</h1>
            <p className="text-muted-foreground">Manage orders and track deliveries</p>
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

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({filteredOrders('received').length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filteredOrders('confirmed').length})</TabsTrigger>
            <TabsTrigger value="preparing">Preparing ({filteredOrders('preparing').length})</TabsTrigger>
            <TabsTrigger value="on_the_way">Delivery ({filteredOrders('on_the_way').length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({filteredOrders('completed').length})</TabsTrigger>
          </TabsList>

          {['all', 'received', 'confirmed', 'preparing', 'on_the_way', 'completed'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading orders...</p>
                </div>
              ) : filteredOrders(status as Order['status']).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders</h3>
                    <p className="text-muted-foreground">
                      {status === 'all' ? 'No orders yet.' : `No ${status.replace('_', ' ')} orders.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders(status as Order['status']).map((order) => (
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
            </TabsContent>
          ))}
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
