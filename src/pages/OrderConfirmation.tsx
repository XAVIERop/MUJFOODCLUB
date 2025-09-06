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
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [forceUpdateMode, setForceUpdateMode] = useState(false);

  const { orderId } = useParams();
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
      console.log('❌ No order number provided');
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
        
        // Mobile-specific error logging
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          console.error('📱 Mobile Error Details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userAgent: navigator.userAgent,
            online: navigator.onLine,
            connection: navigator.connection ? navigator.connection.effectiveType : 'Unknown'
          });
        }
        
        throw error;
      }
      
      console.log('📥 OrderConfirmation: Order fetched successfully:', data);
      
      // Check if status changed and show notification for mobile
      if (order && order.status !== data.status) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          console.log('📱 Status changed on mobile:', order.status, '→', data.status);
          toast({
            title: "Status Updated!",
            description: `Order is now ${data.status.replace('_', ' ')}`,
            duration: 5000
          });
        }
      }
      
      // Force state update with mobile-specific logging
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        console.log('📱 Mobile: Setting order state to:', data);
        console.log('📱 Mobile: Current order state before update:', order);
      }
      
      setOrder(data);
      setLastRefresh(new Date());
      
      // Mobile-specific: Force a re-render
      if (isMobile) {
        console.log('📱 Mobile: Forcing component re-render...');
        // Force a state update to trigger re-render
        setTimeout(() => {
          setLastRefresh(new Date());
        }, 100);
      }
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
    // Add a unique identifier to verify this is the new implementation
    console.log('🚀 NEW OrderConfirmation implementation loaded!', new Date().toISOString());
    
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('📱 Mobile detected:', isMobile);
    
    if (isMobile) {
      console.log('📱 MOBILE MODE: Ultra-aggressive polling enabled!');
      console.log('📱 Mobile User Agent:', navigator.userAgent);
      console.log('📱 Mobile Connection:', navigator.connection ? navigator.connection.effectiveType : 'Unknown');
      console.log('📱 Mobile Online Status:', navigator.onLine);
      
      toast({
        title: "Mobile Mode Active",
        description: "Polling every 3 seconds for faster updates",
        duration: 3000
      });
    }
    
    fetchOrder();

    // Set up polling - more aggressive for mobile
    const pollInterval = isMobile ? 3000 : 10000; // 3 seconds for mobile, 10 for desktop
    console.log(`🔄 Setting up polling every ${pollInterval/1000} seconds`);
    
    const interval = setInterval(() => {
      console.log('🔄 OrderConfirmation: Polling for order updates...');
      
      // Mobile-specific: Check if we're still online
      if (isMobile && !navigator.onLine) {
        console.log('📱 Mobile: Offline detected, skipping poll');
        return;
      }
      
      // Skip polling if in force update mode
      if (forceUpdateMode) {
        console.log('🔄 OrderConfirmation: Skipping poll - force update mode active');
        return;
      }
      
      fetchOrder();
    }, pollInterval);

    // Also refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && !forceUpdateMode) {
        console.log('👁️ Page became visible, refreshing...');
        fetchOrder();
      }
    };
    
    // Mobile-specific: Network status monitoring
    const handleOnlineStatus = () => {
      if (isMobile) {
        console.log('📱 Mobile: Network status changed:', navigator.onLine);
        if (navigator.onLine) {
          console.log('📱 Mobile: Back online, refreshing...');
          fetchOrder();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
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
            
            {/* Refresh Controls */}
            <div className="mt-4 space-y-2">
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={fetchOrder} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Refresh Status
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="destructive" 
                    size="sm"
                    className="text-xs"
                  >
                    Force Refresh
                  </Button>
                  {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                    <>
                      <Button 
                        onClick={async () => {
                          console.log('📱 Mobile: Testing direct database query...');
                          try {
                            const { data, error } = await supabase
                              .from('orders')
                              .select('id, order_number, status, status_updated_at')
                              .eq('order_number', orderNumber)
                              .eq('user_id', user?.id)
                              .single();
                            
                            if (error) {
                              console.error('📱 Mobile: Direct query error:', error);
                              toast({
                                title: "Mobile Test Failed",
                                description: `Error: ${error.message}`,
                                variant: "destructive"
                              });
                            } else {
                              console.log('📱 Mobile: Direct query success:', data);
                              toast({
                                title: "Mobile Test Success",
                                description: `Status: ${data.status}`,
                              });
                            }
                          } catch (err) {
                            console.error('📱 Mobile: Test error:', err);
                          }
                        }} 
                        variant="secondary" 
                        size="sm"
                        className="text-xs"
                      >
                        Mobile Test
                      </Button>
                      <Button 
                        onClick={async () => {
                          console.log('📱 Mobile: Force UI update...');
                          
                          // Enable force update mode to prevent polling from overriding
                          setForceUpdateMode(true);
                          console.log('📱 Mobile: Force update mode enabled');
                          
                          try {
                            const { data, error } = await supabase
                              .from('orders')
                              .select('*')
                              .eq('order_number', orderNumber)
                              .eq('user_id', user?.id)
                              .single();
                            
                            if (error) {
                              console.error('📱 Mobile: Force update error:', error);
                              setForceUpdateMode(false); // Re-enable polling on error
                            } else {
                              console.log('📱 Mobile: Force update success:', data);
                              // Force set the order state
                              setOrder(data);
                              setLastRefresh(new Date());
                              toast({
                                title: "UI Force Updated",
                                description: `Status: ${data.status}`,
                              });
                              
                              // Keep force update mode for 10 seconds to prevent immediate override
                              setTimeout(() => {
                                console.log('📱 Mobile: Re-enabling polling after force update');
                                setForceUpdateMode(false);
                              }, 10000);
                            }
                          } catch (err) {
                            console.error('📱 Mobile: Force update error:', err);
                            setForceUpdateMode(false); // Re-enable polling on error
                          }
                        }} 
                        variant="default" 
                        size="sm"
                        className="text-xs bg-green-600"
                      >
                        Force UI Update
                      </Button>
                    </>
                  )}
                </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
              <p className="text-xs text-blue-600">
                Auto-refresh every {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? '3' : '10'} seconds
              </p>
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && order && (
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <p><strong>Debug Info:</strong></p>
                  <p>Status: {order.status}</p>
                  <p>Updated: {order.status_updated_at}</p>
                  <p>Last Refresh: {lastRefresh.toLocaleTimeString()}</p>
                  {forceUpdateMode && (
                    <p className="text-green-600 font-bold">🔄 Force Update Mode Active (10s)</p>
                  )}
                </div>
              )}
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
