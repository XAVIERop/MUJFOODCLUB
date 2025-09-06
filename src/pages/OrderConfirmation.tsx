import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { orderId } = useParams();
  const orderNumber = orderId || location.state?.orderNumber || new URLSearchParams(window.location.search).get('order');
  
  console.log('🔍 OrderConfirmation: orderId from params:', orderId);
  console.log('🔍 OrderConfirmation: orderNumber from location.state:', location.state?.orderNumber);
  console.log('🔍 OrderConfirmation: orderNumber from URL:', new URLSearchParams(window.location.search).get('order'));
  console.log('🔍 OrderConfirmation: Final orderNumber:', orderNumber);

  const statusSteps = [
    { key: 'received', label: 'Order Received', icon: Receipt, color: 'bg-blue-500' },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'bg-green-500' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-yellow-500' },
    { key: 'on_the_way', label: 'Out for Delivery', icon: Truck, color: 'bg-purple-500' },
    { key: 'completed', label: 'Delivered', icon: CheckCircle, color: 'bg-green-600' }
  ];

  const fetchOrder = async () => {
    if (!orderNumber) {
      console.log('❌ No order number provided');
      console.log('❌ orderNumber:', orderNumber);
      console.log('❌ user?.id:', user?.id);
      setLoading(false);
      navigate('/');
      return;
    }

    console.log('🔄 OrderConfirmation: Fetching order:', orderNumber, 'User:', user?.id);

    try {
      // Add cache-busting parameter
      const cacheBuster = Date.now();
      console.log('🔄 Fetching with cache buster:', cacheBuster);
      
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
        .neq('id', '00000000-0000-0000-0000-000000000000') // Cache buster
        .single();

      if (error) {
        console.error('❌ Error fetching order:', error);
        throw error;
      }
      
      console.log('📥 OrderConfirmation: Order fetched successfully:', data);
      
      setOrder(data);
      setLastRefresh(new Date());
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
    console.log('🚀 OrderConfirmation loaded with real-time updates!', new Date().toISOString());
    
    fetchOrder();

    // Set up polling as backup (real-time should handle most updates)
    const pollInterval = 30000; // 30 seconds as backup
    console.log(`🔄 Setting up polling every ${pollInterval/1000} seconds`);
    
    const interval = setInterval(() => {
      console.log('🔄 OrderConfirmation: Backup polling...');
      fetchOrder();
    }, pollInterval);

    // Also refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, refreshing...');
        fetchOrder();
      }
    };
    
    // Network status monitoring
    const handleOnlineStatus = () => {
      console.log('🌐 Network status changed:', navigator.onLine);
      if (navigator.onLine) {
        console.log('🌐 Back online, refreshing...');
        fetchOrder();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Set up real-time subscription for live updates
    console.log('🔄 Setting up real-time subscription for order updates...');
    const subscription = supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_number=eq.${orderNumber}`
      }, (payload) => {
        console.log('📡 Real-time update received:', payload);
        
        // Check if this is a status update
        if (payload.new && payload.new.status !== payload.old?.status) {
          console.log('📡 Status changed via real-time:', payload.old?.status, '→', payload.new.status);
          
          // Update the order state immediately
          setOrder(payload.new as Order);
          setLastRefresh(new Date());
          
          // Show notification
          toast({
            title: "Order Updated!",
            description: `Status changed to ${payload.new.status.replace('_', ' ')}`,
            duration: 3000
          });
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      subscription.unsubscribe();
    };
  }, [orderNumber, user?.id]);

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
                <p className="text-xs text-blue-600">v2.0 - Polling Mode</p>
              </div>
            </div>
            <Badge className={`text-white ${getStatusColor(order.status)}`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {order.status.replace('_', ' ').toUpperCase()}
            </Badge>
            
            {/* Live Updates Status */}
            <div className="mt-4 text-center">
              <p className="text-xs text-blue-600">
                Live updates enabled - status changes appear instantly
              </p>
            </div>
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
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? step.color : 'bg-gray-200'
                        }`}>
                          <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                          {isCurrent && order.status_updated_at && (
                            <p className="text-xs text-gray-500">
                              Estimated time: {formatTime(order.estimated_delivery)}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Number:</span>
                  <span className="font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cafe:</span>
                  <span className="font-medium">{order.cafe?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{order.delivery_block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Earned:</span>
                  <span className="font-medium text-green-600">+{order.points_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Time:</span>
                  <span className="font-medium">{formatDate(order.created_at)}</span>
                </div>
                {order.delivery_notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Delivery Notes:</p>
                    <p className="text-sm">{order.delivery_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rating Section */}
          {order.status === 'completed' && !order.has_rating && (
            <div className="mt-8">
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Rate Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderRating
                    orderId={order.id}
                    cafeName={order.cafe?.name || 'Cafe'}
                    onRatingSubmitted={() => {
                      fetchOrder();
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button onClick={() => navigate('/cafes')}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
