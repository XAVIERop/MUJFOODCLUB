import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt, ArrowLeft, Eye, ShoppingCart, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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
  cafe: {
    name: string;
    location: string;
  };
}

const OrderTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          cafe:cafes(name, location)
        `)
        .eq('user_id', user.id)
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

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for order updates
    if (user) {
      const channel = supabase
        .channel(`user-orders-${user.id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Order updated:', payload.new);
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            );
            
            // Show toast for status updates
            const newStatus = payload.new.status;
            toast({
              title: "Order Status Updated",
              description: `Order #${payload.new.order_number} is now ${newStatus.replace('_', ' ')}`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast]);

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

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">You need to sign in to view your orders.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <Card className="food-card">
              <CardContent className="text-center py-16">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
                <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Start ordering from your favorite cafes!
                </p>
                <Button onClick={() => navigate('/')}>
                  Browse Cafes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">
                  All ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="received">
                  Received ({filterOrdersByStatus('received').length})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed ({filterOrdersByStatus('confirmed').length})
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  Preparing ({filterOrdersByStatus('preparing').length})
                </TabsTrigger>
                <TabsTrigger value="on_the_way">
                  Delivery ({filterOrdersByStatus('on_the_way').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({filterOrdersByStatus('completed').length})
                </TabsTrigger>
              </TabsList>

              {['all', 'received', 'confirmed', 'preparing', 'on_the_way', 'completed'].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {(status === 'all' ? orders : filterOrdersByStatus(status)).map((order) => {
                    const StatusIcon = getStatusIcon(order.status);

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
                                {formatDate(order.created_at)} • {order.cafe.name}
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
                          {/* Order Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Cafe:</span>
                              <p className="font-semibold">{order.cafe.name}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Delivery Block:</span>
                              <p className="font-semibold">{order.delivery_block}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Points to Earn:</span>
                              <p className="font-semibold">{order.points_earned} pts</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <p className="font-semibold capitalize">{order.status.replace('_', ' ')}</p>
                            </div>
                          </div>

                          {/* Delivery Notes */}
                          {order.delivery_notes && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">
                                <span className="font-medium">Delivery Notes:</span> {order.delivery_notes}
                              </p>
                            </div>
                          )}

                          {/* Points Status */}
                          {order.status === 'completed' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center">
                                <Trophy className="w-5 h-5 text-green-500 mr-2" />
                                <div>
                                  <p className="font-semibold text-green-800">
                                    Order Completed!
                                  </p>
                                  <p className="text-sm text-green-600">
                                    {order.points_credited 
                                      ? `You earned ${order.points_earned} loyalty points!`
                                      : 'Points will be credited shortly.'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/order-confirmation?order=${order.order_number}`)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === 'completed' && (
                              <Button
                                onClick={() => navigate('/menu')}
                                className="flex-1"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Order Again
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
