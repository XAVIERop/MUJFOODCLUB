import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  Receipt,
  MapPin,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  deliveryBlock?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
  status, 
  createdAt, 
  estimatedDelivery,
  deliveryBlock 
}) => {
  const statusSteps = [
    {
      key: 'received',
      label: 'Order Received',
      icon: Receipt,
      description: 'Your order has been received and is being processed'
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      icon: CheckCircle,
      description: 'Your order has been confirmed by the cafe'
    },
    {
      key: 'preparing',
      label: 'Preparing',
      icon: ChefHat,
      description: 'Your order is being prepared by the kitchen'
    },
    {
      key: 'on_the_way',
      label: 'On the Way',
      icon: Truck,
      description: 'Your order is out for delivery'
    },
    {
      key: 'completed',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Your order has been delivered successfully'
    }
  ];

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getStatusIndex(status);
  const isCancelled = status === 'cancelled';

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedTime = () => {
    if (!estimatedDelivery) return null;
    
    const now = new Date();
    const estimated = new Date(estimatedDelivery);
    const diffMs = estimated.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Delivered';
    if (diffMins < 60) return `${diffMins} mins`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isCancelled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            Order Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Cancelled at {formatTime(createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Progress</span>
          {estimatedDelivery && (
            <Badge variant="outline" className="flex items-center">
              <Timer className="w-3 h-3 mr-1" />
              {getEstimatedTime()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={step.key} className="flex items-start space-x-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      isCurrent && !isCompleted && "bg-blue-500 border-blue-500 text-white",
                      isUpcoming && "bg-gray-100 border-gray-300 text-gray-400"
                    )}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-8 mt-2",
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={cn(
                      "font-medium",
                      isCompleted && "text-green-700",
                      isCurrent && "text-blue-700",
                      isUpcoming && "text-gray-500"
                    )}>
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && index < currentIndex && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {/* Show delivery block for on_the_way status */}
                  {step.key === 'on_the_way' && deliveryBlock && (
                    <div className="flex items-center space-x-1 mt-2 text-sm text-blue-600">
                      <MapPin className="w-3 h-3" />
                      <span>Delivering to {deliveryBlock}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Order Time:</span>
              <p className="font-medium">{formatTime(createdAt)}</p>
            </div>
            {estimatedDelivery && (
              <div>
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <p className="font-medium">{formatTime(estimatedDelivery)}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
