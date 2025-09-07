import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
// import { useLocalPrint } from '@/hooks/useLocalPrint'; // Disabled - using cafe-specific PrintNode service
import { usePrintNode } from '@/hooks/usePrintNode';

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
    specialInstructions: ''
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Load menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!cafeId) return;
      
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeId)
          .eq('is_available', true)
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
        const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
        setCategories(uniqueCategories);
        
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMenuItems();
  }, [cafeId, toast]);

  // Get filtered menu items by category
  const filteredMenuItems = menuItems.filter(item => item.category === selectedCategory);

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

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = appliedCoupon ? 
    (appliedCoupon.discount_type === 'percentage' 
      ? Math.min(subtotal * (appliedCoupon.discount_value / 100), appliedCoupon.max_discount || subtotal)
      : appliedCoupon.discount_value
    ) : 0;
  const total = subtotal - discountAmount;

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

    if (!customerInfo.name.trim()) {
      toast({
        title: "Customer Info Required",
        description: "Please enter customer name",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, use the current user's ID or create a simple order
      // TODO: Implement proper manual order system with database functions
      const orderNumber = `MO-${Date.now().toString().slice(-6)}`;

      // Create order directly (temporary solution)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          cafe_id: cafeId,
          user_id: user?.id || '00000000-0000-0000-0000-000000000001', // Use system user ID
          status: 'received',
          total_amount: total,
          delivery_block: customerInfo.block || 'Counter',
          payment_method: 'cod',
          points_earned: Math.floor(total / 10),
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          customer_name: customerInfo.name,
          phone_number: customerInfo.phone,
          delivery_notes: customerInfo.specialInstructions
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total,
        special_instructions: item.special_instructions
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Items creation error:', itemsError);
        throw itemsError;
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
      setCustomerInfo({ name: '', phone: '', block: '', specialInstructions: '' });
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
        delivery_block: order.delivery_block || 'Counter',
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
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manual Order Entry</h2>
            <p className="text-sm text-gray-600">Create orders for walk-in customers</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {cart.length} items
            </Badge>
            <Badge variant="outline" className="text-sm">
              {formatCurrency(total)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Categories */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
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
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              {selectedCategory} ({filteredMenuItems.length} items)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(item.price)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Order Cart */}
        <div className="w-96 bg-white border-l overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Customer Name *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
                <Input
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
                <Input
                  placeholder="Block/Delivery Address"
                  value={customerInfo.block}
                  onChange={(e) => setCustomerInfo({...customerInfo, block: e.target.value})}
                />
                <Input
                  placeholder="Special Instructions"
                  value={customerInfo.specialInstructions}
                  onChange={(e) => setCustomerInfo({...customerInfo, specialInstructions: e.target.value})}
                />
              </CardContent>
            </Card>

            {/* Coupon Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={applyCoupon} size="sm">
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items in cart</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{formatCurrency(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="ml-2">
                          <p className="font-medium text-sm">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {cart.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {cart.length > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={createOrder}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
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
                  className="w-full"
                  onClick={() => {
                    setCart([]);
                    setCustomerInfo({ name: '', phone: '', block: '', specialInstructions: '' });
                    setAppliedCoupon(null);
                    setCouponCode('');
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
