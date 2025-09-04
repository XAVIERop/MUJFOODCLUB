import React, { useState, useEffect } from 'react';
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
  Grid, 
  List,
  Plus,
  RefreshCw,
  BarChart3,
  Settings,
  Users,
  Package
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import CompactOrderGrid from '@/components/CompactOrderGrid';
import POSAnalytics from '@/components/POSAnalytics';
import ThermalPrinter from '@/components/ThermalPrinter';
import { thermalPrinterService, formatOrderForPrinting } from '@/api/thermalPrinter';
import NotificationCenter from '@/components/NotificationCenter';
import PrinterConfig from '@/components/PrinterConfig';
import PrinterStatus from '@/components/PrinterStatus';

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

const POSDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [useCompactLayout, setUseCompactLayout] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [cafeId, setCafeId] = useState<string | null>(null);

  // Scroll to top hook
  const { scrollToTopOnTabChange } = useScrollToTop();

  const fetchOrders = async () => {
    try {
      // First, try a simple query without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.error('Simple query failed:', simpleError);
        throw simpleError;
      }

      console.log('Simple query successful, found orders:', simpleData?.length || 0);

      // If simple query works, try the full query with joins
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Full query failed, using simple data:', error);
        // Use simple data if full query fails, but we need to transform it
        const transformedOrders = (simpleData || []).map(order => ({
          ...order,
          user: { full_name: 'Unknown', phone: null, block: 'Unknown', email: 'unknown@example.com' },
          order_items: []
        }));
        setOrders(transformedOrders);
        
        // Fetch order items separately for simple data
        const itemsData: {[key: string]: OrderItem[]} = {};
        for (const order of transformedOrders) {
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              menu_item:menu_items(name, description)
            `)
            .eq('order_id', order.id);

          if (itemsError) {
            console.error(`Error fetching items for order ${order.id}:`, itemsError);
          } else if (items && items.length > 0) {
            itemsData[order.id] = items;
          }
        }
        setOrderItems(itemsData);
      } else {
        console.log('Full query successful, found orders:', data?.length || 0);
        setOrders(data || []);
        
        // Extract order items from the joined data
        const itemsData: {[key: string]: OrderItem[]} = {};
        for (const order of data || []) {
          if (order.order_items && order.order_items.length > 0) {
            itemsData[order.id] = order.order_items;
          }
        }
        setOrderItems(itemsData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Database error updating order status:', error);
        throw new Error(`Database error: ${error.message || 'Unknown database error'}`);
      }

      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.replace('_', ' ')}`,
      });

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast({
        title: "Update Failed",
        description: `Failed to update order status: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const autoPrintReceipt = async (order: Order) => {
    try {
      // Fetch order items for the new order
      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_item:menu_items(name, description)
        `)
        .eq('order_id', order.id);

      if (error) {
        console.error('Error fetching order items:', error);
        return;
      }

      // Try direct thermal printer first
      try {
        const printJob = formatOrderForPrinting(order, items || []);
        const result = await thermalPrinterService.printReceipt(printJob);
        
        if (result.success) {
          toast({
            title: "Receipt Printed",
            description: `Receipt for order #${order.order_number} printed on PIXEL DP80`,
          });
          return;
        }
      } catch (thermalError) {
        console.log('Direct thermal printing failed, falling back to browser printing:', thermalError);
      }

      // Fallback to browser-based printing
      const generateThermalHTML = (orderData: Order, orderItems: any[]) => {
        console.log('POSDashboard - Cafe name:', orderData.cafe?.name);
        const isFoodCourt = orderData.cafe?.name?.toLowerCase().includes('food court') || 
                           orderData.cafe?.name === 'FOOD COURT' ||
                           orderData.cafe?.name?.toLowerCase() === 'food court';
        console.log('POSDashboard - Is Food Court:', isFoodCourt);
        
        if (isFoodCourt) {
          console.log('POSDashboard - Using Food Court receipt format');
          return generateFoodCourtReceipt(orderData, orderItems);
        } else {
          console.log('POSDashboard - Using MUJ Food Club receipt format');
          return generateMUJFoodClubReceipt(orderData, orderItems);
        }
      };

      const generateMUJFoodClubReceipt = (orderData: Order, orderItems: any[]) => {
        const orderDate = new Date(orderData.created_at);
        const dateStr = orderDate.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        const timeStr = orderDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Receipt #${orderData.order_number}</title>
              <style>
                @media print {
                  body { 
                    width: 80mm; 
                    margin: 0; 
                    padding: 5mm;
                    font-size: 12px; 
                    font-family: 'Courier New', monospace;
                    line-height: 1.2;
                  }
                  .no-print { display: none; }
                }
                
                body {
                  font-family: 'Courier New', monospace;
                  line-height: 1.2;
                  color: #000;
                  width: 80mm;
                  margin: 0 auto;
                  background: white;
                }
                
                .header {
                  text-align: center;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                
                .logo {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                
                .subtitle {
                  font-size: 12px;
                  color: #666;
                }
                
                .order-info {
                  margin-bottom: 15px;
                }
                
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 3px;
                }
                
                .items-section {
                  border-bottom: 1px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                
                .item-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                
                .item-name {
                  flex: 1;
                  margin-right: 10px;
                }
                
                .item-details {
                  text-align: right;
                  min-width: 80px;
                }
                
                .total-section {
                  text-align: right;
                  font-weight: bold;
                  font-size: 14px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 10px;
                  color: #666;
                  border-top: 1px dashed #000;
                  padding-top: 10px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">MUJ FOOD CLUB</div>
                <div class="subtitle">Delicious Food, Great Service</div>
                <div class="subtitle">www.mujfoodclub.in</div>
              </div>
              
              <div class="order-info">
                <div class="info-row">
                  <span>Receipt #:</span>
                  <span>${orderData.order_number}</span>
                </div>
                <div class="info-row">
                  <span>Date:</span>
                  <span>${dateStr}</span>
                </div>
                <div class="info-row">
                  <span>Time:</span>
                  <span>${timeStr}</span>
                </div>
                <div class="info-row">
                  <span>Customer:</span>
                  <span>${orderData.user?.full_name || 'Walk-in Customer'}</span>
                </div>
                <div class="info-row">
                  <span>Phone:</span>
                  <span>${orderData.user?.phone || orderData.phone_number || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Block:</span>
                  <span>${orderData.user?.block || orderData.delivery_block || 'N/A'}</span>
                </div>
              </div>
              
              <div class="items-section">
                <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                  <span>Item</span>
                  <span>Qty × Price</span>
                  <span>Total</span>
                </div>
                ${orderItems.map(item => `
                  <div class="item-row">
                    <div class="item-name">${item.menu_item.name}</div>
                    <div class="item-details">${item.quantity} × ₹${item.unit_price}</div>
                    <div class="item-details">₹${item.total_price}</div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total-section">
                <div class="info-row">
                  <span>Subtotal:</span>
                  <span>₹${orderData.subtotal}</span>
                </div>
                <div class="info-row">
                  <span>Tax (5%):</span>
                  <span>₹${orderData.tax_amount}</span>
                </div>
                <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                  <span>TOTAL:</span>
                  <span>₹${orderData.total_amount}</span>
                </div>
              </div>
              
              <div class="footer">
                <div>Thank you for your order!</div>
                <div>Please collect your receipt</div>
                <div>For support: support@mujfoodclub.in</div>
              </div>
            </body>
          </html>
        `;
      };

      const generateFoodCourtReceipt = (orderData: Order, orderItems: any[]) => {
        const orderDate = new Date(orderData.created_at);
        const dateStr = orderDate.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        });
        const timeStr = orderDate.toLocaleTimeString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Receipt #${orderData.order_number}</title>
              <style>
                @media print {
                  body { 
                    width: 80mm; 
                    margin: 0; 
                    padding: 5mm;
                    font-size: 12px; 
                    font-family: 'Courier New', monospace;
                    line-height: 1.2;
                  }
                  .no-print { display: none; }
                }
                
                body {
                  font-family: 'Courier New', monospace;
                  line-height: 1.2;
                  color: #000;
                  width: 80mm;
                  margin: 0 auto;
                  background: white;
                }
                
                .header {
                  text-align: center;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                
                .logo {
                  font-size: 16px;
                  font-weight: bold;
                  margin-bottom: 5px;
                }
                
                .subtitle {
                  font-size: 10px;
                  color: #666;
                }
                
                .order-info {
                  margin-bottom: 15px;
                }
                
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 3px;
                }
                
                .items-section {
                  border-bottom: 1px dashed #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                
                .item-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 5px;
                }
                
                .item-name {
                  flex: 1;
                  margin-right: 10px;
                }
                
                .item-details {
                  text-align: right;
                  min-width: 80px;
                }
                
                .total-section {
                  text-align: right;
                  font-weight: bold;
                  font-size: 14px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 10px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">The Food Court Co</div>
                <div class="subtitle">(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)</div>
                <div class="subtitle">GSTIN: 08ADNPG4024A1Z2</div>
              </div>
              
              <div class="order-info">
                <div class="info-row">
                  <span>Name:</span>
                  <span>${orderData.user?.full_name || 'Walk-in Customer'} (M: ${orderData.user?.phone || orderData.phone_number || 'N/A'})</span>
                </div>
                <div class="info-row">
                  <span>Date:</span>
                  <span>${dateStr}</span>
                </div>
                <div class="info-row">
                  <span>Time:</span>
                  <span>${timeStr}</span>
                </div>
                <div class="info-row">
                  <span>Order Type:</span>
                  <span>Pick Up</span>
                </div>
                <div class="info-row">
                  <span>Cashier:</span>
                  <span>biller</span>
                </div>
                <div class="info-row">
                  <span>Bill No.:</span>
                  <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
                </div>
                <div class="info-row">
                  <span>Token No.:</span>
                  <span>${Math.floor(Math.random() * 10) + 1}</span>
                </div>
              </div>
              
              <div class="items-section">
                <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                  <span>Item</span>
                  <span>Qty.</span>
                  <span>Price</span>
                  <span>Amount</span>
                </div>
                ${orderItems.map(item => `
                  <div class="item-row">
                    <div class="item-name">${item.menu_item.name}</div>
                    <div class="item-details">${item.quantity}</div>
                    <div class="item-details">${item.unit_price}.00</div>
                    <div class="item-details">${item.total_price}.00</div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total-section">
                <div class="info-row">
                  <span>Total Qty:</span>
                  <span>${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div class="info-row">
                  <span>Sub Total:</span>
                  <span>${orderData.subtotal}.00</span>
                </div>
                <div class="info-row">
                  <span>CGST@2.5 2.5%:</span>
                  <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span>SGST@2.5 2.5%:</span>
                  <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span>Round off:</span>
                  <span>+0.04</span>
                </div>
                <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                  <span>Grand Total:</span>
                  <span>₹${orderData.total_amount}.00</span>
                </div>
              </div>
              
              <div class="footer">
                <div>Paid via: Other [UPI]</div>
                <div style="margin-top: 10px;">Thanks For Visit!!</div>
              </div>
            </body>
          </html>
        `;
      };

      // Open print window and auto-print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const thermalHTML = generateThermalHTML(order, items || []);
        printWindow.document.write(thermalHTML);
        printWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }

      toast({
        title: "Receipt Generated",
        description: `Receipt for order #${order.order_number} printed via browser (PIXEL DP80 not available)`,
      });

    } catch (error) {
      console.error('Error auto-printing receipt:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate receipt automatically",
        variant: "destructive"
      });
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCompactStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'received': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return ChefHat;
      case 'on_the_way': return Truck;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: Order['status']) => {
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

  const getNextStatus = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'on_the_way';
      case 'on_the_way': return 'completed';
      default: return null;
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  useEffect(() => {
    if (profile?.cafe_id) {
      setCafeId(profile.cafe_id);
    }
  }, [profile]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`pos-orders-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        async (payload) => {
          fetchOrders();
          setUnreadNotifications(prev => prev + 1);
          
          toast({
            title: "New Order!",
            description: `Order #${payload.new.order_number} received`,
          });

          // Auto-generate and print receipt for new orders
          if (profile?.cafe_id === 'chatkara') {
            setTimeout(() => {
              autoPrintReceipt(payload.new);
            }, 2000); // Wait 2 seconds for order data to be fetched
          }
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          setOrders(prev => 
            prev.map(order => 
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  useEffect(() => {
    if (cafeId) {
      fetchOrders();
    }
  }, [cafeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
              <p className="text-gray-600 mt-2">Professional Point of Sale System for High-Volume Operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsNotificationOpen(true)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button onClick={fetchOrders} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Printer Configuration and Status - PROMINENT */}
        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-yellow-800 mb-4">🖨️ Printer Setup Required</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Configure your Epson TM-T82 thermal printer to enable direct printing. 
            If you don't see the configuration panel below, please refresh the page.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PrinterConfig />
            <div className="flex items-center">
              <PrinterStatus />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + order.total_amount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(order => order.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            scrollToTopOnTabChange(value);
          }} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-6 gap-1 sm:gap-2">
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">O</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">A</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Inventory</span>
              <span className="sm:hidden">I</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Customers</span>
              <span className="sm:hidden">C</span>
            </TabsTrigger>
            <TabsTrigger value="print" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">P</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">S</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Chatkara Auto-Print Notice */}
            {profile?.cafe_id === 'chatkara' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">PIXEL DP80 Auto-Print Enabled</h3>
                    <p className="text-sm text-green-700">
                      Receipts will automatically print when new orders are received. 
                      Make sure your PIXEL DP80 thermal printer is connected and set as default.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200 gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Button
                  variant={useCompactLayout ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCompactLayout(true)}
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Compact Grid
                </Button>
                <Button
                  variant={!useCompactLayout ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCompactLayout(false)}
                >
                  <List className="w-4 h-4 mr-2" />
                  Detailed List
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {useCompactLayout ? 'Grid view for high-volume orders' : 'Detailed view for individual orders'}
              </div>
            </div>

            {/* Compact Grid View */}
            {useCompactLayout && (
              <CompactOrderGrid
                orders={orders}
                orderItems={orderItems}
                onOrderSelect={handleOrderSelect}
                onStatusUpdate={handleCompactStatusUpdate}
                loading={loading}
              />
            )}

            {/* Detailed List View */}
            {!useCompactLayout && (
              <div className="space-y-4">
                {['received', 'confirmed', 'preparing', 'on_the_way', 'completed'].map((status) => (
                  <div key={status} className="space-y-4">
                    <h3 className="text-lg font-semibold capitalize">{status.replace('_', ' ')} Orders</h3>
                    {filterOrdersByStatus(status).length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No {status.replace('_', ' ')} orders</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filterOrdersByStatus(status).map((order) => {
                        const StatusIcon = getStatusIcon(order.status);
                        const nextStatus = getNextStatus(order.status);
                        const items = orderItems[order.id] || [];

                        return (
                          <Card key={order.id} className="food-card">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center">
                                    <span>Order #{order.order_number}</span>
                                    <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                                      <StatusIcon className="w-4 h-4 mr-1" />
                                      {order.status.toUpperCase()}
                                    </Badge>
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(order.created_at)} • Block {order.delivery_block}
                                    {order.phone_number && (
                                      <span className="ml-2">• 📞 {order.phone_number}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">₹{order.total_amount}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {order.payment_method.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {/* Order Items */}
                              <div className="space-y-2">
                                <h4 className="font-semibold">Order Items ({items.length} items):</h4>
                                {items.length > 0 ? (
                                  items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                      <div>
                                        <span className="font-medium">{item.quantity}x {item.menu_item.name}</span>
                                        {item.special_instructions && (
                                          <p className="text-muted-foreground text-xs">
                                            Note: {item.special_instructions}
                                          </p>
                                        )}
                                      </div>
                                      <span>₹{item.total_price}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-muted-foreground">
                                    <p>No items found for this order</p>
                                    <p className="text-xs mt-1">Order total: ₹{order.total_amount}</p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                {nextStatus && (
                                  <Button
                                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                                    disabled={updatingOrder === order.id}
                                    className="flex-1"
                                  >
                                    {updatingOrder === order.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as {nextStatus.replace('_', ' ')}
                                      </>
                                    )}
                                  </Button>
                                )}
                                {order.status === 'received' && (
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                    disabled={updatingOrder === order.id}
                                  >
                                    Cancel Order
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <POSAnalytics 
              orders={orders}
              orderItems={orderItems}
              loading={loading}
            />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Inventory features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customer features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Print Tab */}
          <TabsContent value="print" className="space-y-6">
            <ThermalPrinter 
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>POS Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          userType="cafe_staff"
          cafeId={cafeId}
        />
      </div>
    </div>
  );
};

export default POSDashboard;
