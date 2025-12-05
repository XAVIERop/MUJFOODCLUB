import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  QrCode, 
  CreditCard, 
  Receipt,
  Save,
  Clock,
  User,
  Phone,
  MapPin,
  Percent,
  X,
  AlertCircle,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
// import { useLocalPrint } from '@/hooks/useLocalPrint'; // Disabled - using cafe-specific PrintNode service
import { usePrintNode } from '@/hooks/usePrintNode';
// Time restrictions removed for manual orders - staff can create orders at any time
import { getCafeTableOptions } from '@/utils/tableMapping';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url?: string;
}

interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  special_instructions?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  is_active: boolean;
}

interface ManualOrderEntryProps {
  cafeId: string;
}

const ManualOrderEntry: React.FC<ManualOrderEntryProps> = ({ cafeId }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  // const { isAvailable: localPrintAvailable, printReceipt: localPrintReceipt } = useLocalPrint(); // Disabled - using cafe-specific PrintNode service
  const { isAvailable: printNodeAvailable, printReceipt: printNodePrintReceipt } = usePrintNode();

  // State management
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    block: '',
    deliveryAddress: '',
    specialInstructions: '',
    orderType: 'delivery' // Default to delivery
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [manualDiscountType, setManualDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [cafeName, setCafeName] = useState<string>('');
  const [cafeLocationScope, setCafeLocationScope] = useState<string | null>(null); // 'off_campus' or 'ghs'
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load cafe name and location scope
  useEffect(() => {
    const fetchCafeInfo = async () => {
      if (!cafeId) return;
      
      try {
        const { data: cafe, error } = await supabase
          .from('cafes')
          .select('name, location_scope')
          .eq('id', cafeId)
          .single();
        
        if (error) {
          console.error('Error fetching cafe info:', error);
          return;
        }
        
        if (cafe) {
          setCafeName(cafe.name);
          setCafeLocationScope(cafe.location_scope);
        }
      } catch (error) {
        console.error('Error fetching cafe info:', error);
      }
    };

    fetchCafeInfo();
  }, [cafeId]);

  // Load menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!cafeId) return;
      
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeId)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching menu items:', error);
          toast({
            title: "Error",
            description: "Failed to load menu items",
            variant: "destructive"
          });
          return;
        }

        setMenuItems(data || []);
        
        // Extract unique categories
        const uniqueCategories = [...new Set((data?.map(item => item.category) || []) as string[])];
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0] as string);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMenuItems();
  }, [cafeId, toast]);

  // Filter menu items based on search term and selected category
  const getFilteredMenuItems = () => {
    let filtered = menuItems.filter(item => item.is_available);
    
    // Filter by selected category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  // Get filtered menu items by category and search
  const filteredMenuItems = React.useMemo(() => getFilteredMenuItems(), [menuItems, selectedCategory, searchTerm]);

  // Helper function to get dropdown options based on order type and cafe
  const getLocationOptions = (orderType: string, cafeName: string) => {
    if (orderType === 'dine_in') {
      // For dine-in, show table numbers
      const tableOptions = getCafeTableOptions(cafeName);
      return tableOptions.map(table => ({
        value: table.label, // "Table 1", "Table 2", etc.
        label: table.label
      }));
    } else if (orderType === 'delivery') {
      // For delivery, show blocks
      return [
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'B3', label: 'B3' },
        { value: 'B4', label: 'B4' },
        { value: 'B5', label: 'B5' },
        { value: 'B6', label: 'B6' },
        { value: 'B7', label: 'B7' },
        { value: 'B8', label: 'B8' },
        { value: 'B9', label: 'B9' },
        { value: 'B10', label: 'B10' },
        { value: 'B11', label: 'B11' },
        { value: 'B12', label: 'B12' },
        { value: 'G1', label: 'G1' },
        { value: 'G2', label: 'G2' },
        { value: 'G3', label: 'G3' },
        { value: 'G4', label: 'G4' },
        { value: 'G5', label: 'G5' },
        { value: 'G6', label: 'G6' },
        { value: 'G7', label: 'G7' },
        { value: 'G8', label: 'G8' },
        { value: 'G9', label: 'G9' },
        { value: 'G10', label: 'G10' },
        { value: 'G11', label: 'G11' },
        { value: 'G12', label: 'G12' }
      ];
    } else {
      // For takeaway, show blocks
      return [
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'B3', label: 'B3' },
        { value: 'B4', label: 'B4' },
        { value: 'B5', label: 'B5' },
        { value: 'B6', label: 'B6' },
        { value: 'B7', label: 'B7' },
        { value: 'B8', label: 'B8' },
        { value: 'B9', label: 'B9' },
        { value: 'B10', label: 'B10' },
        { value: 'B11', label: 'B11' },
        { value: 'B12', label: 'B12' },
        { value: 'G1', label: 'G1' },
        { value: 'G2', label: 'G2' },
        { value: 'G3', label: 'G3' },
        { value: 'G4', label: 'G4' },
        { value: 'G5', label: 'G5' },
        { value: 'G6', label: 'G6' },
        { value: 'G7', label: 'G7' },
        { value: 'G8', label: 'G8' },
        { value: 'G9', label: 'G9' },
        { value: 'G10', label: 'G10' },
        { value: 'G11', label: 'G11' },
        { value: 'G12', label: 'G12' }
      ];
    }
  };

  // Get cart quantity for a specific menu item
  const getCartQuantity = (menuItemId: string) => {
    const cartItem = cart.find(item => item.menu_item_id === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.menu_item_id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
          : cartItem
      ));
    } else {
      const newCartItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        menu_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        total: item.price,
        special_instructions: ''
      };
      setCart([...cart, newCartItem]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  // Remove item from cart
  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  // Handle quantity change from menu item
  const handleMenuQuantityChange = (item: MenuItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove from cart if quantity is 0 or less
      const cartItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
      if (cartItem) {
        removeFromCart(cartItem.id);
      }
    } else {
      // Update or add to cart
      const existingItem = cart.find(cartItem => cartItem.menu_item_id === item.id);
      
      if (existingItem) {
        updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item to cart with specified quantity
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`,
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: newQuantity,
          total: newQuantity * item.price,
          special_instructions: ''
        };
        setCart([...cart, newCartItem]);
      }
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const couponDiscount = appliedCoupon ? 
    (appliedCoupon.discount_type === 'percentage' 
      ? Math.min(subtotal * (appliedCoupon.discount_value / 100), appliedCoupon.max_discount || subtotal)
      : appliedCoupon.discount_value
    ) : 0;
  
  // Manual discount can be fixed amount (₹) or percentage (%)
  const manualDiscountAmount = manualDiscountType === 'percentage'
    ? Math.min(subtotal * (manualDiscount / 100), subtotal) // Percentage discount, capped at subtotal
    : Math.min(manualDiscount, subtotal); // Fixed amount discount, capped at subtotal
  
  const discountAmount = couponDiscount + manualDiscountAmount;
  const total = Math.max(0, subtotal - discountAmount);

  // Apply coupon (simplified version for now)
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Invalid Coupon",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    // Simple hardcoded coupons for now
    const availableCoupons = {
      'WELCOME10': { discount_type: 'percentage', discount_value: 10, min_order_amount: 100, max_discount: 50 },
      'SAVE50': { discount_type: 'fixed', discount_value: 50, min_order_amount: 200, max_discount: 50 },
      'STUDENT15': { discount_type: 'percentage', discount_value: 15, min_order_amount: 150, max_discount: 100 }
    };

    const couponData = availableCoupons[couponCode.trim().toUpperCase()];

    if (!couponData) {
      toast({
        title: "Invalid Coupon",
        description: "Coupon code not found",
        variant: "destructive"
      });
      return;
    }

    // Check minimum order amount
    if (couponData.min_order_amount && subtotal < couponData.min_order_amount) {
      toast({
        title: "Minimum Order Required",
        description: `Minimum order amount is ₹${couponData.min_order_amount}`,
        variant: "destructive"
      });
      return;
    }

    const coupon = {
      id: couponCode.trim().toUpperCase(),
      code: couponCode.trim().toUpperCase(),
      ...couponData
    };

    setAppliedCoupon(coupon);
    toast({
      title: "Coupon Applied",
      description: `Discount: ${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : '₹' + coupon.discount_value}`,
    });
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Create order
  const createOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart",
        variant: "destructive"
      });
      return;
    }

    // Customer info is optional for manual orders
    // No validation required - staff can enter orders without customer details

    setIsLoading(true);

    try {
      // Generate manual order number (MO prefix for Manual Order)
      const orderNumber = `MO-${Date.now().toString().slice(-6)}`;

      // Prepare order items for atomic creation
      const orderItemsForRPC = cart.map(item => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total,
        special_instructions: item.special_instructions || null
      }));

      // Determine delivery_block based on order type
      const deliveryBlock = customerInfo.orderType === 'dine_in' ? 'DINE_IN' : 
                            customerInfo.orderType === 'takeaway' ? 'TAKEAWAY' : 
                            customerInfo.orderType === 'delivery' && cafeLocationScope === 'off_campus' 
                              ? 'OFF_CAMPUS'
                              : customerInfo.block || null;

      // Use atomic RPC function to create order + items in single transaction
      // Note: Parameter order matters - required params first, then optional ones
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('create_order_with_items', {
          // Required parameters (must come first)
          p_user_id: user?.id || '00000000-0000-0000-0000-000000000001', // Use system user ID
          p_cafe_id: cafeId,
          p_order_number: orderNumber,
          p_total_amount: total,
          p_delivery_block: deliveryBlock,
          p_order_items: orderItemsForRPC,
          // Optional parameters (all have defaults)
          p_order_type: customerInfo.orderType,
          p_table_number: customerInfo.orderType === 'dine_in' ? customerInfo.block : null,
          p_delivery_address: customerInfo.orderType === 'delivery' && cafeLocationScope === 'off_campus' 
                              ? customerInfo.deliveryAddress || null 
                              : null,
          p_delivery_latitude: null,
          p_delivery_longitude: null,
          p_delivery_notes: customerInfo.specialInstructions || null,
          p_customer_name: customerInfo.name || 'Manual Order',
          p_phone_number: customerInfo.phone || null,
          p_payment_method: 'cod',
          p_points_earned: Math.floor(total / 10),
          p_referral_code_used: null,
          p_discount_amount: discountAmount,
          p_team_member_credit: 0,
          p_estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        });

      if (rpcError) {
        console.error('❌ Atomic order creation error:', rpcError);
        throw rpcError;
      }

      if (!rpcResult || !rpcResult.id) {
        console.error('❌ Order was not created - no order data returned from RPC');
        throw new Error('Order creation failed - no order data returned from database');
      }

      console.log('✅ Order and items created atomically:', rpcResult.order_number, 'ID:', rpcResult.id, 'Items:', rpcResult.items_inserted);

      // Fetch the complete order data for subsequent operations
      let orderData: any = null;

      const { data: fetchedOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', rpcResult.id)
        .single();

      if (fetchError || !fetchedOrder) {
        console.error('❌ Error fetching created order:', fetchError);
        // Use RPC result as fallback
        orderData = {
          id: rpcResult.id,
          order_number: rpcResult.order_number,
          status: 'received',
          total_amount: total,
          order_type: customerInfo.orderType,
          delivery_block: deliveryBlock,
          table_number: customerInfo.orderType === 'dine_in' ? customerInfo.block : null,
          delivery_address: customerInfo.orderType === 'delivery' && cafeLocationScope === 'off_campus' 
                            ? customerInfo.deliveryAddress || null 
                            : null,
          payment_method: 'cod',
          points_earned: Math.floor(total / 10),
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          customer_name: customerInfo.name || 'Manual Order',
          phone_number: customerInfo.phone || null,
          delivery_notes: customerInfo.specialInstructions || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.warn('⚠️ Using fallback order data from RPC result');
      } else {
        orderData = fetchedOrder;
      }

      // Verify order is available
      if (!orderData || !orderData.id) {
        throw new Error('Order creation failed - could not retrieve order data');
      }

      // Apply coupon if exists (skip for now as coupons table might not exist)
      if (appliedCoupon) {
        try {
          const { error: couponError } = await supabase
            .from('order_coupons')
            .insert({
              order_id: orderData.id,
              coupon_id: appliedCoupon.id,
              discount_amount: discountAmount
            });

          if (couponError) {
            console.error('Coupon application error:', couponError);
            // Don't throw here, just log the error as coupon is optional
          }
        } catch (couponError) {
          console.error('Coupon system not available:', couponError);
          // Continue without coupon
        }
      }

      toast({
        title: "Order Created",
        description: `Manual order created successfully`,
      });

      // Print receipt
      if (orderData) {
        await printReceipt(orderData);
      }

      // Reset form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', block: '', deliveryAddress: '', specialInstructions: '', orderType: 'delivery' });
      setAppliedCoupon(null);
      setCouponCode('');

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: `Failed to create order: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Print receipt
  const printReceipt = async (order: any) => {
    try {
      const receiptData = {
        order_id: order.id,
        order_number: order.order_number,
        cafe_name: profile?.cafe_name || 'Cafe',
        customer_name: order.customer_name || 'Walk-in Customer',
        customer_phone: order.phone_number || 'N/A',
        delivery_block: order.delivery_block || 'N/A',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total,
          special_instructions: item.special_instructions
        })),
        subtotal: subtotal,
        tax_amount: 0,
        discount_amount: discountAmount,
        final_amount: total,
        payment_method: 'cod',
        order_date: order.created_at,
        estimated_delivery: order.estimated_delivery,
        points_earned: order.points_earned,
        points_redeemed: 0
      };

      // Try PrintNode first
      if (printNodeAvailable) {
        const result = await printNodePrintReceipt(receiptData);
        if (result.success) {
          toast({
            title: "Receipt Printed",
            description: "Professional thermal receipt sent via PrintNode",
          });
          return;
        }
      }

      // Fallback to local print service - DISABLED (using cafe-specific PrintNode service)
      // if (localPrintAvailable) {
      //   const result = await localPrintReceipt(receiptData);
      //   if (result.success) {
      //     toast({
      //       title: "Receipt Printed",
      //       description: "Professional thermal receipt sent via local service",
      //     });
      //     return;
      //   }
      // }

      toast({
        title: "Print Service Unavailable",
        description: "Receipt saved but printing service is not available",
        variant: "destructive"
      });

    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to print receipt",
        variant: "destructive"
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">Manual Order Entry</h2>
            <p className="text-xs lg:text-sm text-gray-600">Create orders for walk-in customers</p>
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0 ml-2">
            <Badge variant="secondary" className="text-xs lg:text-sm px-2 py-0.5">
              {cart.length} items
            </Badge>
            <Badge variant="outline" className="text-xs lg:text-sm px-2 py-0.5">
              {formatCurrency(total)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile: Horizontal Scrollable Categories | Desktop: Vertical Sidebar */}
        <div className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r overflow-y-auto">
          {/* Mobile: Horizontal Scroll */}
          <div className="lg:hidden p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Categories</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="flex-shrink-0 whitespace-nowrap text-xs px-3 py-1.5 h-auto"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          {/* Desktop: Vertical List */}
          <div className="hidden lg:block p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Menu Items */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-3 lg:p-4">
            {/* Search Bar */}
            <div className="mb-3 lg:mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2.5 lg:py-2 w-full text-sm lg:text-base h-10 lg:h-auto"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">
              {searchTerm ? `Search results for "${searchTerm}"` : selectedCategory} ({filteredMenuItems.length} items)
            </h3>
            
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-6 lg:py-8">
                <Search className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3 lg:mb-4" />
                <p className="text-gray-500 text-base lg:text-lg font-medium">
                  {searchTerm ? 'No items found matching your search' : 'No items available in this category'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-4">
                {filteredMenuItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-2 lg:p-4 flex flex-col h-full">
                    {/* Mobile: Compact Square Cards | Desktop: Full Cards with Description */}
                    <div className="flex flex-col flex-1 space-y-1 lg:space-y-2">
                      {/* Item Name - Mobile: Smaller, Desktop: Normal */}
                      <h4 className="font-medium text-gray-900 text-[10px] sm:text-xs lg:text-base line-clamp-2 lg:line-clamp-none leading-tight">{item.name}</h4>
                      
                      {/* Description - Completely Removed on Mobile, Shown on Desktop Only */}
                      {!isMobile && item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                      
                      {/* Price and Action Button */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-1 lg:gap-0 mt-auto">
                        <span className="font-bold text-xs sm:text-sm lg:text-lg text-green-600">
                          {formatCurrency(item.price)}
                        </span>
                        {getCartQuantity(item.id) > 0 ? (
                          // Show quantity selector when item is in cart
                          <div className="flex items-center justify-center lg:justify-start space-x-1 lg:space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMenuQuantityChange(item, getCartQuantity(item.id) - 1)}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0"
                            >
                              <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                            </Button>
                            <span className="text-[10px] sm:text-xs lg:text-sm font-medium min-w-[14px] sm:min-w-[18px] lg:min-w-[20px] text-center">
                              {getCartQuantity(item.id)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMenuQuantityChange(item, getCartQuantity(item.id) + 1)}
                              className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0"
                            >
                              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4" />
                            </Button>
                          </div>
                        ) : (
                          // Show green + button when item is not in cart
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="bg-green-600 hover:bg-green-700 h-6 w-6 sm:h-7 sm:w-7 lg:h-auto lg:w-auto p-0 lg:px-3 lg:py-1"
                          >
                            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 lg:mr-1" />
                            <span className="hidden lg:inline">Add</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Compact Order Form */}
        {/* Mobile: Sticky Bottom or Collapsible | Desktop: Fixed Sidebar */}
        <div className="lg:w-80 w-full bg-white border-t lg:border-t-0 lg:border-l overflow-y-auto 
                        lg:max-h-none max-h-[60vh] lg:sticky lg:top-0">
          <div className="p-3 lg:p-4">
            {/* Compact Order Form */}
            <div className="space-y-3 lg:space-y-4">
              {/* Order Type - Compact */}
              <div className="bg-gray-50 p-2.5 lg:p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-sm">Order Type</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                  <button
                    onClick={() => setCustomerInfo(prev => ({ ...prev, orderType: 'delivery', block: '', deliveryAddress: '' }))}
                    className={`p-2 lg:p-2 text-xs rounded border ${
                      customerInfo.orderType === 'delivery' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-3 h-3 mx-auto mb-0.5 lg:mb-1" />
                    <span className="text-[10px] lg:text-xs">Delivery</span>
                  </button>
                  <button
                    onClick={() => setCustomerInfo(prev => ({ ...prev, orderType: 'takeaway', block: '', deliveryAddress: '' }))}
                    className={`p-2 lg:p-2 text-xs rounded border ${
                      customerInfo.orderType === 'takeaway' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <QrCode className="w-3 h-3 mx-auto mb-0.5 lg:mb-1" />
                    <span className="text-[10px] lg:text-xs">Takeaway</span>
                  </button>
                  <button
                    onClick={() => setCustomerInfo(prev => ({ ...prev, orderType: 'dine_in', block: '', deliveryAddress: '' }))}
                    className={`p-2 lg:p-2 text-xs rounded border ${
                      customerInfo.orderType === 'dine_in' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-3 h-3 mx-auto mb-0.5 lg:mb-1" />
                    <span className="text-[10px] lg:text-xs">Dine In</span>
                  </button>
                </div>
              </div>

              {/* Location/Table/Delivery Address - Compact - Hidden for takeaway orders */}
              {customerInfo.orderType !== 'takeaway' && (
                <div className="bg-gray-50 p-2.5 lg:p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600" />
                    <span className="font-medium text-xs lg:text-sm">
                      {customerInfo.orderType === 'delivery' && cafeLocationScope === 'off_campus' ? 'Delivery Address' :
                       customerInfo.orderType === 'delivery' ? 'Block' : 
                       customerInfo.orderType === 'dine_in' ? 'Table' : 
                       'Location'}
                    </span>
                  </div>
                  
                  {/* For outside cafes with delivery orders, show address input */}
                  {customerInfo.orderType === 'delivery' && cafeLocationScope === 'off_campus' ? (
                    <Input
                      placeholder="Enter delivery address (Optional)"
                      value={customerInfo.deliveryAddress}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      className="h-9 lg:h-8 text-xs lg:text-sm"
                    />
                  ) : (
                    /* For GHS cafes or dine-in, show block/table dropdown */
                    <Select 
                      value={customerInfo.block} 
                      onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, block: value }))}
                    >
                      <SelectTrigger className="h-9 lg:h-8 text-xs lg:text-sm">
                        <SelectValue placeholder={
                          customerInfo.orderType === 'delivery' ? 'Select block (Optional)' :
                          customerInfo.orderType === 'dine_in' ? 'Select table (Optional)' :
                          'Select location (Optional)'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {getLocationOptions(customerInfo.orderType, cafeName).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Customer Info - Compact */}
              <div className="bg-gray-50 p-2.5 lg:p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2 lg:mb-3">
                  <User className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600" />
                  <span className="font-medium text-xs lg:text-sm">Customer Info</span>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Customer Name (Optional)"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="h-9 lg:h-8 text-xs lg:text-sm"
                  />
                  <Input
                    placeholder="Phone Number (Optional)"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="h-9 lg:h-8 text-xs lg:text-sm"
                  />
                  <Input
                    placeholder="Special Instructions (Optional)"
                    value={customerInfo.specialInstructions}
                    onChange={(e) => setCustomerInfo({...customerInfo, specialInstructions: e.target.value})}
                    className="h-9 lg:h-8 text-xs lg:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2 lg:pb-3 p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-lg flex items-center gap-2">
                  <Percent className="h-4 w-4 lg:h-5 lg:w-5" />
                  Discount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4 p-3 lg:p-6 pt-0">
                {/* Manual Discount Input */}
                <div className="bg-gray-50 p-2.5 lg:p-3 rounded-lg">
                  <Label className="text-xs lg:text-sm font-medium mb-2 block">Manual Discount</Label>
                  
                  {/* Discount Type Toggle */}
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant={manualDiscountType === 'fixed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setManualDiscountType('fixed');
                        setManualDiscount(0);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      ₹ Fixed
                    </Button>
                    <Button
                      type="button"
                      variant={manualDiscountType === 'percentage' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setManualDiscountType('percentage');
                        setManualDiscount(0);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      % Percentage
                    </Button>
                  </div>
                  
                  <Input
                    type="number"
                    placeholder={manualDiscountType === 'fixed' ? "Enter discount amount (₹)" : "Enter discount percentage (%)"}
                    value={manualDiscount || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (manualDiscountType === 'percentage') {
                        setManualDiscount(Math.max(0, Math.min(100, value))); // Cap at 100%
                      } else {
                        setManualDiscount(Math.max(0, value));
                      }
                    }}
                    min="0"
                    max={manualDiscountType === 'percentage' ? 100 : undefined}
                    step={manualDiscountType === 'percentage' ? '0.1' : '1'}
                    className="h-9 lg:h-8 text-xs lg:text-sm"
                  />
                  {manualDiscount > 0 && (
                    <p className="text-xs text-gray-600 mt-1 font-medium">
                      {manualDiscountType === 'percentage' 
                        ? `Discount: ${manualDiscount}% = ₹${manualDiscountAmount.toFixed(2)}`
                        : `Discount: ₹${manualDiscount.toFixed(2)}`
                      }
                    </p>
                  )}
                </div>

                {/* Coupon Code */}
                <div>
                  <Label className="text-xs lg:text-sm font-medium mb-2 block">Coupon Code (Optional)</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 lg:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800 text-xs lg:text-sm">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600">
                          {appliedCoupon.discount_type === 'percentage' 
                            ? `${appliedCoupon.discount_value}% off`
                            : `₹${appliedCoupon.discount_value} off`
                          }
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeCoupon}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-9 lg:h-8 text-xs lg:text-sm"
                      />
                      <Button onClick={applyCoupon} size="sm" className="h-9 lg:h-8 text-xs lg:text-sm">
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-gray-200">
              <CardHeader className="pb-2 lg:pb-3 p-3 lg:p-6">
                <CardTitle className="text-sm lg:text-lg flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 lg:p-6 pt-0">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex flex-col p-2.5 lg:p-3 border rounded-lg gap-2">
                        {/* Item Name and Price - Full Width */}
                        <div className="flex-1 w-full">
                          <p className="font-medium text-xs lg:text-sm break-words">{item.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{formatCurrency(item.price)} each</p>
                        </div>
                        {/* Quantity Controls and Actions - Bottom Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 lg:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 lg:h-9 lg:w-9 p-0"
                            >
                              <Minus className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                            <span className="w-8 lg:w-10 text-center text-xs lg:text-sm font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 lg:h-9 lg:w-9 p-0"
                            >
                              <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-sm lg:text-base">{formatCurrency(item.total)}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 h-8 w-8 lg:h-9 lg:w-9 p-0"
                            >
                              <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {cart.length > 0 && (
              <Card className="border-gray-200">
                <CardHeader className="pb-2 lg:pb-3 p-3 lg:p-6">
                  <CardTitle className="text-sm lg:text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3 lg:p-6 pt-0">
                  <div className="flex justify-between text-sm lg:text-base">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="space-y-1">
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600 text-xs lg:text-sm">
                          <span>Coupon Discount:</span>
                          <span>-{formatCurrency(couponDiscount)}</span>
                        </div>
                      )}
                      {manualDiscountAmount > 0 && (
                        <div className="flex justify-between text-green-600 text-xs lg:text-sm">
                          <span>
                            Manual Discount {manualDiscountType === 'percentage' ? `(${manualDiscount}%)` : ''}:
                          </span>
                          <span>-{formatCurrency(manualDiscountAmount)}</span>
                        </div>
                      )}
                      {(couponDiscount > 0 || manualDiscountAmount > 0) && (
                        <div className="flex justify-between text-green-600 text-sm lg:text-base font-medium">
                          <span>Total Discount:</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-base lg:text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {cart.length > 0 && (
              <div className="space-y-2 pt-2 lg:pt-0">
                <Button
                  onClick={createOrder}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 h-11 lg:h-10 text-sm lg:text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Order (COD)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 lg:h-9 text-sm lg:text-base"
                  onClick={() => {
                    setCart([]);
                    setCustomerInfo({ name: '', phone: '', block: '', deliveryAddress: '', specialInstructions: '', orderType: 'delivery' });
                    setAppliedCoupon(null);
                    setCouponCode('');
                    setManualDiscount(0);
                    setManualDiscountType('fixed');
                  }}
                >
                  Clear Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualOrderEntry;

