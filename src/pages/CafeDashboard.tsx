import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, AlertCircle, Truck, ChefHat, Receipt, Bell, User, MapPin, Phone, Download, Search, BarChart3, Calendar, DollarSign, TrendingUp, Users, Package, Trash2, Settings, Volume2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSoundNotifications } from '@/hooks/useSoundNotifications';
import { soundNotificationService } from '@/services/soundNotificationService';
import { useCafeStaff } from '@/hooks/useCafeStaff';
import NotificationCenter from '../components/NotificationCenter';
import CafeScanner from '../components/CafeScanner';
import OrderNotificationSound from '../components/OrderNotificationSound';
import Header from '../components/Header';
import PasswordProtectedSection from '../components/PasswordProtectedSection';
import CafeCancellationDialog from '../components/CafeCancellationDialog';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
  menu_item: {
    name: string;
    price: number;
    category: string;
  };
}

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
  points_credited: boolean;
  accepted_at?: string;
  preparing_at?: string;
  out_for_delivery_at?: string;
  completed_at?: string;
  user: {
    full_name: string;
    phone?: string;
    block: string;
    email: string;
  };
  order_items: OrderItem[];
  phone_number?: string; // Added for phone number display
  delivered_by_staff_id?: string | null; // Staff assignment
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
}

const CafeDashboard = () => {
  console.log('🔍 CafeDashboard: Starting component');
  
  let user, profile, toast, navigate;
  
  try {
    const authResult = useAuth();
    user = authResult.user;
    profile = authResult.profile;
    console.log('🔍 CafeDashboard: useAuth successful', { user: !!user, profile: !!profile });
  } catch (error) {
    console.error('❌ CafeDashboard: useAuth failed:', error);
    throw error;
  }
    
  try {
    toast = useToast().toast;
    console.log('🔍 CafeDashboard: useToast successful');
  } catch (error) {
    console.error('❌ CafeDashboard: useToast failed:', error);
    throw error;
  }
  
  try {
    navigate = useNavigate();
    console.log('🔍 CafeDashboard: useNavigate successful');
  } catch (error) {
    console.error('❌ CafeDashboard: useNavigate failed:', error);
    throw error;
  }
  
  // Staff management for CSV export
  const { staff, getStaffDisplayName } = useCafeStaff(profile?.cafe_id || undefined);
    
    const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cafeId, setCafeId] = useState<string | null>(null);
  const [cafeInfo, setCafeInfo] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  

  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sound notification settings
  const {
    isEnabled: soundEnabled,
    volume: soundVolume,
    toggleSound,
    setVolume,
    soundOption,
    setSoundOption,
  } = useSoundNotifications();



  // Get cafe ID for the current user
  useEffect(() => {
    const getCafeId = async () => {
      if (!user || !profile) return;

      try {
        if (profile.user_type === 'cafe_owner') {
          // Cafe owners get cafe_id directly from their profile
          setCafeId(profile.cafe_id);
        } else if (profile.user_type === 'cafe_staff') {
          // Cafe staff get cafe_id from cafe_staff table
          const { data: staffData, error: staffError } = await supabase
            .from('cafe_staff')
            .select('*')
            .eq('user_id', user.id);

          if (staffError) {
            console.error('Error fetching cafe staff:', staffError);
            return;
          }

          if (!staffData || staffData.length === 0) {
            return;
          }

          // Get the cafe_id from the first record
          const cafeStaffRecord = staffData[0];
          setCafeId((cafeStaffRecord as any).cafe_id);
        }
      } catch (error) {
        console.error('Error fetching cafe ID:', error);
      }
    };

    getCafeId();
  }, [user, profile]);



  const fetchOrders = async () => {
    if (!cafeId) return;

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

      // If simple query works, try a simplified full query first
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles!user_id(full_name, phone, block, email),
          order_items(
            id,
            menu_item_id,
            quantity,
            special_instructions,
            menu_item:menu_items(name, price, category)
          )
        `)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Full query failed, using simple data:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        // Use simple data if full query fails, but we need to transform it to match Order type
        const transformedOrders = (simpleData || []).map(order => ({
          ...order,
          user: { full_name: 'Unknown', phone: null, block: 'Unknown', email: 'unknown@example.com' },
          order_items: []
        }));
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      } else {
        console.log('Full query successful, found orders:', data?.length || 0);
        console.log('Sample order data:', data?.[0]);
        console.log('Sample order_items:', data?.[0]?.order_items);
        
        // Check if order_items are properly populated
        const ordersWithItems = data?.filter(order => order.order_items && order.order_items.length > 0) || [];
        const ordersWithoutItems = data?.filter(order => !order.order_items || order.order_items.length === 0) || [];
        
        console.log('Orders with items:', ordersWithItems.length);
        console.log('Orders without items:', ordersWithoutItems.length);
        
        if (ordersWithoutItems.length > 0) {
          console.log('Sample order without items:', ordersWithoutItems[0]);
        }
        
        setOrders(data || []);
        setFilteredOrders(data || []);
        
        // Fetch staff data separately for delivery assignments
        await fetchStaffData();
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

  const fetchCafeInfo = async (cafeId: string) => {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('name, description, location, type')
        .eq('id', cafeId)
        .single();
      
      if (error) throw error;
      setCafeInfo(data);
    } catch (error) {
      console.error('Error fetching cafe info:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!cafeId) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Get all orders for analytics
      const { data: allOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            menu_item:menu_items(name, price)
          )
        `)
        .eq('cafe_id', cafeId);

      if (error) throw error;

      const orders = allOrders || [];
      const todayOrders = orders.filter(order => 
        new Date(order.created_at) >= today
      );

      // Calculate analytics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const pendingOrders = orders.filter(order => 
        ['received', 'confirmed', 'preparing', 'on_the_way'].includes(order.status)
      ).length;
      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);

      // Top items
      const itemStats: Record<string, { quantity: number; revenue: number }> = {};
      orders.forEach(order => {
        order.order_items.forEach(item => {
          const itemName = item.menu_item.name;
          if (!itemStats[itemName]) {
            itemStats[itemName] = { quantity: 0, revenue: 0 };
          }
          itemStats[itemName].quantity += item.quantity;
          itemStats[itemName].revenue += item.quantity * item.menu_item.price;
        });
      });

      const topItems = Object.entries(itemStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      ['received', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled'].forEach(status => {
        ordersByStatus[status] = orders.filter(order => order.status === status).length;
      });

      // Revenue by day (last 7 days)
      const revenueByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= date && orderDate < nextDate;
        });

        revenueByDay.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          revenue: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
          orders: dayOrders.length
        });
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completedOrders,
        pendingOrders,
        todayOrders: todayOrders.length,
        todayRevenue,
        topItems,
        ordersByStatus,
        revenueByDay
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Function to credit points to user when order is completed (Cafe-specific system)
  const creditPointsToUser = async (orderId: string) => {
    try {
      console.log('Cafe Dashboard: Crediting points for completed order:', orderId);
      
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

  const fetchStaffData = async () => {
    if (!cafeId) return;
    
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('cafe_staff')
        .select(`
          user_id,
          role,
          is_active,
          profiles!user_id(full_name, email)
        `)
        .eq('cafe_id', cafeId)
        .eq('is_active', true);

      if (staffError) {
        console.error('Error fetching staff data:', staffError);
        return;
      }

      // Update orders with staff names
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.delivered_by_staff_id) {
            const staffMember = staffData?.find(s => s.user_id === order.delivered_by_staff_id);
            if (staffMember) {
              return {
                ...order,
                delivered_by_staff_name: staffMember.profiles?.full_name || 'Unknown Staff'
              };
            }
          }
          return order;
        })
      );
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
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

      console.log('Updating order with data:', { orderId, updateData });
      
      const { error } = await (supabase as any)
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

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

      // Refresh orders and analytics
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  // Helper function to get staff name for CSV export
  const getStaffNameForOrder = (order: Order): string => {
    if (!order.delivered_by_staff_id) {
      return 'Not Assigned';
    }
    
    // Find the staff member by ID
    const staffMember = staff.find(s => s.id === order.delivered_by_staff_id);
    if (staffMember) {
      return getStaffDisplayName(staffMember);
    }
    
    return 'Unknown Staff';
  };

  const exportOrders = async () => {
    try {
      const csvData = orders.map(order => ({
        'Order Number': order.order_number,
        'Customer': order.user?.full_name || 'Unknown User',
        'Email': order.user?.email || 'N/A',
        'Phone': order.user?.phone || 'N/A',
        'Block': order.user?.block || 'Unknown',
        'Status': order.status,
        'Total Amount': order.total_amount,
        'Payment Method': order.payment_method,
        'Items': order.order_items.map(item => 
          `${item.menu_item.name} (${item.quantity}x)`
        ).join(', '),
        'Order Date': new Date(order.created_at).toLocaleString(),
        'Delivery Notes': order.delivery_notes || 'N/A',
        'Delivered By': order.delivered_by_staff_name || getStaffNameForOrder(order)
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Orders exported to CSV file",
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive"
      });
    }
  };

  const clearCompletedOrders = async () => {
    if (!confirm('Are you sure you want to clear all completed orders? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('status', 'completed')
        .eq('cafe_id', cafeId);

      if (error) throw error;

      toast({
        title: "Orders Cleared",
        description: "All completed orders have been cleared",
      });

      // Refresh orders and analytics
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error('Error clearing orders:', error);
      toast({
        title: "Error",
        description: "Failed to clear completed orders",
        variant: "destructive"
      });
    }
  };

  const clearAllOrders = async () => {
    if (!confirm('Are you sure you want to clear ALL orders? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('cafe_id', cafeId);

      if (error) throw error;

      toast({
        title: "All Orders Cleared",
        description: "All orders have been cleared",
      });

      // Refresh orders and analytics
      fetchOrders();
      fetchAnalytics();
    } catch (error) {
      console.error('Error clearing all orders:', error);
      toast({
        title: "Error",
        description: "Failed to clear all orders",
        variant: "destructive"
      });
    }
  };


  // Filter and sort orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.block || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        aValue = a.user.full_name;
        bValue = b.user.full_name;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'preparing': return 'bg-orange-500';
      case 'on_the_way': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'received': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'on_the_way': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'received': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'on_the_way';
      case 'on_the_way': return 'completed';
      default: return null;
    }
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!cafeId) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('order_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('cafe_id', cafeId)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadNotifications(count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel(`cafe-notifications-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_notifications',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          setUnreadNotifications(prev => prev + 1);
          toast({
            title: "New Order!",
            description: "You have a new order to process",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`cafe-orders-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        async (payload) => {
          fetchOrders();
          fetchAnalytics();
          setUnreadNotifications(prev => prev + 1);
          
          // Play sound notification for new orders
          if (soundEnabled) {
            soundNotificationService.updateSettings(soundEnabled, soundVolume, soundOption);
            await soundNotificationService.playOrderReceivedSound();
          }
          
          toast({
            title: "New Order!",
            description: `Order #${payload.new.order_number} received`,
          });
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
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId, toast]);

  useEffect(() => {
    if (cafeId) {
      fetchCafeInfo(cafeId);
      fetchOrders();
      fetchAnalytics();
    }
  }, [cafeId]);



  // Check if user is cafe owner or staff
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">You need to be logged in to access the cafe dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is cafe owner or staff
  if (profile.user_type !== 'cafe_owner' && profile.user_type !== 'cafe_staff') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground">Only cafe owners and staff can access the cafe dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cafeId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Not Authorized</h2>
              <p className="text-muted-foreground">You are not authorized to access any cafe dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cafe Dashboard</h1>
            <p className="text-muted-foreground">
              Managing: <span className="font-semibold text-primary">{cafeInfo?.name || 'Loading...'}</span> • 
              Manage orders, track analytics, and maintain your business
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sound Settings button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSoundSettingsOpen(true)}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Sound
            </Button>
            
            {/* Management button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/cafe-management?from=cafe-dashboard')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Management
            </Button>
            
            {/* Notifications button */}
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setIsNotificationOpen(true)}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>



        {/* Analytics Dashboard */}
        {analytics && (
          <PasswordProtectedSection
            title="Analytics Dashboard"
            description="View revenue, orders, and business metrics"
            passwordKey="analytics"
          >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                    <p className="text-2xl font-bold">{analytics.todayOrders}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{analytics.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          </PasswordProtectedSection>
        )}

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      <SelectItem value="created_at">Order Date</SelectItem>
                      <SelectItem value="total_amount">Amount</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="user">Customer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button onClick={exportOrders} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Button onClick={clearCompletedOrders} variant="outline" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Clear Completed
                    </Button>
                    <Button onClick={clearAllOrders} variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground">
                      No orders match your current filters.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="food-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status.replace('_', ' ').toUpperCase()}</span>
                            </Badge>
                            <div>
                              <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">₹{order.total_amount}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_items.length} items
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Customer Info */}
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{order.user?.full_name || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Block {order.user?.block || 'Unknown'}</span>
                            </div>
                            {(order.phone_number || order.user?.phone) && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{order.phone_number || order.user?.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <ChefHat className="w-4 h-4" />
                            Order Items ({order.order_items.length} items):
                          </h4>
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded border">
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.menu_item?.name || 'Unknown Item'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.menu_item?.price || 0}
                                  </p>
                                  {item.special_instructions && (
                                    <p className="text-sm text-blue-600 italic mt-1">
                                      Note: {item.special_instructions}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">
                                    ₹{(item.menu_item?.price || 0) * item.quantity}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.menu_item?.category || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                              <p className="text-sm text-yellow-800">
                                No items found for this order
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Delivery Info */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Delivery Details:</h4>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>Block:</strong> {order.delivery_block}</p>
                            <p><strong>Payment:</strong> {order.payment_method}</p>
                            {(order.phone_number || order.user?.phone) && (
                              <p><strong>Phone:</strong> {order.phone_number || order.user?.phone}</p>
                            )}
                            {order.delivery_notes && (
                              <p><strong>Notes:</strong> {order.delivery_notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          {getNextStatus(order.status) && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              className="flex-1"
                            >
                              {getNextStatus(order.status) === 'confirmed' && 'Accept Order'}
                              {getNextStatus(order.status) === 'preparing' && 'Start Preparing'}
                              {getNextStatus(order.status) === 'on_the_way' && 'Out for Delivery'}
                              {getNextStatus(order.status) === 'completed' && 'Mark Complete'}
                            </Button>
                          )}
                          
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <CafeCancellationDialog
                              orderId={order.id}
                              orderNumber={order.order_number}
                              onCancel={() => {
                                fetchOrders();
                                fetchAnalytics();
                              }}
                              trigger={
                                <Button variant="destructive">
                                  Cancel Order
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            {cafeId ? (
              <CafeScanner cafeId={cafeId} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Loading Cafe Information</h3>
                  <p className="text-muted-foreground">
                    Please wait while we load your cafe details.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <PasswordProtectedSection
                title="Analytics Data"
                description="View detailed analytics and reports"
                passwordKey="analytics"
              >
                <>
                  {/* Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Revenue Trend (Last 7 Days)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {analytics.revenueByDay.map((day, index) => (
                          <div key={index} className="text-center">
                            <div className="text-sm font-medium">{day.date}</div>
                            <div className="text-lg font-bold text-green-600">₹{day.revenue}</div>
                            <div className="text-xs text-muted-foreground">{day.orders} orders</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} orders • ₹{item.revenue} revenue
                              </p>
                            </div>
                            <Badge variant="secondary">#{index + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                          <div key={status} className="text-center p-4 bg-muted/30 rounded">
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {status.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              </PasswordProtectedSection>
            )}
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <PasswordProtectedSection
              title="Database Management"
              description="Export data and view database statistics"
              passwordKey="database"
            >
              <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <Button onClick={exportOrders} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Orders (CSV)
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export Analytics Report
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Database Stats</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Total Orders:</strong> {analytics?.totalOrders || 0}</p>
                      <p><strong>Total Revenue:</strong> ₹{analytics?.totalRevenue.toLocaleString() || 0}</p>
                      <p><strong>Average Order Value:</strong> ₹{analytics?.averageOrderValue.toFixed(2) || 0}</p>
                      <p><strong>Completion Rate:</strong> {analytics ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </PasswordProtectedSection>
          </TabsContent>
        </Tabs>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userType="cafe_staff"
        cafeId={cafeId}
      />

      {/* Sound Settings Modal */}
      {isSoundSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-primary" />
                Sound Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSoundSettingsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <OrderNotificationSound
              isEnabled={soundEnabled}
              onToggle={toggleSound}
              volume={soundVolume}
              onVolumeChange={setVolume}
              soundOption={soundOption}
              onSoundOptionChange={setSoundOption}
            />
            
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsSoundSettingsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CafeDashboard;

