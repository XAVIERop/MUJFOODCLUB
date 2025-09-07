import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Package,
  QrCode,
  Database,
  Download,
  TrendingUp,
  Volume2,
  ChevronDown,
  Search
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useSoundNotifications } from '@/hooks/useSoundNotifications';
import { soundNotificationService } from '@/services/soundNotificationService';
import { useOrderSubscriptions, useNotificationSubscriptions } from '@/hooks/useSubscriptionManager';
import EnhancedOrderGrid from '@/components/EnhancedOrderGrid';
import POSAnalytics from '@/components/POSAnalytics';
import ThermalPrinter from '@/components/ThermalPrinter';
import { thermalPrinterService, formatOrderForPrinting } from '@/api/thermalPrinter';
import { createCafePrintService } from '@/services/cafeSpecificPrintService';
import NotificationCenter from '@/components/NotificationCenter';
import SimplePrinterConfig from '@/components/SimplePrinterConfig';
import PrintNodeStatus from '@/components/PrintNodeStatus';
import ManualOrderEntry from '@/components/ManualOrderEntry';
import OrderNotificationSound from '@/components/OrderNotificationSound';
import SoundDebugger from '@/components/SoundDebugger';
import { testPrintNodeSetup } from '@/utils/testPrintNodeSetup';
import Header from '@/components/Header';
import PasswordProtectedSection from '@/components/PasswordProtectedSection';

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

const POSDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [useCompactLayout, setUseCompactLayout] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [cafeId, setCafeId] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isPrinterSetupOpen, setIsPrinterSetupOpen] = useState(false);
  const [isSettingsPrinterOpen, setIsSettingsPrinterOpen] = useState(false);

  // Scroll to top hook
  const { scrollToTopOnTabChange } = useScrollToTop();

  // Sound notification settings
  const {
    isEnabled: soundEnabled,
    volume: soundVolume,
    toggleSound,
    setVolume,
  } = useSoundNotifications();

  const fetchOrders = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      
      // Add cache-busting parameter to prevent stale data
      const cacheBuster = Date.now();
      console.log('POS Dashboard: Fetching orders with cache buster:', cacheBuster);
      
      // First, try a simple query without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .neq('id', '00000000-0000-0000-0000-000000000000') // Cache buster
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
        .neq('id', '00000000-0000-0000-0000-000000000000') // Cache buster
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
        setFilteredOrders(data || []);
        
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
      setIsRefreshing(false);
    }
  };

  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.full_name && order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.user?.block && order.user.block.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.delivery_block.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];

      if (sortBy === 'user') {
        aValue = a.user?.full_name || a.customer_name || '';
        bValue = b.user?.full_name || b.customer_name || '';
      }

      if (sortBy === 'created_at') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Function to credit points to user when order is completed (Cafe-specific system)
  const creditPointsToUser = async (orderId: string) => {
    try {
      console.log('POS Dashboard: Crediting points for completed order:', orderId);
      
      // Get the order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, points_earned, total_amount, cafe_id')
        .eq('id', orderId)
        .single() as any;

      if (orderError || !order) {
        console.error('Error fetching order for points crediting:', orderError);
        return;
      }

      if (!order.points_earned || order.points_earned <= 0) {
        console.log('No points to credit for this order');
        return;
      }

      // Use the cafe-specific loyalty system
      const { error: loyaltyError } = await (supabase as any)
        .rpc('update_cafe_loyalty_points', {
          p_user_id: order.user_id,
          p_cafe_id: order.cafe_id,
          p_order_id: orderId,
          p_order_amount: order.total_amount
        });

      if (loyaltyError) {
        console.error('Error updating cafe loyalty points:', loyaltyError);
        // Fallback: create manual transaction record
        const { error: fallbackError } = await supabase
          .from('cafe_loyalty_transactions')
          .insert({
            user_id: order.user_id,
            cafe_id: order.cafe_id,
            order_id: orderId,
            points_change: order.points_earned,
            transaction_type: 'earned',
            description: `Earned ${order.points_earned} points for completed order`
          } as any);

        if (fallbackError) {
          console.error('Error creating fallback loyalty transaction:', fallbackError);
        }
      }

      console.log(`✅ Successfully credited ${order.points_earned} points to user ${order.user_id} for cafe ${order.cafe_id}`);
      
    } catch (error) {
      console.error('Error in creditPointsToUser:', error);
      // Don't fail the order completion for points crediting errors
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Prevent multiple rapid updates
    if (updatingOrder === orderId) {
      console.log('POS Dashboard: Order update already in progress, ignoring');
      return;
    }
    
    setUpdatingOrder(orderId);
    try {
      const updateData: any = {
        status: newStatus,
        status_updated_at: new Date().toISOString()
      };

      // Add timestamp for specific status
      switch (newStatus) {
        case 'confirmed':
          updateData.accepted_at = new Date().toISOString();
          break;
        case 'preparing':
          updateData.preparing_at = new Date().toISOString();
          break;
        case 'on_the_way':
          updateData.out_for_delivery_at = new Date().toISOString();
          break;
        case 'completed':
          updateData.completed_at = new Date().toISOString();
          updateData.points_credited = true;
          
          // Credit points to user when order is completed
          await creditPointsToUser(orderId);
          break;
      }

      console.log('POS Dashboard: Updating order with data:', { orderId, updateData });
      
      const { data, error } = await (supabase as any)
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();
      
      console.log('POS Dashboard: Update result:', { data, error });

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus.replace('_', ' ')}`,
      });

      // Small delay to prevent rapid updates
      await new Promise(resolve => setTimeout(resolve, 500));

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

  const autoPrintReceiptWithCafeService = async (order: Order) => {
    try {
      console.log('Auto-printing with cafe-specific service for order:', order.order_number);
      
      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          special_instructions,
          menu_item:menu_items(name, description)
        `)
        .eq('order_id', order.id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return;
      }

      // Use cafe-specific print service
      console.log('🔍 Creating cafe-specific print service for cafe_id:', order.cafe_id);
      const cafePrintService = createCafePrintService(order.cafe_id);
      console.log('🔍 Initializing cafe-specific print service...');
      const initResult = await cafePrintService.initialize();
      console.log('🔍 Cafe-specific print service initialization result:', initResult);

      const receiptData = {
        order_id: order.id,
        order_number: order.order_number,
        cafe_name: order.cafe?.name || 'Cafe',
        customer_name: order.user?.full_name || 'Customer',
        customer_phone: order.user?.phone || order.phone_number || 'N/A',
        delivery_block: order.delivery_block || order.user?.block || 'N/A',
        items: (items || []).map(item => ({
          id: item.id,
          name: item.menu_item?.name || 'Item',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions
        })),
        subtotal: order.subtotal || 0,
        tax_amount: order.tax_amount || 0,
        discount_amount: 0, // Will be calculated from order data
        final_amount: order.total_amount,
        payment_method: order.payment_method || 'COD',
        order_date: order.created_at,
        estimated_delivery: order.estimated_delivery || '30 minutes',
        points_earned: order.points_earned || 0,
        points_redeemed: 0 // Will be calculated from order data
      };

      // Print KOT and Receipt using cafe-specific service
      const kotResult = await cafePrintService.printKOT(receiptData);
      const receiptResult = await cafePrintService.printReceipt(receiptData);
      
      if (kotResult.success && receiptResult.success) {
        toast({
          title: "Receipt Printed",
          description: `KOT and Receipt for order #${order.order_number} sent to cafe printer`,
        });
      } else {
        console.error('Cafe-specific printing failed:', { kotResult, receiptResult });
        // Fallback to original method
        autoPrintReceipt(order);
      }
    } catch (error) {
      console.error('Error in cafe-specific auto-print:', error);
      // Fallback to original method
      autoPrintReceipt(order);
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
        const isChatkara = orderData.cafe?.name?.toLowerCase().includes('chatkara') || 
                           orderData.cafe?.name === 'CHATKARA' ||
                           orderData.cafe?.name?.toLowerCase() === 'chatkara';
        
        console.log('POSDashboard - Is Food Court:', isFoodCourt);
        console.log('POSDashboard - Is Chatkara:', isChatkara);
        
        if (isFoodCourt) {
          console.log('POSDashboard - Using Food Court receipt format');
          return generateFoodCourtReceipt(orderData, orderItems);
        } else if (isChatkara) {
          console.log('POSDashboard - Using Chatkara receipt format');
          return generateChatkaraReceipt(orderData, orderItems);
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

      const generateChatkaraReceipt = (orderData: Order, orderItems: any[]) => {
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
                  margin: 0;
                  padding: 5mm;
                  width: 80mm;
                }
                
                .receipt {
                  width: 100%;
                  text-align: center;
                }
                
                .cafe-name {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                }
                
                .customer-info {
                  text-align: left;
                  margin-bottom: 10px;
                  font-size: 11px;
                }
                
                .order-details {
                  text-align: left;
                  margin-bottom: 10px;
                  font-size: 11px;
                }
                
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 10px;
                  font-size: 11px;
                }
                
                .items-table th {
                  text-align: left;
                  border-bottom: 1px solid #000;
                  padding: 2px 0;
                }
                
                .items-table td {
                  padding: 2px 0;
                }
                
                .summary {
                  text-align: left;
                  margin-top: 10px;
                  font-size: 11px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 15px;
                  font-size: 12px;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="cafe-name">${orderData.cafe?.name || 'Chatkara'}</div>
                
                <div class="customer-info">
                  <div>Name: (M: ${orderData.user?.phone || orderData.phone_number || 'N/A'})</div>
                  <div>Adr: ${orderData.user?.block || orderData.delivery_block || 'N/A'}</div>
                </div>
                
                <div class="order-details">
                  <div>Date: ${dateStr}</div>
                  <div>${timeStr}</div>
                  <div>Delivery</div>
                  <div>Cashier: biller</div>
                  <div>Bill No.: ${orderData.order_number}</div>
                  <div>Token No.: ${orderData.order_number}</div>
                </div>
                
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty.</th>
                      <th>Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orderItems.map(item => `
                      <tr>
                        <td>${item.menu_item?.name || 'Unknown Item'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>${item.total_price.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="summary">
                  <div>Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
                  <div>Sub Total: ${orderData.total_amount.toFixed(2)}</div>
                  <div>Delivery Charge: 10.00</div>
                  <div>Grand Total: ₹${(orderData.total_amount + 10).toFixed(2)}</div>
                </div>
                
                <div class="footer">Thanks</div>
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
    
    // Play sound notification for status updates
    if (soundEnabled) {
      soundNotificationService.updateSettings(soundEnabled, soundVolume);
      await soundNotificationService.playOrderReceivedSound();
    }
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
    return filteredOrders.filter(order => order.status === status);
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
    const fetchCafeId = async () => {
      if (!user || !profile) {
        console.log('POS Dashboard: No user or profile available');
        return;
      }

      try {
        console.log('POS Dashboard: Fetching cafeId for user:', user.id, 'profile:', profile);
        
        if (profile.user_type === 'cafe_owner') {
          // Cafe owners get cafe_id directly from their profile
          console.log('POS Dashboard: User is cafe_owner, using profile.cafe_id:', profile.cafe_id);
      setCafeId(profile.cafe_id);
        } else if (profile.user_type === 'cafe_staff') {
          // Cafe staff get cafe_id from cafe_staff table
          console.log('POS Dashboard: User is cafe_staff, fetching from cafe_staff table');
          const { data: staffData, error: staffError } = await supabase
            .from('cafe_staff')
            .select('*')
            .eq('user_id', user.id);

          if (staffError) {
            console.error('Error fetching staff data:', staffError);
            return;
          }

          if (!staffData || staffData.length === 0) {
            console.error('No staff record found for user');
            return;
          }

          // Get the cafe_id from the first record
          const cafeStaffRecord = staffData[0] as any;
          console.log('POS Dashboard: Found staff record, cafe_id:', cafeStaffRecord.cafe_id);
          setCafeId(cafeStaffRecord.cafe_id);
        } else {
          // Fallback to profile.cafe_id for other user types
          console.log('POS Dashboard: User type is', profile.user_type, ', using profile.cafe_id:', profile.cafe_id);
          setCafeId(profile.cafe_id);
        }
      } catch (error) {
        console.error('Error fetching cafe ID:', error);
      }
    };

    fetchCafeId();
  }, [user, profile]);

  // Debug effect to log current state
  useEffect(() => {
    console.log('POS Dashboard: Current state:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { 
        id: profile.id, 
        user_type: profile.user_type, 
        cafe_id: profile.cafe_id,
        full_name: profile.full_name 
      } : null,
      cafeId: cafeId,
      ordersCount: orders.length,
      filteredOrdersCount: filteredOrders.length
    });

    // Additional debugging for Food Court specifically
    if (cafeId) {
      console.log('POS Dashboard: Checking if this is Food Court...');
      // Check if the cafeId corresponds to Food Court
      supabase
        .from('cafes')
        .select('id, name, accepting_orders, is_active')
        .eq('id', cafeId)
        .single()
        .then(({ data: cafe, error }) => {
          if (error) {
            console.error('POS Dashboard: Error fetching cafe info:', error);
          } else {
            console.log('POS Dashboard: Cafe info:', cafe);
            if (cafe && (cafe as any).name === 'FOOD COURT') {
              console.log('POS Dashboard: ✅ This is Food Court! Checking staff assignments...');
              supabase
                .from('cafe_staff')
                .select(`
                  id,
                  role,
                  is_active,
                  profiles!inner(email, full_name, user_type)
                `)
                .eq('cafe_id', cafeId)
                .then(({ data: staff, error: staffError }) => {
                  if (staffError) {
                    console.error('POS Dashboard: Error fetching Food Court staff:', staffError);
                  } else {
                    console.log('POS Dashboard: Food Court staff:', staff);
                    if (staff.length === 0) {
                      console.error('POS Dashboard: ❌ NO STAFF ASSIGNED TO FOOD COURT! This is the problem.');
                    } else {
                      console.log('POS Dashboard: ✅ Food Court has staff assigned');
                    }
                  }
                });
            }
          }
        });
    }
  }, [user, profile, cafeId, orders.length, filteredOrders.length]);

  // Set up real-time subscriptions using centralized manager
  useOrderSubscriptions(
    cafeId,
    // New order handler
    async (newOrder) => {
      console.log('POS Dashboard: New order received via centralized subscription:', newOrder);
      fetchOrders();
      setUnreadNotifications(prev => prev + 1);
      
      // Play sound notification for new orders
      if (soundEnabled) {
        soundNotificationService.updateSettings(soundEnabled, soundVolume);
        await soundNotificationService.playOrderReceivedSound();
      }
      
      toast({
        title: "New Order!",
        description: `Order #${newOrder.order_number} received`,
      });

      // Auto-generate and print receipt for new orders using cafe-specific print service
      setTimeout(() => {
        autoPrintReceiptWithCafeService(newOrder as Order);
      }, 2000); // Wait 2 seconds for order data to be fetched
    },
    // Order update handler
    (updatedOrder) => {
      console.log('POS Dashboard: Order update received via centralized subscription:', updatedOrder);
      
      // Always refresh orders for any update to ensure we have the latest data
      console.log('POS Dashboard: Refreshing orders due to real-time update');
      fetchOrders(true); // Show refresh indicator
    }
  );

  // Set up polling as backup for real-time updates
  useEffect(() => {
    if (!cafeId) return;

    console.log('POS Dashboard: Setting up polling backup every 10 seconds');
    const pollInterval = setInterval(() => {
      console.log('POS Dashboard: Backup polling - refreshing orders');
      fetchOrders(true); // Show refresh indicator
    }, 10000); // Poll every 10 seconds

    return () => {
      console.log('POS Dashboard: Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [cafeId]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('POS Dashboard: Manual refresh triggered');
    await fetchOrders(true); // Show refresh indicator
    toast({
      title: "Refreshed",
      description: "Orders list has been refreshed",
    });
  };

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
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
              <p className="text-gray-600 mt-2">Professional Point of Sale System for High-Volume Operations</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Refresh Indicator */}
              {isRefreshing && (
                <div className="flex items-center text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </div>
              )}
              
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
              <Button onClick={handleManualRefresh} variant="outline" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              {cafeId && (
                <div className="text-sm text-gray-500">
                  Cafe ID: {cafeId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Printer Configuration - MULTIPLE OPTIONS */}
        <Collapsible open={isPrinterSetupOpen} onOpenChange={setIsPrinterSetupOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-800">🖨️ Printer Setup Options</span>
                <Badge variant="secondary" className="text-xs">Click to expand</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isPrinterSetupOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 mb-4">
            Choose your preferred printing method. PrintNode is recommended for professional thermal printing.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">Option 1: PrintNode Service (Recommended)</h4>
              <p className="text-xs text-gray-600 mb-2">Professional thermal printing service</p>
                  <PrintNodeStatus />
            </div>
            <div>
              <h4 className="font-bold mb-2">Option 2: Direct USB Printing</h4>
              <p className="text-xs text-gray-600 mb-2">Direct browser printing (may have page size issues)</p>
              <SimplePrinterConfig />
            </div>
          </div>
        </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
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
                {filteredOrders.filter(order => !['completed', 'cancelled'].includes(order.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredOrders.filter(order => order.status === 'completed').length}
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
          <TabsList className="grid w-full grid-cols-8 gap-1 sm:gap-2">
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">O</span>
            </TabsTrigger>
            <TabsTrigger value="manual-order" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Manual Order</span>
              <span className="sm:hidden">M</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">A</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Database</span>
              <span className="sm:hidden">D</span>
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

            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="on_the_way">Out for Delivery</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="order_number">Order Number</SelectItem>
                  <SelectItem value="total_amount">Amount</SelectItem>
                  <SelectItem value="user">Customer</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Grid View */}
            {useCompactLayout && (
              <EnhancedOrderGrid
                orders={filteredOrders}
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

          {/* Manual Order Tab */}
          <TabsContent value="manual-order" className="space-y-6">
            {cafeId ? (
              <ManualOrderEntry cafeId={cafeId} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Manual Order Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Loading cafe information...
                  </p>
                </CardContent>
              </Card>
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

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <PasswordProtectedSection
              title="Database Management"
              description="Export data and view database statistics"
              passwordKey="database_access"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Export Data</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Export Started",
                              description: "Data export functionality will be implemented",
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Orders
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Export Started",
                              description: "Customer data export functionality will be implemented",
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Customers
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Database Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Orders:</span>
                          <Badge variant="secondary">{filteredOrders.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Completed Orders:</span>
                          <Badge variant="secondary">
                            {filteredOrders.filter(o => o.status === 'completed').length}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Orders:</span>
                          <Badge variant="secondary">
                            {filteredOrders.filter(o => ['received', 'confirmed', 'preparing', 'on_the_way'].includes(o.status)).length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </PasswordProtectedSection>
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
            {/* PrintNode Setup Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🖨️</span>
                  PrintNode Setup Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Test your PrintNode environment variables and cafe-specific API key setup.
                  </p>
                  <Button 
                    onClick={() => {
                      const result = testPrintNodeSetup();
                      console.log('PrintNode Setup Test Result:', result);
                      toast({
                        title: "PrintNode Setup Test",
                        description: "Check console for detailed results",
                      });
                    }}
                    className="w-full"
                  >
                    Test PrintNode Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ThermalPrinter 
              order={selectedOrder ? {
                id: selectedOrder.id,
                order_number: selectedOrder.order_number,
                customer_name: selectedOrder.user?.full_name || selectedOrder.customer_name || 'Walk-in Customer',
                customer_phone: selectedOrder.user?.phone || selectedOrder.phone_number || 'N/A',
                items: (orderItems[selectedOrder.id] || []).map(item => ({
                  id: item.id,
                  name: item.menu_item?.name || 'Unknown Item',
                  quantity: item.quantity,
                  price: item.unit_price,
                  total: item.total_price
                })),
                total_amount: selectedOrder.total_amount,
                order_time: selectedOrder.created_at,
                status: selectedOrder.status
              } : null}
              onClose={() => setSelectedOrder(null)}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>POS Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sound Notifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sound Notifications</h3>
                  <OrderNotificationSound
                    isEnabled={soundEnabled}
                    onToggle={toggleSound}
                    volume={soundVolume}
                    onVolumeChange={setVolume}
                  />
                </div>

                {/* Sound Debugger */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sound Debugger</h3>
                  <SoundDebugger />
                </div>

                {/* Print Settings */}
                <Collapsible open={isSettingsPrinterOpen} onOpenChange={setIsSettingsPrinterOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Print Settings</span>
                        <Badge variant="secondary" className="text-xs">Click to expand</Badge>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isSettingsPrinterOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <PrintNodeStatus />
                  </CollapsibleContent>
                </Collapsible>

                {/* Layout Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Layout Settings</h3>
                  <div className="flex items-center space-x-4">
                    <span>Order View:</span>
                    <Button
                      variant={useCompactLayout ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCompactLayout(true)}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Compact Grid
                    </Button>
                    <Button
                      variant={!useCompactLayout ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCompactLayout(false)}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Detailed List
                    </Button>
                  </div>
                </div>
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
