import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  Receipt, 
  ArrowLeft, 
  Eye, 
  ShoppingCart, 
  Search,
  Filter,
  Calendar,
  MapPin,
  CreditCard,
  Star,
  Share2,
  RotateCcw,
  X,
  MoreVertical,
  Package,
  Timer,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserOrdersQuery } from '@/hooks/useOrdersQuery.tsx';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import OrderTimeline from '@/components/OrderTimeline';

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  delivery_block: string;
  delivery_notes?: string;
  payment_method: string;
  estimated_delivery: string;
  created_at: string;
  status_updated_at: string;
  cafe: {
    name: string;
    location: string;
  };
  order_items: Array<{
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
  }>;
}

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  // Use React Query for data fetching
  const { 
    data: orders = [], 
    isLoading, 
    error, 
    refetch 
  } = useUserOrdersQuery(user?.id || null, {
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Only trigger if at the very top and pulling down
      if (scrollTop === 0 && currentY > startY && currentY - startY > 50) {
        if (!isPulling && !isRefreshing) {
          isPulling = true;
          setIsRefreshing(true);
          refetch().finally(() => {
            setIsRefreshing(false);
            isPulling = false;
          });
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [refetch, isRefreshing]);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.cafe?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.order_items || []).some(item => 
          item.menu_item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(order => 
          ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)
        );
      } else {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'amount_high':
          return b.total_amount - a.total_amount;
        case 'amount_low':
          return a.total_amount - b.total_amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, dateFilter, sortBy]);

  // Get order statistics
  const orderStats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    return {
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent
    };
  }, [orders]);

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

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleReorder = useCallback(async (order: Order) => {
    try {
      // Navigate to the cafe menu with pre-filled cart
      navigate(`/menu/${order.cafe?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-cafe'}`, {
        state: { reorderItems: order.order_items || [] }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder items",
        variant: "destructive"
      });
    }
  }, [navigate, toast]);

  const handleShareOrder = useCallback(async (order: Order) => {
    try {
      const shareData = {
        title: `Order #${order.order_number}`,
        text: `Check out my order from ${order.cafe?.name || 'Unknown Cafe'} - ₹${order.total_amount}`,
        url: window.location.origin + `/order-confirmation/${order.order_number}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied",
          description: "Order link copied to clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share order",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    if (!user?.id) return;
    
    // Check if order is in 'received' status (customers can only cancel received orders)
    const order = filteredOrders.find(o => o.id === orderId);
    if (order && order.status !== 'received') {
      toast({
        title: "Cannot Cancel Order",
        description: "You can only cancel orders that are still pending confirmation",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('cancel_order_with_reason', {
        p_order_id: orderId,
        p_cancelled_by: user.id,
        p_cancellation_reason: 'Cancelled by customer from My Orders'
      });

      if (error) throw error;

      // Handle new JSONB response format
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          throw new Error(data.error || 'Failed to cancel order');
        }
      }

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully"
      });

      refetch();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel order",
        variant: "destructive"
      });
    }
  }, [toast, refetch, user?.id, filteredOrders]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">You need to sign in to view your orders.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">Error Loading Orders</h1>
            <p className="text-muted-foreground mb-6">Failed to load your orders. Please try again.</p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Order Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold">{orderStats.activeOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">₹{orderStats.totalSpent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orderStats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders, cafes, or items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="on_the_way">On the Way</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                    <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'No Orders Found' 
                    : 'No Orders Yet'
                  }
                </h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'You haven\'t placed any orders yet. Start ordering from your favorite cafes!'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && dateFilter === 'all' && (
                  <Button onClick={() => navigate('/')}>
                    Browse Cafes
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                const canCancel = order.status === 'received';
                
                return (
                  <Card key={order.id} className="food-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center">
                            <span>Order #{order.order_number}</span>
                            <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {getStatusLabel(order.status)}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(order.created_at)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {order.cafe?.name || 'Unknown Cafe'}
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-1" />
                              {order.payment_method.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.total_amount}</p>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.order_number}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Items Preview */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Order Items:</p>
                        <div className="space-y-1">
                          {(order.order_items || []).slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.menu_item.name}</span>
                              <span>₹{item.total_price}</span>
                            </div>
                          ))}
                          {(order.order_items || []).length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{(order.order_items || []).length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Delivery Block:</span>
                          <p className="font-semibold">{order.delivery_block}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-semibold capitalize">{order.status.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Delivery Notes */}
                      {order.delivery_notes && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">
                            <span className="font-medium">Delivery Notes:</span> {order.delivery_notes}
                          </p>
                        </div>
                      )}

                      {/* Order Timeline */}
                      {expandedOrder === order.id && (
                        <div className="mt-4">
                          <OrderTimeline 
                            status={order.status}
                            createdAt={order.created_at}
                            estimatedDelivery={order.estimated_delivery}
                            deliveryBlock={order.delivery_block}
                          />
                        </div>
                      )}

                      {/* Order Completed Status */}
                      {order.status === 'completed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <div>
                              <p className="font-semibold text-green-800">
                                Order Completed!
                              </p>
                              <p className="text-sm text-green-600">
                                Thank you for your order!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/order-confirmation/${order.order_number}`)}
                          className="flex-1 min-w-0"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setExpandedOrder(
                            expandedOrder === order.id ? null : order.id
                          )}
                          className="flex-1 min-w-0"
                        >
                          <Timer className="w-4 h-4 mr-2" />
                          {expandedOrder === order.id ? 'Hide Timeline' : 'Show Timeline'}
                        </Button>
                        
                        {order.status === 'completed' && (
                          <Button
                            onClick={() => handleReorder(order)}
                            className="flex-1 min-w-0"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleShareOrder(order)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Order
                            </DropdownMenuItem>
                            {canCancel && (
                              <DropdownMenuItem 
                                onClick={() => handleCancelOrder(order.id)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
