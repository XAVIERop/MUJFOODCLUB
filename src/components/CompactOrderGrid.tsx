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
  AlertCircle,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  user?: {
    full_name: string;
    phone: string | null;
    block: string;
    email: string;
  };
}

interface CompactOrderGridProps {
  orders: Order[];
  orderItems: {[key: string]: OrderItem[]};
  onOrderSelect: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
  loading?: boolean;
}

const CompactOrderGrid: React.FC<CompactOrderGridProps> = ({
  orders,
  orderItems,
  onOrderSelect,
  onStatusUpdate,
  loading = false
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  // Get status color and icon
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'received':
        return { color: 'bg-blue-500', icon: Clock, label: 'Received' };
      case 'confirmed':
        return { color: 'bg-green-500', icon: CheckCircle, label: 'Confirmed' };
      case 'preparing':
        return { color: 'bg-yellow-500', icon: AlertCircle, label: 'Preparing' };
      case 'on_the_way':
        return { color: 'bg-purple-500', icon: Eye, label: 'On Way' };
      case 'completed':
        return { color: 'bg-green-600', icon: CheckCircle, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-500', icon: X, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-500', icon: Clock, label: 'Unknown' };
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

  // Group orders by status for better organization
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      'received': [],
      'confirmed': [],
      'preparing': [],
      'on_the_way': [],
      'completed': [],
      'cancelled': []
    };
    
    filteredOrders.forEach(order => {
      grouped[order.status].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  // Calculate grid dimensions based on order count
  const gridCols = Math.max(11, Math.ceil(Math.sqrt(filteredOrders.length)));
  const gridRows = Math.ceil(filteredOrders.length / gridCols);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    onOrderSelect(order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await onStatusUpdate(orderId, newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="compact-order-grid space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Orders Overview</h2>
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="on_the_way">On Way</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {/* Refresh */}
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          const statusInfo = getStatusInfo(status as Order['status']);
          const Icon = statusInfo.icon;
          
          return (
            <div key={status} className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={`w-4 h-4 ${statusInfo.color.replace('bg-', 'text-')}`} />
                <span className="text-xs font-medium">{statusInfo.label}</span>
              </div>
              <div className="text-lg font-bold">{statusOrders.length}</div>
            </div>
          );
        })}
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          if (statusOrders.length === 0) return null;
          
          const statusInfo = getStatusInfo(status as Order['status']);
          
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                <h3 className="font-semibold">{statusInfo.label} Orders ({statusOrders.length})</h3>
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-11 lg:grid-cols-12 gap-2">
                {statusOrders.map((order) => (
                  <Card
                    key={order.id}
                    className={`order-card cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <CardContent className="p-2 text-center space-y-1">
                      {/* Time Elapsed */}
                      <div className="text-xs font-medium text-muted-foreground">
                        {getTimeElapsed(order.created_at)}
                      </div>
                      
                      {/* Order Number */}
                      <div className="text-sm font-bold">
                        {order.order_number.replace('CHA', '')}
                      </div>
                      
                      {/* Amount */}
                      <div className="text-xs font-medium text-primary">
                        {formatCurrency(order.total_amount)}
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex justify-center gap-1 mt-1">
                        {getAvailableStatuses(order.status).length > 0 && (
                          <>
                            {/* Next Status Button */}
                            {getAvailableStatuses(order.status).filter(s => s !== 'cancelled').map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-green-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(order.id, status);
                                }}
                                title={`Mark as ${status.replace('_', ' ')}`}
                              >
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </Button>
                            ))}
                            
                            {/* Cancel Button */}
                            {getAvailableStatuses(order.status).includes('cancelled') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(order.id, 'cancelled');
                                }}
                                title="Cancel Order"
                              >
                                <X className="w-3 h-3 text-red-600" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'No orders match your search criteria' 
              : 'No orders found'
            }
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Selected Order Details */}
      {selectedOrder && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Order Details: {selectedOrder.order_number}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Combined Order & Customer Details */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className="ml-2" variant="secondary">
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Block:</span>
                <span className="ml-2 font-medium">{selectedOrder.delivery_block}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2 font-medium">{getTimeElapsed(selectedOrder.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium mt-1">
                  {selectedOrder.user?.full_name || selectedOrder.customer_name || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium mt-1">
                  {(selectedOrder.user?.phone || selectedOrder.phone_number) ? (
                    <a 
                      href={`tel:${selectedOrder.user?.phone || selectedOrder.phone_number}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      📞 {selectedOrder.user?.phone || selectedOrder.phone_number}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Order Items ({orderItems[selectedOrder.id]?.length || 0} items):</h4>
              {orderItems[selectedOrder.id] && orderItems[selectedOrder.id].length > 0 ? (
                <div className="space-y-2">
                  {orderItems[selectedOrder.id].map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 rounded-lg p-2">
                      <div className="flex-1">
                        <span className="font-medium">{item.quantity}x {item.menu_item.name}</span>
                        {item.special_instructions && (
                          <p className="text-muted-foreground text-xs mt-1">
                            Note: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-primary">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No items found for this order</p>
                  <p className="text-xs mt-1">Order total: {formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              )}
            </div>
            
            {/* Status Update and Actions */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Order Actions:</h4>
              
              {/* Status Update Section */}
              {getAvailableStatuses(selectedOrder.status).length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Update Status:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {getAvailableStatuses(selectedOrder.status).map((status) => (
                        <Button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                          variant={status === 'cancelled' ? 'destructive' : 'default'}
                          size="sm"
                          className="text-xs"
                        >
                          {status === 'cancelled' ? 'Cancel Order' : `Mark as ${status.replace('_', ' ')}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Current Status Info */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusInfo(selectedOrder.status).color + ' text-white'}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
                {selectedOrder.status === 'completed' && (
                  <span className="text-green-600 text-xs">✓ Order completed successfully</span>
                )}
                {selectedOrder.status === 'cancelled' && (
                  <span className="text-red-600 text-xs">✗ Order has been cancelled</span>
                )}
              </div>

              {/* Additional Actions */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                <Button variant="outline" size="sm">
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to get next status
const getNextStatus = (currentStatus: Order['status']): Order['status'] => {
  switch (currentStatus) {
    case 'received': return 'confirmed';
    case 'confirmed': return 'preparing';
    case 'preparing': return 'on_the_way';
    case 'on_the_way': return 'completed';
    case 'completed': return 'completed'; // Already completed
    case 'cancelled': return 'cancelled'; // Already cancelled
    default: return currentStatus;
  }
};

// Helper function to get available status options
const getAvailableStatuses = (currentStatus: Order['status']): Order['status'][] => {
  switch (currentStatus) {
    case 'received':
      return ['confirmed', 'cancelled'];
    case 'confirmed':
      return ['preparing', 'cancelled'];
    case 'preparing':
      return ['on_the_way', 'cancelled'];
    case 'on_the_way':
      return ['completed', 'cancelled'];
    case 'completed':
      return []; // No further status changes
    case 'cancelled':
      return []; // No further status changes
    default:
      return [];
  }
};

export default CompactOrderGrid;
