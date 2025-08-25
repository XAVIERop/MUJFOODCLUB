import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  accepted_at?: string;
  preparing_at?: string;
  out_for_delivery_at?: string;
  completed_at?: string;
  points_credited: boolean;
}

interface OrderTrackingProps {
  orderId: string;
  onStatusUpdate?: (order: Order) => void;
}

const OrderTracking = ({ orderId, onStatusUpdate }: OrderTrackingProps) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const statusSteps = [
    { key: 'received', label: 'Order Received', icon: Receipt, color: 'bg-blue-500' },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'bg-green-500' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-yellow-500' },
    { key: 'on_the_way', label: 'Out for Delivery', icon: Truck, color: 'bg-purple-500' },
    { key: 'completed', label: 'Delivered', icon: CheckCircle, color: 'bg-green-600' }
  ];

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
      if (onStatusUpdate) onStatusUpdate(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, 
        (payload) => {
          console.log('Order updated:', payload.new);
          setOrder(payload.new as Order);
          if (onStatusUpdate) onStatusUpdate(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onStatusUpdate]);

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

  if (loading) {
    return (
      <Card className="food-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="food-card">
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-muted-foreground">Order not found</p>
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const StatusIcon = getStatusIcon(order.status);

  return (
    <Card className="food-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order #{order.order_number}</span>
          <Badge className={getStatusColor(order.status)}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {order.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Amount:</span>
            <p className="font-semibold">₹{order.total_amount}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Delivery Block:</span>
            <p className="font-semibold">{order.delivery_block}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Payment Method:</span>
            <p className="font-semibold capitalize">{order.payment_method}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Points to Earn:</span>
            <p className="font-semibold">{order.points_earned} pts</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold">Order Progress</h4>
          <div className="relative">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isActive = isCompleted || isCurrent;

              return (
                <div key={step.key} className="flex items-center mb-6">
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
        </div>

        {/* Points Status */}
        {order.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
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

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          onClick={fetchOrder}
          className="w-full"
        >
          <Clock className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
