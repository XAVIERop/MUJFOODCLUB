import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  Receipt, 
  Bell, 
  RefreshCw,
  BarChart3,
  Settings,
  Users,
  Package,
  QrCode,
  Database,
  Download,
  TrendingUp,
  Volume2
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSoundNotifications } from '@/hooks/useSoundNotifications';
import { useOrderSubscriptions, useNotificationSubscriptions } from '@/hooks/useSubscriptionManager';
import { useSimplePOSUpdates } from '@/hooks/useSimplePOSUpdates';
import { useCafeStaff } from '@/hooks/useCafeStaff';
import Header from '@/components/Header';
import PasswordProtectedSection from '@/components/PasswordProtectedSection';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load heavy components
const StaffManagement = lazy(() => import('@/components/StaffManagement'));
const EnhancedOrderGrid = lazy(() => import('@/components/EnhancedOrderGrid'));
const POSAnalytics = lazy(() => import('@/components/POSAnalytics'));
const ThermalPrinter = lazy(() => import('@/components/ThermalPrinter'));
const NotificationCenter = lazy(() => import('@/components/NotificationCenter'));
const SimplePrinterConfig = lazy(() => import('@/components/SimplePrinterConfig'));
const PrintNodeStatus = lazy(() => import('@/components/PrintNodeStatus'));
const ManualOrderEntry = lazy(() => import('@/components/ManualOrderEntry'));
const OrderNotificationSound = lazy(() => import('@/components/OrderNotificationSound'));

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
  user_id: string;
  cafe_id: string;
  points_credited: boolean;
  phone_number?: string;
  customer_name?: string;
  subtotal?: number;
  tax_amount?: number;
  table_number?: string;
  delivered_by_staff_id?: string;
  cafe?: {
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

interface OptimizedPOSDashboardProps {
  orders: Order[];
  orderItems: { [key: string]: OrderItem[] };
  loading: boolean;
  onRefresh: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

// Memoized components for better performance
const OrderStatusBadge = React.memo(({ status }: { status: string }) => {
  const statusConfig = {
    received: { label: 'Received', color: 'bg-blue-100 text-blue-800', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: ChefHat },
    on_the_way: { label: 'On the Way', color: 'bg-purple-100 text-purple-800', icon: Truck },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.received;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
});

const OrderCard = React.memo(({ order, orderItems, onStatusUpdate }: {
  order: Order;
  orderItems: OrderItem[];
  onStatusUpdate: (orderId: string, status: string) => void;
}) => {
  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(order.id, newStatus);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">#{order.order_number}</CardTitle>
            <p className="text-sm text-gray-600">
              {order.customer_name || order.user?.full_name || 'Unknown Customer'}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total: ₹{order.total_amount}</span>
            <span>Block: {order.delivery_block}</span>
          </div>
          
          {orderItems.length > 0 && (
            <div className="text-sm">
              <p className="font-medium">Items:</p>
              <ul className="list-disc list-inside space-y-1">
                {orderItems.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.menu_item.name} - ₹{item.total_price}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            {order.status === 'received' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('confirmed')}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Confirm
              </Button>
            )}
            {order.status === 'confirmed' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('preparing')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Start Preparing
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('on_the_way')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Out for Delivery
              </Button>
            )}
            {order.status === 'on_the_way' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange('completed')}
                className="bg-green-500 hover:bg-green-600"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const OptimizedPOSDashboard: React.FC<OptimizedPOSDashboardProps> = ({
  orders,
  orderItems,
  loading,
  onRefresh,
  onStatusUpdate
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { staff, loading: staffLoading } = useCafeStaff();
  const [activeTab, setActiveTab] = React.useState('orders');

  // Memoized statistics
  const stats = React.useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
      ['received', 'confirmed', 'preparing'].includes(order.status)
    ).length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading POS Dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PasswordProtectedSection>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
              <p className="text-gray-600">Manage orders and staff efficiently</p>
            </div>
            <Button onClick={onRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        orderItems={orderItems[order.id] || []}
                        onStatusUpdate={onStatusUpdate}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Suspense fallback={<LoadingSpinner size="sm" text="Loading..." />}>
                      <ManualOrderEntry />
                    </Suspense>
                    <Suspense fallback={<LoadingSpinner size="sm" text="Loading..." />}>
                      <ThermalPrinter />
                    </Suspense>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading staff management..." />}>
                <StaffManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="analytics">
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading analytics..." />}>
                <POSAnalytics orders={orders} orderItems={orderItems} />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <Suspense fallback={<LoadingSpinner size="sm" text="Loading..." />}>
                  <SimplePrinterConfig />
                </Suspense>
                <Suspense fallback={<LoadingSpinner size="sm" text="Loading..." />}>
                  <PrintNodeStatus />
                </Suspense>
                <Suspense fallback={<LoadingSpinner size="sm" text="Loading..." />}>
                  <NotificationCenter />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PasswordProtectedSection>
    </div>
  );
};

export default OptimizedPOSDashboard;
