import React, { useState } from 'react';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ActiveOrder {
  id: string;
  status: string;
  estimatedTime: number; // in minutes
  cafeName: string;
  orderNumber: string;
  created_at: string;
}

interface ActiveOrderStatusBarProps {
  activeOrders: ActiveOrder[];
  onClose?: () => void;
}

const ActiveOrderStatusBar: React.FC<ActiveOrderStatusBarProps> = ({ 
  activeOrders, 
  onClose 
}) => {
  const navigate = useNavigate();
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [localActiveOrders, setLocalActiveOrders] = useState(activeOrders);
  const manuallyClosedOrders = React.useRef<Set<string>>(new Set());

  // Update local orders when props change - simplified logic
  React.useEffect(() => {
    // Filter out manually closed orders and expired orders
    const now = new Date();
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    const filteredOrders = activeOrders.filter(order => {
      // Skip manually closed orders
      if (manuallyClosedOrders.current.has(order.id)) {
        return false;
      }
      
      // Check for expiry
      const orderCreatedAt = new Date(order.created_at);
      const timeSinceCreation = now.getTime() - orderCreatedAt.getTime();
      const isCompletedOrCancelled = order.status === 'completed' || order.status === 'cancelled';
      
      // Expire after 3 hours for all orders, or 5 minutes for completed/cancelled
      const shouldExpire = timeSinceCreation >= threeHoursInMs || 
                          (isCompletedOrCancelled && timeSinceCreation >= fiveMinutesInMs);
      
      return !shouldExpire;
    });
    
    setLocalActiveOrders(filteredOrders);
    
    // Reset index if current index is out of bounds
    if (currentOrderIndex >= filteredOrders.length && filteredOrders.length > 0) {
      setCurrentOrderIndex(filteredOrders.length - 1);
    } else if (filteredOrders.length === 0) {
      setCurrentOrderIndex(0);
    }
  }, [activeOrders, currentOrderIndex]);

  if (!localActiveOrders || localActiveOrders.length === 0) return null;

  const currentOrder = localActiveOrders[currentOrderIndex];
  const hasMultipleOrders = localActiveOrders.length > 1;

  const handleClick = () => {
    // Navigate to specific order confirmation page
    navigate(`/order-confirmation/${currentOrder.orderNumber}`);
  };

  const handlePreviousOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentOrderIndex(prev => 
      prev === 0 ? localActiveOrders.length - 1 : prev - 1
    );
  };

  const handleNextOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentOrderIndex(prev => 
      prev === localActiveOrders.length - 1 ? 0 : prev + 1
    );
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add current order to manually closed set
    manuallyClosedOrders.current.add(currentOrder.id);
    
    // Remove the current order from the local list
    const updatedOrders = localActiveOrders.filter((_, index) => index !== currentOrderIndex);
    setLocalActiveOrders(updatedOrders);
    
    // Adjust current index if needed
    if (updatedOrders.length > 0) {
      const newIndex = currentOrderIndex >= updatedOrders.length ? updatedOrders.length - 1 : currentOrderIndex;
      setCurrentOrderIndex(newIndex);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'confirmed':
        return 'bg-orange-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'on_the_way':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-orange-500';
    }
  };

  return (
    <div 
      className={cn(
        "fixed bottom-16 left-0 right-0 z-50 mx-4 mb-2",
        "bg-green-500 rounded-lg shadow-lg cursor-pointer",
        "transform transition-all duration-300 ease-in-out",
        "hover:shadow-xl hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between p-2">
        {/* Left side - Navigation arrows (if multiple orders) */}
        {hasMultipleOrders && (
          <button
            onClick={handlePreviousOrder}
            className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Center - Status text */}
        <div className="flex flex-col flex-1">
          <span className="text-white font-medium text-sm">
            Order {currentOrder.status}
          </span>
          <span className="text-white/90 text-xs">
            {currentOrder.cafeName}
          </span>
          {hasMultipleOrders && (
            <span className="text-white/80 text-xs">
              {currentOrderIndex + 1} of {localActiveOrders.length}
            </span>
          )}
        </div>

        {/* Right side - Navigation and close */}
        <div className="flex items-center space-x-2">
          {/* Next arrow (if multiple orders) */}
          {hasMultipleOrders && (
            <button
              onClick={handleNextOrder}
              className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          )}
          
          {/* Main arrow or close button */}
          <button
            onClick={handleClick}
            className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveOrderStatusBar;
