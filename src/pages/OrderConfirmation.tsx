import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Trophy, Home, ShoppingCart, Receipt, ChefHat, Truck, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import OrderRating from '@/components/OrderRating';

interface Order {
  id: string;
  cafe_id: string;
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
  has_rating?: boolean;
  cafe: {
    id: string;
    name: string;
    location: string;
  };
}

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const { orderId } = useParams();
  // Get order data from URL params, navigation state, or fallback
  const orderNumber = orderId || location.state?.orderNumber || new URLSearchParams(window.location.search).get('order');

  const statusSteps = [
    { key: 'received', label: 'Order Received', icon: Receipt, color: 'bg-blue-500' },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'bg-green-500' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-yellow-500' },
    { key: 'on_the_way', label: 'Out for Delivery', icon: Truck, color: 'bg-purple-500' },
    { key: 'completed', label: 'Delivered', icon: CheckCircle, color: 'bg-green-600' }
  ];

  const fetchOrder = async () => {
    if (!orderNumber) {
      console.log('No order number provided');
      navigate('/');
      return;
    }

    console.log('Fetching order with:', { orderNumber, userId: user?.id });

    try {
      // First, let's check what orders exist with this order number
      const { data: allOrders, error: listError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber);

      console.log('All orders with this order number:', allOrders, 'Error:', listError);

      if (listError) {
        console.error('Error listing orders:', listError);
      }

      // Now try to get the specific order for this user
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          delivery_block,
          delivery_notes,
          payment_method,
          points_earned,
          estimated_delivery,
          created_at,
          status_updated_at,
          points_credited,
          has_rating,
          rating_submitted_at,
          cafe_id,
          cafe:cafes(name, location, id)
        `)
        .eq('order_number', orderNumber)
        .eq('user_id', user?.id)
        .single();

      console.log('Specific order result:', { data, error });

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Set up real-time subscription for order updates
    if (orderNumber) {
      const channel = supabase
        .channel(`order-tracking-${orderNumber}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `order_number=eq.${orderNumber}`
          }, 
          (payload) => {
            console.log('Order updated:', payload.new);
            setOrder(payload.new as Order);
            
            // Show toast for status updates
            const newStatus = payload.new.status;
            const oldStatus = order?.status;
            
            if (newStatus !== oldStatus) {
              toast({
                title: "Order Status Updated",
                description: `Your order is now ${newStatus.replace('_', ' ')}`,
              });

              // If order is completed, refresh profile to update points
              if (newStatus === 'completed') {
                refreshProfile();
                toast({
                  title: "Order Completed!",
                  description: `You earned ${payload.new.points_earned} loyalty points!`,
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderNumber, user?.id, toast, refreshProfile]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

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
      case 'cancelled': return Clock;
      default: return Clock;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mr-4" />
              <div className="text-left">
                <h1 className="text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-muted-foreground">Order #{order.order_number}</p>
              </div>
            </div>
            <Badge className={`text-white ${getStatusColor(order.status)}`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Status Timeline */}
            <Card className="food-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isActive = isCompleted || isCurrent;

                    return (
                      <div key={step.key} className="flex items-center">
                        {/* Status Icon */}
                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-yellow-500 border-yellow-500 text-white'
                              : 'bg-gray-200 border-gray-300 text-gray-500'
                        }`}>
                          <StepIcon className="w-5 h-5" />
                        </div>

                        {/* Connecting Line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute left-5 top-10 w-0.5 h-12 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}

                        {/* Status Details */}
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-muted-foreground">
                                  Estimated time: {formatTime(order.estimated_delivery)}
                                </p>
                              )}
                            </div>
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card className="food-card">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-semibold">{order.order_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-semibold">₹{order.total_amount}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>
                    <p className="font-semibold capitalize">{order.payment_method}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Block:</span>
                    <p className="font-semibold">{order.delivery_block}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-semibold">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Points to Earn:</span>
                    <p className="font-semibold">{order.points_earned} pts</p>
                  </div>
                </div>

                {order.delivery_notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">Delivery Notes:</span> {order.delivery_notes}
                    </p>
                  </div>
                )}

                {/* Points Status */}
                {order.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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

                {/* Order Rating Section */}
                {order.status === 'completed' && !order.has_rating && (
                  <div className="mt-6">
                    <OrderRating
                      orderId={order.id}
                      orderNumber={order.order_number}
                      cafeName={order.cafe?.name || 'Cafe'}
                      onRatingSubmitted={() => {
                        // Refresh order data to show rating status
                        fetchOrder();
                      }}
                    />
                  </div>
                )}

                {/* Rating Submitted Message */}
                {order.status === 'completed' && order.has_rating && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <p className="font-semibold text-blue-800">
                          Rating Submitted!
                        </p>
                        <p className="text-sm text-blue-600">
                          Thank you for rating your order. Your feedback helps us improve!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                  
                  <Button 
                    onClick={() => navigate(`/menu/${order.cafe_id}`, { 
                      state: { 
                        cafe: {
                          id: order.cafe_id,
                          name: order.cafe?.name || 'Cafe',
                          description: '',
                          location: order.cafe?.location || '',
                          type: '',
                          phone: '',
                          hours: '',
                          rating: 0,
                          total_reviews: 0
                        }
                      }
                    })}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
