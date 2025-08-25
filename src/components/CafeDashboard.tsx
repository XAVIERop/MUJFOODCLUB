import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt, Bell } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

interface CafeDashboardProps {
  cafeId: string;
}

const CafeDashboard = ({ cafeId }: CafeDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      // Fetch order items for each order
      const itemsData: {[key: string]: OrderItem[]} = {};
      for (const order of data || []) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            menu_item:menu_items(name, description)
          `)
          .eq('order_id', order.id);

        if (!itemsError && items) {
          itemsData[order.id] = items;
        }
      }
      setOrderItems(itemsData);
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

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for new orders
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
          toast({
            title: "New Order!",
            description: `Order #${payload.new.order_number} received`,
          });
          fetchOrders();
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
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return Receipt;
      case 'confirmed': return CheckCircle;
      case 'preparing': return ChefHat;
      case 'on_the_way': return Truck;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextStatus = (currentStatus: string): Order['status'] | null => {
    switch (currentStatus) {
      case 'received': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'on_the_way';
      case 'on_the_way': return 'completed';
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cafe Dashboard</h2>
        <Button onClick={fetchOrders} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="received">
            <Receipt className="w-4 h-4 mr-2" />
            Received ({filterOrdersByStatus('received').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmed ({filterOrdersByStatus('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="preparing">
            <ChefHat className="w-4 h-4 mr-2" />
            Preparing ({filterOrdersByStatus('preparing').length})
          </TabsTrigger>
          <TabsTrigger value="on_the_way">
            <Truck className="w-4 h-4 mr-2" />
            Delivery ({filterOrdersByStatus('on_the_way').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed ({filterOrdersByStatus('completed').length})
          </TabsTrigger>
        </TabsList>

        {['received', 'confirmed', 'preparing', 'on_the_way', 'completed'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
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
                              {getStatusLabel(order.status)}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(order.created_at)} • Block {order.delivery_block}
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
                        <h4 className="font-semibold">Items:</h4>
                        {items.map((item) => (
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
                        ))}
                      </div>

                      {/* Delivery Notes */}
                      {order.delivery_notes && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-medium">Delivery Notes:</span> {order.delivery_notes}
                          </p>
                        </div>
                      )}

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
                                Mark as {getStatusLabel(nextStatus)}
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

                      {/* Points Info */}
                      {order.points_earned > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Points to earn:</span> {order.points_earned} pts
                            {order.status === 'completed' && order.points_credited && (
                              <span className="text-green-600 ml-2">✓ Credited</span>
                            )}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CafeDashboard;
