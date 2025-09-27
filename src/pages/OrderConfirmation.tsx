import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Trophy, Home, ShoppingCart, Receipt, ChefHat, Truck, Star, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrderByNumberQuery } from '@/hooks/useOrdersQuery';
import { useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import OrderRating from '@/components/OrderRating';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes in seconds
  const [showCancelButton, setShowCancelButton] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const { orderId } = useParams();
  const orderNumber = orderId || location.state?.orderNumber || new URLSearchParams(window.location.search).get('order');
  
  console.log('🔍 OrderConfirmation: orderId from params:', orderId);
  console.log('🔍 OrderConfirmation: orderNumber from location.state:', location.state?.orderNumber);
  console.log('🔍 OrderConfirmation: orderNumber from URL:', new URLSearchParams(window.location.search).get('order'));
  console.log('🔍 OrderConfirmation: Final orderNumber:', orderNumber);
  console.log('🔍 OrderConfirmation: User ID:', user?.id);
  console.log('🔍 OrderConfirmation: Query enabled:', !!orderNumber && !!user?.id);

  const statusSteps = [
    { key: 'received', label: 'Order Received', icon: Receipt, color: 'bg-green-500' },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'bg-green-600' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-green-700' },
    { key: 'on_the_way', label: 'Out for Delivery', icon: Truck, color: 'bg-green-800' },
    { key: 'completed', label: 'Delivered', icon: CheckCircle, color: 'bg-green-900' }
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

  // Debug logging for order data
  useEffect(() => {
    console.log('🔍 OrderConfirmation: Component state:', {
      orderNumber,
      userId: user?.id,
      order,
      loading,
      orderError
    });
    
    if (order) {
      console.log('🔍 OrderConfirmation: Order data:', order);
      console.log('🔍 OrderConfirmation: Cafe data:', (order as any).cafe);
      console.log('🔍 OrderConfirmation: Order items:', (order as any).order_items);
    }
    
    if (orderError) {
      console.error('🔍 OrderConfirmation: Error:', orderError);
    }
  }, [order, orderNumber, user?.id, loading, orderError]);

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (!order?.id) return;

    console.log('🔴 Setting up real-time subscription for order:', order.id);

    const channel = supabase
      .channel(`order-confirmation-${order.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${order.id}`
        }, 
        (payload) => {
          console.log('🔄 OrderConfirmation: Real-time update received:', payload.new);
          console.log('🔄 OrderConfirmation: Old status:', payload.old?.status);
          console.log('🔄 OrderConfirmation: New status:', payload.new?.status);
          console.log('🔄 OrderConfirmation: Full payload:', payload);
          
          // Force refetch to get the latest data with all relations
          refetchOrder();
          
          // Show toast notification for status changes
          if (payload.old?.status !== payload.new?.status) {
            const statusLabels = {
              'received': 'Order Received',
              'confirmed': 'Order Confirmed',
              'preparing': 'Preparing Your Order',
              'on_the_way': 'Out for Delivery',
              'completed': 'Order Delivered',
              'cancelled': 'Order Cancelled'
            };
            
            console.log('🔄 OrderConfirmation: Status changed, showing toast');
            toast({
              title: "Order Status Updated!",
              description: `Your order is now: ${statusLabels[payload.new?.status as keyof typeof statusLabels] || payload.new?.status}`,
            });
          } else {
            console.log('🔄 OrderConfirmation: No status change detected');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔴 Cleaning up real-time subscription for order:', order.id);
      supabase.removeChannel(channel);
    };
  }, [order?.id, refetchOrder, toast]);

  // Handle cancel order functionality
  const handleCancelOrder = async () => {
    if (!order || !user) return;
    
    setIsCancelling(true);
    try {
      const { error } = await supabase.rpc('cancel_order_with_reason', {
        p_order_id: order.id,
        p_cancelled_by: user.id,
        p_cancellation_reason: 'Cancelled by customer within 2-minute window'
      });

      if (error) throw error;

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully"
      });

      // Refetch order data to get updated status
      refetchOrder();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Timer for 2-minute cancel window
  useEffect(() => {
    if (!order || order.status !== 'received') {
      setShowCancelButton(false);
      return;
    }

    // Calculate time left based on order creation time
    const orderTime = new Date(order.created_at).getTime();
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - orderTime) / 1000);
    const remainingSeconds = Math.max(0, 120 - elapsedSeconds); // 2 minutes = 120 seconds

    if (remainingSeconds > 0) {
      setTimeLeft(remainingSeconds);
      setShowCancelButton(true);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowCancelButton(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeLeft(0);
      setShowCancelButton(false);
    }
  }, [order]);

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
      console.log('📥 OrderConfirmation: Order status:', order.status);
      console.log('📥 OrderConfirmation: Order ID:', order.id);
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

  // Real-time subscription for order updates
  useEffect(() => {
    if (!order?.id || !user?.id) return;

    console.log('🔄 Setting up real-time subscription for order:', order.id);

    const channel = supabase
      .channel(`order-updates-${order.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${order.id}`
        }, 
        (payload) => {
          console.log('🔄 OrderConfirmation: Real-time update received:', payload);
          
          // Invalidate and refetch the order data
          queryClient.invalidateQueries({
            queryKey: ['orders', 'number', orderNumber]
          });
          
          // Show notification for status changes
          if (payload.new.status !== payload.old.status) {
            toast({
              title: "Order Status Updated!",
              description: `Your order is now: ${payload.new.status.replace('_', ' ').toUpperCase()}`,
              variant: "default",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time subscription for order:', order.id);
      supabase.removeChannel(channel);
    };
  }, [order?.id, orderNumber, user?.id, queryClient, toast]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const currentIndex = statusSteps.findIndex(step => step.key === order.status);
    console.log('🔍 OrderConfirmation: Current status:', order.status, 'Index:', currentIndex);
    return currentIndex;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-500';
      case 'confirmed': return 'bg-green-600';
      case 'preparing': return 'bg-green-700';
      case 'on_the_way': return 'bg-green-800';
      case 'completed': return 'bg-green-900';
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
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
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
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-green-600 font-medium">
                  Live updates active - status changes appear instantly
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
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
                          {isCurrent && (order as any).status_updated_at && (
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
                  <span className="font-medium">
                    {(order as any).cafe?.name || 
                     (!user?.id ? 'Please log in' : 
                      !orderNumber ? 'Invalid order' : 'Loading...')}
                  </span>
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
                {/* Points display removed for simplified version */}
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

            {/* Order Items */}
            <Card className="food-card">
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                {!user?.id ? (
                  <p className="text-gray-500 text-center py-4">Please log in to view order items</p>
                ) : !orderNumber ? (
                  <p className="text-gray-500 text-center py-4">Invalid order number</p>
                ) : (order as any).order_items && (order as any).order_items.length > 0 ? (
                  <div className="space-y-3">
                    {(order as any).order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.menu_item?.name || 'Item'}</p>
                          {item.special_instructions && (
                            <p className="text-sm text-gray-500 mt-1">Note: {item.special_instructions}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">₹{item.unit_price} each</p>
                          <p className="font-semibold text-green-600">₹{item.total_price}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold text-green-600">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Loading order items...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rating Section */}
          {order.status === 'completed' && !(order as any).has_rating && (
            <div className="mt-8">
              <OrderRating
                orderId={order.id}
                orderNumber={order.order_number}
                cafeName={(order as any).cafe?.name || 'Cafe'}
                onRatingSubmitted={() => {
                  refetchOrder();
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {/* Cancel Order Button - Only show for received status within 2-minute window */}
            {showCancelButton && order?.status === 'received' && (
              <button 
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2 cursor-pointer"
              >
                <X className="w-4 h-4 mr-2" />
                {isCancelling ? 'Cancelling...' : `Cancel Order (${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')})`}
              </button>
            )}
            
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
