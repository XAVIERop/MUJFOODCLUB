import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Trophy, Home, ShoppingCart, Receipt, ChefHat, Truck, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrderByNumberQuery } from '@/hooks/useOrdersQuery';
import Header from '@/components/Header';
import OrderRating from '@/components/OrderRating';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
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

  // Use React Query to fetch order data by order number
  const { 
    data: order, 
    isLoading: loading, 
    error: orderError,
    refetch: refetchOrder
  } = useOrderByNumberQuery(orderNumber, user?.id || null, {
    enabled: !!orderNumber && !!user?.id,
    staleTime: 10 * 1000, // 10 seconds for real-time updates
  });

  // Handle order data updates and errors
  useEffect(() => {
    if (orderError) {
      console.error('❌ Order fetch error:', orderError);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      });
    }

    if (order) {
      console.log('📥 OrderConfirmation: Order data updated:', order);
      setLastRefresh(new Date());
      
      // If order is completed, refresh profile to get updated points
      if (order.status === 'completed') {
        console.log('🎉 Order completed, refreshing profile for updated points');
        refreshProfile();
      }
    }
  }, [order, orderError, refreshProfile, toast]);

  // Handle navigation for missing order number or user
  useEffect(() => {
    if (!orderNumber) {
      console.log('❌ No order number provided');
      navigate('/');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID provided');
      toast({
        title: "Authentication Error",
        description: "Please log in to view your order",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
  }, [orderNumber, user?.id, navigate, toast]);

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
            <div 
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </div>
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
                <p className="text-xs text-blue-600">v3.0 - Deep Fix Mode</p>
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
                    orderNumber={order.order_number}
                    cafeName={order.cafe?.name || 'Cafe'}
                    onRatingSubmitted={() => {
                      refetchOrder();
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div 
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </div>
            <div 
              onClick={() => navigate('/cafes')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Again
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
