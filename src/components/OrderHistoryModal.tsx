import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  Download, 
  Calendar, 
  User, 
  ShoppingBag, 
  DollarSign,
  RefreshCw,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderHistory {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  discount_amount: number;
  team_member_credit: number;
  status: string;
  created_at: string;
  cafe_name: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
  teamMemberName: string;
}

const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  referralCode,
  teamMemberName
}) => {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch order history for the referral code
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          total_amount,
          discount_amount,
          team_member_credit,
          status,
          created_at,
          cafes!inner(name)
        `)
        .eq('referral_code_used', referralCode)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              quantity,
              unit_price,
              total_price,
              menu_items!inner(name)
            `)
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          return {
            ...order,
            cafe_name: order.cafes.name,
            order_items: (itemsData || []).map(item => ({
              id: item.id,
              name: item.menu_items.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price
            }))
          };
        })
      );

      setOrders(ordersWithItems);

    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Phone', 'Cafe', 'Amount', 'Discount', 'Credit', 'Status', 'Date', 'Items'],
      ...orders.map(order => [
        order.order_number,
        order.customer_name,
        order.customer_phone || 'N/A',
        order.cafe_name,
        order.total_amount,
        order.discount_amount,
        order.team_member_credit,
        order.status,
        new Date(order.created_at).toLocaleDateString(),
        order.order_items.map(item => `${item.quantity}x ${item.name}`).join('; ')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-orders-${referralCode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isOpen && referralCode) {
      fetchOrderHistory();
    }
  }, [isOpen, referralCode]);

  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalDiscount = orders.reduce((sum, order) => sum + order.discount_amount, 0);
  const totalCredit = orders.reduce((sum, order) => sum + order.team_member_credit, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Order History for {referralCode}
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Discount</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalDiscount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Team Credit</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalCredit.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-lg">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found for this referral code</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                          <p className="text-sm text-gray-600">{order.cafe_name}</p>
                        </div>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Customer Details
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Name:</strong> {order.customer_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Phone:</strong> {order.customer_phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Financial Details
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Discount:</strong> ₹{order.discount_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Team Credit:</strong> ₹{order.team_member_credit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Order Items
                      </h4>
                      <div className="space-y-1">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderHistoryModal;
