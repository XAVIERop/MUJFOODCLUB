import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useSimplePOSUpdates } from '@/hooks/useSimplePOSUpdates';
import { useCafeStaff } from '@/hooks/useCafeStaff';
import StaffManagement from '@/components/StaffManagement';
import EnhancedOrderGrid from '@/components/EnhancedOrderGrid';
import POSAnalytics from '@/components/POSAnalytics';
import ThermalPrinter from '@/components/ThermalPrinter';
import { thermalPrinterService, formatOrderForPrinting } from '@/api/thermalPrinter';
import { unifiedPrintService } from '@/services/unifiedPrintService';
import NotificationCenter from '@/components/NotificationCenter';
import SimplePrinterConfig from '@/components/SimplePrinterConfig';
import PrintNodeStatus from '@/components/PrintNodeStatus';
import ManualOrderEntry from '@/components/ManualOrderEntry';
import OrderNotificationSound from '@/components/OrderNotificationSound';
import { testPrintNodeSetup } from '@/utils/testPrintNodeSetup';
import Header from '@/components/Header';
import PasswordProtectedSection from '@/components/PasswordProtectedSection';
import CafeCancellationDialog from '@/components/CafeCancellationDialog';
import { autoCancellationService } from '@/services/autoCancellationService';
// import SimplePOSDebugger from '@/components/SimplePOSDebugger'; // Temporarily disabled due to React error

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

const POSDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  
  // Calculate completed orders for metrics
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [useCompactLayout, setUseCompactLayout] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Track printed orders to prevent duplicates
  const [printedOrders, setPrintedOrders] = useState<Set<string>>(() => {
    // Initialize from localStorage if available
    try {
      const stored = localStorage.getItem('printedOrders');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  // Cleanup printed orders tracking every hour to prevent memory issues
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setPrintedOrders(new Set()); // Clear the tracking set
      console.log('🧹 AUTO-PRINT: Cleared printed orders tracking to prevent memory issues');
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [cafeName, setCafeName] = useState<string>('');
  const [showNoOrdersNotification, setShowNoOrdersNotification] = useState(true);
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Auto-cancellation state
  const [autoCancelStatus, setAutoCancelStatus] = useState<{
    isRunning: boolean;
    isChecking: boolean;
  }>({ isRunning: false, isChecking: false });
  
  // Date range filter states
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'custom' | 'all'>('today');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: ''
  });
  const [isPrinterSetupOpen, setIsPrinterSetupOpen] = useState(false);
  const [isSettingsPrinterOpen, setIsSettingsPrinterOpen] = useState(false);
  
  // Staff management
  const { staff, loading: staffLoading, getStaffDisplayName } = useCafeStaff(cafeId || undefined);

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
      
      // Debug: Log the cafeId being used
      console.log('🔍 POS Dashboard: Fetching orders for cafeId:', cafeId);
      console.log('🔍 POS Dashboard: CafeId type:', typeof cafeId);
      console.log('🔍 POS Dashboard: CafeId length:', cafeId?.length);
      console.log('🔍 POS Dashboard: Expected Munch Box cafeId: fecc62c0-2995-4376-8303-59c544d2c3e0');
      
      if (!cafeId) {
        console.error('❌ POS Dashboard: No cafeId available, cannot fetch orders');
        setOrders([]);
        return;
      }
      
      // Add cache-busting parameter to prevent stale data
      const cacheBuster = Date.now();
      console.log('POS Dashboard: Fetching orders with cache buster:', cacheBuster);
      
      // Get date range filter
      const dateFilter = getDateRangeFilter();
      
      // Build query with date filtering
      let query = supabase
        .from('orders')
        .select('*')
        .eq('cafe_id', cafeId)
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Cache buster
      
      // Add date filtering if specified
      if (dateFilter) {
        if (dateFilter.startDate) {
          query = query.gte('created_at', dateFilter.startDate);
        }
        if (dateFilter.endDate) {
          query = query.lt('created_at', dateFilter.endDate);
        }
      }
      
      // First, try a simple query without joins
      const { data: simpleData, error: simpleError } = await query
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.error('Simple query failed:', simpleError);
        throw simpleError;
      }

      console.log('Simple query successful, found orders:', simpleData?.length || 0);

      // If simple query works, try the full query with joins
      let fullQuery = supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block, email),
          cafe:cafes(name, description),
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
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Cache buster
      
      // Add date filtering to full query as well
      if (dateFilter) {
        if (dateFilter.startDate) {
          fullQuery = fullQuery.gte('created_at', dateFilter.startDate);
        }
        if (dateFilter.endDate) {
          fullQuery = fullQuery.lt('created_at', dateFilter.endDate);
        }
      }
      
      const { data, error } = await fullQuery
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Full query failed, using simple data:', error);
        console.error('Error details:', error.message, error.details, error.hint);
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
          console.log(`🔍 Fetching items for order ${order.id} (${order.order_number})`);
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              menu_item:menu_items(name, description)
            `)
            .eq('order_id', order.id);

          if (itemsError) {
            console.error(`❌ Error fetching items for order ${order.id}:`, itemsError);
            console.error('Items error details:', itemsError.message, itemsError.details, itemsError.hint);
          } else {
            console.log(`✅ Items for order ${order.id}:`, items?.length || 0, 'items');
            if (items && items.length > 0) {
              itemsData[order.id] = items;
              console.log('Items data:', items);
            }
          }
        }
        console.log('Final itemsData:', itemsData);
        setOrderItems(itemsData);
      } else {
        console.log('Full query successful, found orders:', data?.length || 0);
        console.log('Sample order data:', data?.[0]);
        setOrders(data || []);
        setFilteredOrders(data || []);
        
        // Extract order items from the joined data
        const itemsData: {[key: string]: OrderItem[]} = {};
        for (const order of data || []) {
          console.log(`🔍 Processing order ${order.id} (${order.order_number}):`, order.order_items?.length || 0, 'items');
          if (order.order_items && order.order_items.length > 0) {
            itemsData[order.id] = order.order_items;
            console.log('Order items:', order.order_items);
          }
        }
        console.log('Final itemsData from joined query:', itemsData);
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
        order.delivery_block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table_number && order.table_number.toLowerCase().includes(searchTerm.toLowerCase()))
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
    
    // OPTIMISTIC UPDATE: Update UI immediately for faster response
    const optimisticUpdate = () => {
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              status_updated_at: new Date().toISOString()
            }
          : order
      ));
      setFilteredOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              status_updated_at: new Date().toISOString()
            }
          : order
      ));
    };
    
    // Apply optimistic update immediately
    optimisticUpdate();
    
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
          
          // Credit points to user when order is completed (ASYNC - don't wait)
          // This runs in background and won't block the status update
          creditPointsToUser(orderId).catch(error => {
            console.error('Background points crediting failed:', error);
            // Could show a subtle notification here if needed
          });
          break;
      }

      console.log('🔧 POS Dashboard: Updating order with data:', { orderId, updateData });
      
      const { data, error } = await (supabase as any)
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();
      
      console.log('🔧 POS Dashboard: Update result:', { data, error });
      
      if (data && data.length > 0) {
        console.log('✅ POS Dashboard: Order updated successfully:', data[0]);
      } else {
        console.log('⚠️ POS Dashboard: No data returned from update');
      }

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

      // Refresh orders (removed artificial 500ms delay for faster response)
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // ROLLBACK: Revert optimistic update on error
      console.log('🔄 Rolling back optimistic update due to error');
      await fetchOrders(); // Refresh to get correct state
      
      const errorMessage = error.message || 'Unknown error occurred';
      toast({
        title: "Update Failed",
        description: `Failed to update order status: ${errorMessage}. Changes have been reverted.`,
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateOrderStaff = async (orderId: string, staffId: string | null) => {
    try {
      console.log('🔄 Updating order staff:', { orderId, staffId });
      
      const { data, error } = await supabase
        .from('orders')
        .update({ delivered_by_staff_id: staffId })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Supabase error details:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw error;
      }

      console.log('✅ Update successful:', data);

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, delivered_by_staff_id: staffId }
          : order
      ));

      toast({
        title: "Staff Assigned",
        description: staffId ? "Staff member assigned to order" : "Staff assignment removed"
      });
    } catch (error) {
      console.error('❌ Error updating order staff:', error);
      toast({
        title: "Error",
        description: "Failed to update staff assignment",
        variant: "destructive"
      });
    }
  };

  // Auto-cancellation functions
  const handleManualAutoCancellation = async () => {
    try {
      const result = await autoCancellationService.triggerAutoCancellation();
      
      if (result.success && result.cancelled_count > 0) {
        toast({
          title: "Auto-Cancellation Complete",
          description: `${result.cancelled_count} orders were auto-cancelled: ${result.cancelled_orders.join(', ')}`,
        });
        
        // Refresh orders to show updated status
        await fetchOrders();
      } else {
        toast({
          title: "Auto-Cancellation Check",
          description: "No orders needed to be auto-cancelled",
        });
      }
    } catch (error) {
      console.error('Error in manual auto-cancellation:', error);
      toast({
        title: "Auto-Cancellation Error",
        description: "Failed to check for auto-cancellation",
        variant: "destructive"
      });
    }
  };

  const toggleAutoCancellation = () => {
    if (autoCancelStatus.isRunning) {
      autoCancellationService.stopPeriodicChecks();
      setAutoCancelStatus({ isRunning: false, isChecking: false });
      toast({
        title: "Auto-Cancellation Stopped",
        description: "Periodic auto-cancellation checks have been stopped",
      });
    } else {
      autoCancellationService.startPeriodicChecks();
      setAutoCancelStatus({ isRunning: true, isChecking: false });
      toast({
        title: "Auto-Cancellation Started",
        description: "Periodic auto-cancellation checks are now running (every 2 minutes)",
      });
    }
  };

  // Initialize auto-cancellation service status
  useEffect(() => {
    const status = autoCancellationService.getStatus();
    setAutoCancelStatus(status);
  }, []);

  const autoPrintReceiptWithCafeService = async (order: Order) => {
    console.log('🚀 UNIFIED PRINT: Using Unified Print Service!');
    
    // Check if this is Pizza Bakers - skip automatic printing
    if (order.cafe_id && cafeId) {
      const { data: cafeData } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', order.cafe_id)
        .single();
      
      if (cafeData && cafeData.name.toLowerCase().includes('pizza bakers')) {
        console.log('🚫 AUTO-PRINT: Pizza Bakers - skipping automatic printing:', order.order_number);
        return;
      }
    }
    
    // Check if this order has already been auto-printed to prevent duplicates
    if (printedOrders.has(order.id)) {
      console.log('🚫 AUTO-PRINT: Order already printed, skipping duplicate:', order.order_number);
      return;
    }
    
    // Check if order is too old (older than 5 minutes) to prevent printing stale orders
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const maxAge = 5 * 60 * 1000; // 5 minutes (reduced from 10)
    if (orderAge > maxAge) {
      console.log('🚫 AUTO-PRINT: Order too old, skipping auto-print:', order.order_number, 'Age:', Math.round(orderAge / 1000), 'seconds');
      return;
    }
    
    // Additional check: Only print orders that are in 'received' status
    if (order.status !== 'received') {
      console.log('🚫 AUTO-PRINT: Order not in received status, skipping:', order.order_number, 'Status:', order.status);
      return;
    }
    
    try {
      console.log('Auto-printing with Unified Print Service for order:', order.order_number);
      
      // Fetch complete order data with user relations to get proper customer name
      const { data: completeOrder, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block),
          cafe:cafes(name, location)
        `)
        .eq('id', order.id)
        .single();

      if (orderError || !completeOrder) {
        console.error('Error fetching complete order data:', orderError);
        return;
      }

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

      // Create receipt data with complete cafe and customer information
      const receiptData = {
        order_id: completeOrder.id,
        order_number: completeOrder.order_number,
        cafe_name: completeOrder.cafe?.name || 'Cafe',
        customer_name: completeOrder.user?.full_name || completeOrder.customer_name || 'Customer',
        customer_phone: completeOrder.user?.phone || completeOrder.phone_number || 'N/A',
        delivery_block: completeOrder.delivery_block || completeOrder.user?.block || 'N/A',
        table_number: completeOrder.table_number || '',
        items: (items || []).map(item => ({
          id: item.id,
          name: item.menu_item?.name || 'Item',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions
        })),
        subtotal: completeOrder.subtotal || 0,
        tax_amount: completeOrder.tax_amount || 0,
        discount_amount: 0,
        final_amount: completeOrder.total_amount,
        payment_method: completeOrder.payment_method || 'COD',
        order_date: completeOrder.created_at,
        estimated_delivery: completeOrder.estimated_delivery || '30 minutes',
        points_earned: completeOrder.points_earned || 0,
        points_redeemed: 0
      };

      console.log('🚀 UNIFIED PRINT: Cafe ID:', cafeId);
      console.log('🚀 UNIFIED PRINT: Cafe name:', receiptData.cafe_name);
      console.log('🚀 UNIFIED PRINT: Customer name:', receiptData.customer_name);
      console.log('🚀 UNIFIED PRINT: Full receiptData:', receiptData);
      
      // Use Unified Print Service with cafe-specific routing
      if (!cafeId) {
        throw new Error('Cafe ID not available for printing');
      }
      
      const result = await unifiedPrintService.printBoth(receiptData, cafeId);
      
      if (result.success) {
        console.log('✅ UNIFIED PRINT: Success!', result);
        
        // Mark this order as printed to prevent duplicates
        setPrintedOrders(prev => new Set(prev).add(order.id));
        
        // Also store in localStorage for persistence across page refreshes
        const printedOrdersArray = Array.from(printedOrders);
        printedOrdersArray.push(order.id);
        localStorage.setItem('printedOrders', JSON.stringify(printedOrdersArray));
        
        toast({
          title: "Receipt Printed",
          description: `KOT and Receipt for order #${order.order_number} printed using ${result.method}`,
        });
      } else {
        console.error('❌ UNIFIED PRINT: Failed:', result);
        toast({
          title: "Print Failed",
          description: `Failed to print receipt: ${result.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ UNIFIED PRINT: Error:', error);
      toast({
        title: "Print Error",
        description: `Error printing receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const autoPrintReceipt = async (order: Order) => {
    console.log('🔄 autoPrintReceipt called - using Unified Print Service!');
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

      // Create receipt data with cafe information
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
        discount_amount: 0,
        final_amount: order.total_amount,
        payment_method: order.payment_method || 'COD',
        order_date: order.created_at,
        estimated_delivery: order.estimated_delivery || '30 minutes',
        points_earned: order.points_earned || 0,
        points_redeemed: 0
      };
      
      console.log('🔄 Unified Print Service: Cafe ID:', cafeId);
      console.log('🔄 Unified Print Service: Cafe name:', receiptData.cafe_name);
      
      // Use Unified Print Service with cafe-specific routing
      if (!cafeId) {
        console.error('Cafe ID not available for printing');
        return;
      }
      
      const result = await unifiedPrintService.printBoth(receiptData, cafeId);
      
      if (result.success) {
        toast({
          title: "Receipt Printed",
          description: `KOT and Receipt for order #${order.order_number} printed using ${result.method}`,
        });
        return;
      } else {
        console.error('Unified Print Service failed:', result);
      }

      // Fallback to browser-based printing
      const generateThermalHTML = (orderData: Order, orderItems: any[]) => {
        console.log('  - Raw cafe name:', orderData.cafe?.name);
        console.log('  - Cafe name type:', typeof orderData.cafe?.name);
        console.log('  - Cafe name length:', orderData.cafe?.name?.length);
        console.log('  - Full orderData.cafe object:', orderData.cafe);
        
        const isChatkara = orderData.cafe?.name?.toLowerCase().includes('chatkara') || 
                           orderData.cafe?.name === 'CHATKARA' ||
                           orderData.cafe?.name?.toLowerCase() === 'chatkara';
        const isFoodCourt = orderData.cafe?.name?.toLowerCase().includes('food court') || 
                           orderData.cafe?.name === 'FOOD COURT' ||
                           orderData.cafe?.name?.toLowerCase() === 'food court';
        
        console.log('  - Is Chatkara:', isChatkara);
        console.log('  - Is Food Court:', isFoodCourt);
        console.log('  - Chatkara check details:');
        console.log('    - includes("chatkara"):', orderData.cafe?.name?.toLowerCase().includes('chatkara'));
        console.log('    - equals "CHATKARA":', orderData.cafe?.name === 'CHATKARA');
        console.log('    - equals "chatkara":', orderData.cafe?.name?.toLowerCase() === 'chatkara');
        
        if (isChatkara) {
          console.log('✅ POSDashboard - Using Chatkara receipt format');
          return generateChatkaraReceipt(orderData, orderItems);
        } else if (isFoodCourt) {
          console.log('✅ POSDashboard - Using Food Court receipt format');
          return generateFoodCourtReceipt(orderData, orderItems);
        } else {
          console.log('⚠️ POSDashboard - Cafe name not recognized, using default format');
          console.log('  - This might be the issue! Check cafe name in database');
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
                  <span>Type:</span>
                  <span>${formatReceiptOrderType(orderData)}</span>
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
                    padding: 3mm;
                    font-size: 11px; 
                    font-family: 'Courier New', monospace;
                    line-height: 1.1;
                  }
                  .no-print { display: none; }
                }
                
                body {
                  font-family: 'Courier New', monospace;
                  line-height: 1.1;
                  margin: 0;
                  padding: 3mm;
                  width: 80mm;
                  font-size: 11px;
                }
                
                .receipt {
                  width: 100%;
                }
                
                .cafe-name {
                  font-size: 16px;
                  font-weight: bold;
                  text-align: center;
                  margin-bottom: 8px;
                  text-transform: uppercase;
                }
                
                .customer-info {
                  margin-bottom: 6px;
                  font-size: 10px;
                }
                
                .order-details {
                  margin-bottom: 6px;
                  font-size: 10px;
                }
                
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 6px;
                  font-size: 10px;
                }
                
                .items-table th {
                  text-align: left;
                  border-bottom: 1px solid #000;
                  padding: 1px 0;
                  font-weight: normal;
                }
                
                .items-table td {
                  padding: 1px 0;
                }
                
                .items-table td:first-child {
                  font-size: 14px;
                  font-weight: bold;
                }
                
                .summary {
                  margin-top: 6px;
                  font-size: 10px;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 8px;
                  font-size: 11px;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="cafe-name">${orderData.cafe?.name || 'Chatkara'}</div>
                
                <div class="customer-info">
                  <div>${orderData.user?.phone || orderData.phone_number || 'N/A'} - ${formatReceiptOrderType(orderData)}</div>
                  <div>Name: ${orderData.user?.full_name || 'WALK-IN'}</div>
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
                        <td style="font-weight: bold;">${item.menu_item?.name || 'Unknown Item'}</td>
                        <td style="font-weight: bold;">${item.quantity}</td>
                        <td style="font-weight: bold;">${item.unit_price.toFixed(0)}</td>
                        <td style="font-weight: bold;">${item.total_price.toFixed(0)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="summary">
                  <div style="font-weight: bold;">Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
                  <div style="font-weight: bold;">Sub Total: ${orderData.total_amount.toFixed(0)}</div>
                  <div style="font-weight: bold;">Delivery Charge: +10</div>
                  <div style="font-weight: bold;">MUJ Food Club Discount: -${(orderData.total_amount * 0.10).toFixed(0)}</div>
                  <div style="font-weight: bold; font-size: 16px; margin-top: 8px;">Grand Total: ${(orderData.total_amount + 10 - orderData.total_amount * 0.10).toFixed(0)}rs</div>
                </div>
                
                <div class="footer">
                  <div style="font-weight: bold;">Thanks Order Again</div>
                  <div style="font-weight: bold;">mujfoodclub.in</div>
                </div>
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
                  <span>M:</span>
                  <span style="font-size: 16px; font-weight: bold;">${orderData.user?.phone || orderData.phone_number || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span>Name:</span>
                  <span>${orderData.user?.full_name || 'Walk-in Customer'}</span>
                </div>
                <div class="info-row">
                  <span>Type:</span>
                  <span>${formatReceiptOrderType(orderData)}</span>
                </div>
                <div class="info-row">
                  <span>Date:</span>
                  <span>${dateStr} ${timeStr}</span>
                </div>
                <div class="info-row">
                  <span>Delivery</span>
                  <span>Cashier: biller</span>
                </div>
                <div class="info-row">
                  <span>Bill No.:</span>
                  <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
                </div>
                <div class="info-row">
                  <span>Token No.:</span>
                  <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
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

  const formatOrderType = (order: Order) => {
    // Check if it's a dine-in order
    if (order.delivery_block === 'DINE_IN') {
      return `🍽️ Dine In • Table ${order.table_number || 'N/A'}`;
    } else if (order.delivery_block === 'TAKEAWAY') {
      return '📦 Takeaway';
    } else {
      return `🚚 Delivery • Block ${order.delivery_block}`;
    }
  };

  const formatReceiptOrderType = (order: Order) => {
    // Check if it's a dine-in order
    if (order.delivery_block === 'DINE_IN') {
      return `Dine In - Table ${order.table_number || 'N/A'}`;
    } else if (order.delivery_block === 'TAKEAWAY') {
      return 'Takeaway';
    } else {
      return `Delivery - Block ${order.delivery_block}`;
    }
  };

  // Date range helper functions
  const getDateRangeFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        // Fixed timezone handling - use local time boundaries
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        return {
          startDate: startOfToday.toISOString(),
          endDate: endOfToday.toISOString()
        };
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const endOfYesterday = new Date(today);
        endOfYesterday.setHours(0, 0, 0, 0);
        
        return {
          startDate: yesterday.toISOString(),
          endDate: endOfYesterday.toISOString()
        };
      
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(0, 0, 0, 0);
        
        return {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString()
        };
      
      case 'last_week':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
        return {
          startDate: startOfLastWeek.toISOString(),
          endDate: endOfLastWeek.toISOString()
        };
      
      case 'this_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        };
      
      case 'custom':
        return {
          startDate: customDateRange.startDate ? new Date(customDateRange.startDate).toISOString() : '',
          endDate: customDateRange.endDate ? new Date(customDateRange.endDate).toISOString() : ''
        };
      
      case 'all':
      default:
        return null; // No date filter
    }
  };

  const formatDateRangeDisplay = () => {
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'this_week':
        return 'This Week';
      case 'last_week':
        return 'Last Week';
      case 'this_month':
        return 'This Month';
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          const start = new Date(customDateRange.startDate).toLocaleDateString();
          const end = new Date(customDateRange.endDate).toLocaleDateString();
          return `${start} - ${end}`;
        }
        return 'Custom Range';
      case 'all':
        return 'All Time';
      default:
        return 'Today';
    }
  };

  // Fetch cafe name when cafeId changes
  useEffect(() => {
    const fetchCafeName = async () => {
      if (!cafeId) {
        setCafeName('');
        return;
      }

      try {
        const { data: cafe, error } = await supabase
          .from('cafes')
          .select('name')
          .eq('id', cafeId)
          .single();

        if (error) {
          console.error('Error fetching cafe name:', error);
          setCafeName('');
        } else if (cafe) {
          setCafeName(cafe.name);
        }
      } catch (error) {
        console.error('Error fetching cafe name:', error);
        setCafeName('');
      }
    };

    fetchCafeName();
  }, [cafeId]);

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
          console.log('POS Dashboard: Profile cafe_id type:', typeof profile.cafe_id);
          console.log('POS Dashboard: Profile cafe_id length:', profile.cafe_id?.length);
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
        
        // Debug: If no cafe_id found, try to find cafe by user's profile
        if (!profile.cafe_id) {
          console.log('🔍 POS Dashboard: No cafe_id found, searching for user\'s cafe...');
          
          // First try to find cafe by user's email domain or name
          const userEmail = user.email || '';
          const userName = profile.full_name || '';
          
          // Search for cafes that might match the user
          const { data: userCafe, error: userCafeError } = await supabase
            .from('cafes')
            .select('id, name')
            .or(`name.ilike.%${userName}%,name.ilike.%${userEmail.split('@')[0]}%`)
            .limit(1);
            
          if (userCafeError) {
            console.error('Error finding user cafe:', userCafeError);
          } else if (userCafe && userCafe.length > 0) {
            console.log('✅ POS Dashboard: Found user cafe, using ID:', userCafe[0].id);
            setCafeId(userCafe[0].id);
          } else {
            // Fallback to Chatkara for testing
            console.log('🔍 POS Dashboard: No user cafe found, searching for Chatkara cafe...');
            const { data: chatkaraCafe, error: chatkaraError } = await supabase
              .from('cafes')
              .select('id, name')
              .ilike('name', '%chatkara%')
              .limit(1);
              
            if (chatkaraError) {
              console.error('Error finding Chatkara cafe:', chatkaraError);
            } else if (chatkaraCafe && chatkaraCafe.length > 0) {
              console.log('✅ POS Dashboard: Found Chatkara cafe, using ID:', chatkaraCafe[0].id);
              setCafeId(chatkaraCafe[0].id);
            }
          }
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

  // Set up simple, reliable polling-based updates
  const { isConnected, refreshOrders: manualRefreshOrders, testConnection } = useSimplePOSUpdates({
    cafeId,
    onNewOrder: async (newOrder) => {
      console.log('POS Dashboard: New order received via polling:', newOrder);
      fetchOrders();
      setUnreadNotifications(prev => prev + 1);
      
      // Play sound notification for new orders
      if (soundEnabled) {
        soundNotificationService.updateSettings(soundEnabled, soundVolume);
        await soundNotificationService.playOrderReceivedSound();
      }

      // Auto-generate and print receipt for new orders using cafe-specific print service
      setTimeout(() => {
        autoPrintReceiptWithCafeService(newOrder as Order);
      }, 2000); // Wait 2 seconds for order data to be fetched
    },
    onOrderUpdate: (updatedOrder) => {
      console.log('POS Dashboard: Order update received via polling:', updatedOrder);
      
      // Always refresh orders for any update to ensure we have the latest data
      console.log('POS Dashboard: Refreshing orders due to polling update');
      fetchOrders(true); // Show refresh indicator
    }
  });

  // SIMPLE: Fetch orders when cafeId changes
  useEffect(() => {
    if (cafeId) {
      console.log('🚀 SIMPLE: Fetching orders for cafeId:', cafeId);
      
      // Simple query with user information join
      supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, phone, block)
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('❌ Simple query error:', error);
            setOrders([]);
          } else {
            console.log('✅ Simple query success:', data?.length || 0, 'orders');
            console.log('✅ Sample order with user data:', data?.[0]);
            console.log('✅ User data in sample order:', data?.[0]?.user);
            console.log('✅ Full name from user:', data?.[0]?.user?.full_name);
            setOrders(data as Order[] || []);
          }
        });
    }
  }, [cafeId]);

  // Note: Polling is now handled by useSimplePOSUpdates hook

  // Manual refresh function with enhanced error handling
  const handleManualRefresh = async () => {
    console.log('POS Dashboard: Manual refresh triggered');
    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to database. Please check your connection.",
          variant: "destructive"
        });
        return;
      }

      // Refresh orders
      await fetchOrders(true); // Show refresh indicator
      
      // Also try the manual refresh from the hook
      try {
        await manualRefreshOrders();
      } catch (error) {
        console.warn('Manual refresh from hook failed:', error);
      }

      toast({
        title: "Refreshed",
        description: "Orders list has been refreshed successfully",
      });
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (cafeId) {
      fetchOrders();
    }
  }, [cafeId, dateRange, customDateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-6">
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Main Header Row */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">POS Dashboard</h1>
                  <p className="text-sm text-gray-600 mt-1">Professional Point of Sale System</p>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* User Profile & Actions */}
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {cafeName || 'Cafe'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile?.user_type?.replace('_', ' ').toUpperCase() || 'STAFF'}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/cafe-management?from=pos-dashboard')}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Management</span>
                  </Button>
                  
                  <Button 
                    onClick={handleManualRefresh} 
                    variant="outline" 
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Actions Row */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {/* Automation Controls */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Automation:</span>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleManualAutoCancellation}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Check Auto-Cancel
                  </Button>
                  <Button 
                    onClick={toggleAutoCancellation}
                    variant={autoCancelStatus.isRunning ? "destructive" : "outline"}
                    size="sm"
                    className={autoCancelStatus.isRunning ? "" : "text-green-600 border-green-200 hover:bg-green-50"}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {autoCancelStatus.isRunning ? 'Stop Auto-Cancel' : 'Start Auto-Cancel'}
                  </Button>
                  {autoCancelStatus.isRunning && (
                    <Badge variant="secondary" className="text-xs">
                      Running (2min intervals)
                    </Badge>
                  )}
                </div>
              </div>

              {/* System Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {isRefreshing && (
                  <div className="flex items-center text-blue-600">
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Updating...
                  </div>
                )}
                {cafeName && (
                  <div className="hidden lg:block">
                    {cafeName}
                  </div>
                )}
              </div>
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
                  <PrintNodeStatus cafeId={cafeId} />
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
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders ({formatDateRangeDisplay()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{completedOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue ({formatDateRangeDisplay()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{completedOrders.reduce((sum, order) => sum + order.total_amount, 0)}
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
              <CardTitle className="text-sm font-medium text-gray-600">Completed Orders</CardTitle>
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
          <TabsList className="grid w-full grid-cols-9 gap-1 sm:gap-2">
            <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">O</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Staff</span>
              <span className="sm:hidden">S</span>
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

            {/* Date Range Filter */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-800">📅 Date Range:</span>
                  <span className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {formatDateRangeDisplay()}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Date Range Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={dateRange === 'today' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('today')}
                      className="text-xs"
                    >
                      Today
                    </Button>
                    <Button
                      variant={dateRange === 'yesterday' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('yesterday')}
                      className="text-xs"
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant={dateRange === 'this_week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('this_week')}
                      className="text-xs"
                    >
                      This Week
                    </Button>
                    <Button
                      variant={dateRange === 'last_week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('last_week')}
                      className="text-xs"
                    >
                      Last Week
                    </Button>
                    <Button
                      variant={dateRange === 'this_month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('this_month')}
                      className="text-xs"
                    >
                      This Month
                    </Button>
                    <Button
                      variant={dateRange === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('all')}
                      className="text-xs"
                    >
                      All Time
                    </Button>
                  </div>
                  
                  {/* Custom Date Range */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={dateRange === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange('custom')}
                      className="text-xs"
                    >
                      Custom
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Custom Date Range Inputs */}
              {dateRange === 'custom' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date" className="text-sm font-medium text-blue-800">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-sm font-medium text-blue-800">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Search and Filter Controls */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders, customers, or items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
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
                    <SelectTrigger className="w-32">
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
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Quick Actions */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSortBy('created_at');
                      setSortOrder('desc');
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Active: <span className="text-orange-600 font-semibold">{filteredOrders.filter(o => ['received', 'confirmed', 'preparing', 'on_the_way'].includes(o.status)).length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Completed: <span className="text-green-600 font-semibold">{filteredOrders.filter(o => o.status === 'completed').length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Revenue: <span className="text-blue-600 font-semibold">₹{filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredOrders.length} orders found
                </div>
              </div>
            </div>

            {/* Enhanced Grid View */}
            {useCompactLayout && (
            <EnhancedOrderGrid
              orders={filteredOrders}
              orderItems={orderItems}
              onOrderSelect={handleOrderSelect}
              onStatusUpdate={handleCompactStatusUpdate}
              loading={loading}
              staff={staff}
              onStaffUpdate={updateOrderStaff}
              getStaffDisplayName={getStaffDisplayName}
                cafeId={cafeId}
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
                                    {formatTime(order.created_at)} • {formatOrderType(order)}
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
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as {nextStatus.replace('_', ' ')}
                                      </>
                                    )}
                                  </Button>
                                )}
                                {order.status === 'received' && (
                                  <CafeCancellationDialog
                                    orderId={order.id}
                                    orderNumber={order.order_number}
                                    onCancel={fetchOrders}
                                    trigger={
                                      <Button
                                        variant="destructive"
                                        disabled={updatingOrder === order.id}
                                      >
                                        Cancel Order
                                      </Button>
                                    }
                                  />
                                )}
                              </div>

                              {/* Staff Assignment Dropdown */}
                              {(order.status === 'completed' || order.status === 'on_the_way') && (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Delivered By:</Label>
                                  <Select
                                    value={order.delivered_by_staff_id || 'none'}
                                    onValueChange={(value) => updateOrderStaff(order.id, value === 'none' ? null : value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Not Assigned</SelectItem>
                                      {staff.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                          {getStaffDisplayName(member)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
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

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            {cafeId ? (
              <StaffManagement cafeId={cafeId} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Please select a cafe to manage staff</p>
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
              dateRange={dateRange}
              customDateRange={customDateRange}
              onDateRangeChange={(newDateRange, newCustomRange) => {
                setDateRange(newDateRange as any);
                if (newCustomRange) {
                  setCustomDateRange(newCustomRange);
                }
              }}
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
                            {completedOrders.length}
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
                status: selectedOrder.status,
                table_number: selectedOrder.table_number,
                delivery_block: selectedOrder.delivery_block
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
                    <PrintNodeStatus cafeId={cafeId} />
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

        {/* Simple POS Debugger - Temporarily disabled due to React error */}
        {/* <SimplePOSDebugger cafeId={cafeId} /> */}
        
        {/* Manual Cafe Override for Testing */}
        {!cafeId && (
          <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">No Cafe ID Found</p>
            <p className="text-sm">Click to use a cafe for testing:</p>
            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={() => {
                  console.log('🔧 Manual override: Setting Punjabi Tadka cafe ID');
                  setCafeId('6097276a-f9c2-4a1e-b95d-eda66b3f6cc3');
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Use Punjabi Tadka (6097276a-f9c2-4a1e-b95d-eda66b3f6cc3)
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Manual override: Setting Chatkara cafe ID');
                  setCafeId('25d0b247-0731-4e52-a0fb-023526adfa34');
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                Use Chatkara (25d0b247-0731-4e52-a0fb-023526adfa34)
              </button>
            </div>
          </div>
        )}

        {/* Manual Fetch Orders Button for Testing */}
        {cafeId && orders.length === 0 && showNoOrdersNotification && (
          <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-bold">No Orders Found</p>
                <p className="text-sm">Cafe ID: {cafeId}</p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      console.log('🔧 Manual fetch: Triggering fetchOrders manually');
                      fetchOrders(true);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Force Fetch Orders
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🔧 SIMPLE TEST: Querying orders with user data for', cafeId);
                      supabase
                        .from('orders')
                        .select(`
                          *,
                          user:profiles(full_name, phone, block)
                        `)
                        .eq('cafe_id', cafeId)
                        .order('created_at', { ascending: false })
                        .then(({ data, error }) => {
                          if (error) {
                            console.error('❌ Test error:', error);
                          } else {
                            console.log('✅ Test result:', data?.length || 0, 'orders');
                            console.log('✅ Sample order with user data:', data?.[0]);
                            setOrders(data as Order[] || []);
                          }
                        });
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Simple Test
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowNoOrdersNotification(false)}
                className="ml-2 text-blue-700 hover:text-blue-900 text-xl font-bold leading-none"
                title="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSDashboard;
