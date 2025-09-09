import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Clock, 
  Receipt, 
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  Printer,
  AlertCircle,
  X,
  Download,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FoodCourtReceipt from './FoodCourtReceipt';
import SimpleReceipt from './SimpleReceipt';
import { usePrinter } from '@/hooks/usePrinter';
import { directPrinterService } from '@/services/directPrinterService';
// import { useLocalPrint } from '@/hooks/useLocalPrint'; // Disabled - using cafe-specific PrintNode service
import { usePrintNode } from '@/hooks/usePrintNode';

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

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  delivery_block: string;
  customer_name?: string;
  phone_number?: string;
  cafe_id: string;
  cafes?: {
    id: string;
    name: string;
    type: string;
  };
  user?: {
    full_name: string;
    phone: string | null;
    block: string;
    email: string;
  };
}

interface EnhancedOrderGridProps {
  orders: Order[];
  orderItems: {[key: string]: OrderItem[]};
  onOrderSelect: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
  loading?: boolean;
  cafeId?: string;
}

const EnhancedOrderGrid: React.FC<EnhancedOrderGridProps> = ({
  orders,
  orderItems,
  onOrderSelect,
  onStatusUpdate,
  loading = false,
  cafeId
}) => {
  const { toast } = useToast();
  const { isConnected, isPrinting, printBothReceipts } = usePrinter();
  // const { isAvailable: localPrintAvailable, printReceipt: localPrintReceipt, isPrinting: localPrintPrinting } = useLocalPrint(); // Disabled - using cafe-specific PrintNode service
  const { isAvailable: printNodeAvailable, printReceipt: printNodePrintReceipt, printKOT: printNodePrintKOT, printOrderReceipt: printNodePrintOrderReceipt, isPrinting: printNodePrinting, printers: printNodePrinters } = usePrintNode(cafeId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [showSimpleReceipt, setShowSimpleReceipt] = useState(false);
  const [simpleReceiptOrder, setSimpleReceiptOrder] = useState<Order | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Calculate time elapsed since order creation
  const getTimeElapsed = (createdAt: string): string => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} Min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} Hr`;
    return `${Math.floor(diffMins / 1440)} Day`;
  };

  // Get status color and styling
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'received':
        return { 
          bgColor: 'bg-blue-50 border-blue-200', 
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800',
          icon: Clock, 
          label: 'Received' 
        };
      case 'confirmed':
        return { 
          bgColor: 'bg-purple-50 border-purple-200', 
          textColor: 'text-purple-800',
          badgeColor: 'bg-purple-100 text-purple-800',
          icon: CheckCircle, 
          label: 'Confirmed' 
        };
      case 'preparing':
        return { 
          bgColor: 'bg-yellow-50 border-yellow-200', 
          textColor: 'text-yellow-800',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle, 
          label: 'Preparing' 
        };
      case 'on_the_way':
        return { 
          bgColor: 'bg-orange-50 border-orange-200', 
          textColor: 'text-orange-800',
          badgeColor: 'bg-orange-100 text-orange-800',
          icon: Eye, 
          label: 'On Way' 
        };
      case 'completed':
        return { 
          bgColor: 'bg-green-50 border-green-200', 
          textColor: 'text-green-800',
          badgeColor: 'bg-green-100 text-green-800',
          icon: CheckCircle, 
          label: 'Completed' 
        };
      case 'cancelled':
        return { 
          bgColor: 'bg-red-50 border-red-200', 
          textColor: 'text-red-800',
          badgeColor: 'bg-red-100 text-red-800',
          icon: X, 
          label: 'Cancelled' 
        };
      default:
        return { 
          bgColor: 'bg-gray-50 border-gray-200', 
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800',
          icon: Clock, 
          label: 'Unknown' 
        };
    }
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery_block.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Sort orders by creation time (newest first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredOrders]);

  // Handle card click for popup
  const handleCardClick = (order: Order, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width + 10,
      y: rect.top
    });
    setHoveredOrder(order);
  };

  // Close popup
  const closePopup = () => {
    setHoveredOrder(null);
  };

  // Helper function to create receipt data
  const createReceiptData = (order: Order) => {
    const items = orderItems[order.id] || [];
    
    if (items.length === 0) {
      toast({
        title: "No Items Found",
        description: "Could not find items for this order",
        variant: "destructive",
      });
      return null;
    }

    return {
      order_id: order.id,
      order_number: order.order_number,
      cafe_name: order.cafe?.name || order.cafes?.name || 'Unknown Cafe',
      customer_name: order.user?.full_name || order.customer_name || 'Walk-in Customer',
      customer_phone: order.user?.phone || order.phone_number || 'N/A',
      delivery_block: order.delivery_block || order.user?.block || 'N/A',
      items: items.map(item => ({
        id: item.id,
        name: item.menu_item?.name || 'Unknown Item',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions
      })),
      subtotal: order.total_amount || 0,
      tax_amount: 0,
      discount_amount: 0,
      final_amount: order.total_amount || 0,
      payment_method: 'cod',
      order_date: order.created_at,
      estimated_delivery: new Date().toISOString(),
      points_earned: 0,
      points_redeemed: 0
    };
  };

  // Print KOT only
  const handlePrintKOT = async (order: Order) => {
    try {
      const receiptData = createReceiptData(order);
      if (!receiptData) return;

      if (printNodeAvailable) {
        const result = await printNodePrintKOT(receiptData);
        
        if (result.success) {
          toast({
            title: "KOT Printed",
            description: "Kitchen Order Ticket sent via PrintNode",
            variant: "default",
          });
        } else {
          toast({
            title: "KOT Print Error",
            description: result.error || "Failed to print KOT",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "PrintNode Not Available",
          description: "PrintNode service is not configured or available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('KOT print error:', error);
      toast({
        title: "KOT Print Error",
        description: "Error printing KOT",
        variant: "destructive",
      });
    }
  };

  // Print Order Receipt only
  const handlePrintOrderReceipt = async (order: Order) => {
    try {
      const receiptData = createReceiptData(order);
      if (!receiptData) return;

      if (printNodeAvailable) {
        const result = await printNodePrintOrderReceipt(receiptData);
        
        if (result.success) {
          toast({
            title: "Order Receipt Printed",
            description: "Customer receipt sent via PrintNode",
            variant: "default",
          });
        } else {
          toast({
            title: "Receipt Print Error",
            description: result.error || "Failed to print order receipt",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "PrintNode Not Available",
          description: "PrintNode service is not configured or available",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Order receipt print error:', error);
      toast({
        title: "Receipt Print Error",
        description: "Error printing order receipt",
        variant: "destructive",
      });
    }
  };

  // Professional print function using PrintNode (both KOT and Order Receipt)
  const handleProfessionalPrint = async (order: Order) => {
    try {
      const receiptData = createReceiptData(order);
      if (!receiptData) return;

      // Force PrintNode usage (cloud-based, professional)
      console.log('PrintNode Status:', { 
        available: printNodeAvailable, 
        printers: printNodePrinters.length,
        printerNames: printNodePrinters.map(p => p.name)
      });
      
      if (printNodeAvailable) {
        const result = await printNodePrintReceipt(receiptData);
        
        if (result.success) {
          toast({
            title: "Receipts Printed",
            description: "Both KOT and Order Receipt sent via PrintNode",
            variant: "default",
          });
          return;
        } else {
          console.error('PrintNode failed:', result.error);
          toast({
            title: "PrintNode Error",
            description: result.error || "Failed to print via PrintNode",
            variant: "destructive",
          });
          return; // Don't fallback to browser print
        }
      } else {
        console.error('PrintNode not available');
        toast({
          title: "PrintNode Not Available",
          description: "PrintNode service is not configured or available",
          variant: "destructive",
        });
        return; // Don't fallback to browser print
      }

      // No fallbacks - PrintNode only

    } catch (error) {
      console.error('Professional print error:', error);
      toast({
        title: "Print Error",
        description: "Error printing receipts",
        variant: "destructive",
      });
    }
  };

  // Browser print fallback
  const handlePrint = (order: Order) => {
    setReceiptOrder(order);
    setShowReceiptModal(true);
  };

  // Status update handler
  const handleStatusUpdate = (orderId: string, currentStatus: Order['status']) => {
    const statusFlow: Order['status'][] = ['received', 'confirmed', 'preparing', 'on_the_way', 'completed'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : 'completed';
    
    onStatusUpdate(orderId, nextStatus);
    toast({
      title: "Status Updated",
      description: `Order status changed to ${getStatusInfo(nextStatus).label}`,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'received', label: 'Received', count: orders.filter(o => o.status === 'received').length },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { value: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
    { value: 'on_the_way', label: 'On Way', count: orders.filter(o => o.status === 'on_the_way').length },
    { value: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-900">All Orders</h2>
          <Badge variant="secondary" className="text-xs">
            {sortedOrders.length} orders
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 w-full sm:w-48 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Toggles */}
      <div className="flex flex-wrap gap-1">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(option.value as Order['status'] | 'all')}
            className="flex items-center space-x-1 text-xs px-2 py-1 h-7"
          >
            <span>{option.label}</span>
            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
              {option.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {sortedOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const StatusIcon = statusInfo.icon;
          const items = orderItems[order.id] || [];
          const isFoodCourt = order.cafe?.type === 'food_court' || order.cafes?.type === 'food_court';

          return (
            <Card
              key={order.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${statusInfo.bgColor} border-2`}
              onClick={(e) => handleCardClick(order, e)}
            >
              <CardContent className="p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <StatusIcon className={`h-3 w-3 ${statusInfo.textColor}`} />
                    <Badge className={`${statusInfo.badgeColor} text-xs px-1 py-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getTimeElapsed(order.created_at)}
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">
                      {order.order_number}
                    </span>
                    <span className="font-bold text-sm text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <User className="h-2.5 w-2.5" />
                      <span className="truncate">{order.user?.full_name || order.customer_name || 'Walk-in'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate">{order.delivery_block}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(order.id, order.status);
                    }}
                    className="text-lg px-2 py-1 h-7 w-7"
                    title="Update Status"
                  >
                    ✏️
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintKOT(order);
                    }}
                    disabled={isPrinting || printNodePrinting}
                    className="text-lg px-2 py-1 h-7 w-7"
                    title="Print KOT"
                  >
                    🖨️
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintOrderReceipt(order);
                    }}
                    disabled={isPrinting || printNodePrinting}
                    className="text-lg px-2 py-1 h-7 w-7"
                    title="Print Receipt"
                  >
                    🧾
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Orders Message */}
      {sortedOrders.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here when customers place them'
            }
          </p>
        </div>
      )}

      {/* Order Details Popup */}
      {hoveredOrder && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: popupPosition.x > window.innerWidth - 400 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Order Details</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={closePopup}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Order Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{hoveredOrder.order_number}</span>
                <span className="font-bold text-lg">{formatCurrency(hoveredOrder.total_amount)}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span>{hoveredOrder.user?.full_name || hoveredOrder.customer_name || 'Walk-in Customer'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3" />
                  <span>{hoveredOrder.user?.phone || hoveredOrder.phone_number || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>{hoveredOrder.delivery_block}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(hoveredOrder.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
              <div className="space-y-1">
                {orderItems[hoveredOrder.id]?.map((item) => (
                  <div key={item.id} className="text-sm">
                    <div className="flex justify-between">
                      <span>{item.menu_item?.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.total_price)}</span>
                    </div>
                    {item.special_instructions && (
                      <div className="text-xs text-gray-500 italic">
                        Note: {item.special_instructions}
                      </div>
                    )}
                  </div>
                )) || <div className="text-sm text-gray-500">No items found</div>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate(hoveredOrder.id, hoveredOrder.status);
                  closePopup();
                }}
                className="text-lg px-3 py-2"
                title="Update Status"
              >
                ✏️ Update
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrintKOT(hoveredOrder);
                  closePopup();
                }}
                disabled={isPrinting || printNodePrinting}
                className="text-lg px-3 py-2"
                title="Print KOT"
              >
                🖨️ KOT
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrintOrderReceipt(hoveredOrder);
                  closePopup();
                }}
                disabled={isPrinting || printNodePrinting}
                className="text-lg px-3 py-2"
                title="Print Receipt"
              >
                🧾 Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modals */}
      {showReceiptModal && receiptOrder && (
        <FoodCourtReceipt
          order={receiptOrder}
          orderItems={orderItems[receiptOrder.id] || []}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptOrder(null);
          }}
          onPrint={() => {
            setShowReceiptModal(false);
            setReceiptOrder(null);
          }}
        />
      )}

      {showSimpleReceipt && simpleReceiptOrder && (
        <SimpleReceipt
          order={simpleReceiptOrder}
          orderItems={orderItems[simpleReceiptOrder.id] || []}
          onClose={() => {
            setShowSimpleReceipt(false);
            setSimpleReceiptOrder(null);
          }}
          onPrint={() => {
            setShowSimpleReceipt(false);
            setSimpleReceiptOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedOrderGrid;
