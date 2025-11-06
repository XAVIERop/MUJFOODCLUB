import { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Clock, Banknote, AlertCircle, Plus, Minus, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { ORDER_CONSTANTS } from '@/lib/constants';
import { isDineInTakeawayAllowed, isDeliveryAllowed, getDineInTakeawayMessage, getDeliveryMessage } from '@/utils/timeRestrictions';
import { generateDailyOrderNumber } from '@/utils/orderNumberGenerator';
import { getCafeTableOptions } from '@/utils/tableMapping';
import { WhatsAppService } from '@/services/whatsappService';
import Header from '@/components/Header';
import ReferralCodeInput from '@/components/ReferralCodeInput';
import { ReferralValidation } from '@/services/referralService';

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
      { value: 'G8', label: 'G8' }
    ];
  } else if (orderType === 'takeaway') {
    // For takeaway, show takeaway option
    return [{ value: 'TAKEAWAY', label: 'Takeaway' }];
  }
  return [];
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_available: boolean;
}

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  rating: number;
  total_reviews: number;
  accepting_orders: boolean;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useRouterLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { cart, cafe, getTotalAmount, addToCart, removeFromCart, clearCart } = useCart();
  const { selectedBlock } = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate total amount from global cart
  const totalAmount = getTotalAmount();

  // Helper function to get cart's cafe name
  const getCartCafeName = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return '';
    
    // Get the first item's cafe name (assuming all items are from same cafe)
    const firstItem = cartItems[0] as any;
    return firstItem.item.cafe_name || '';
  };

  // Check if this is a grocery order (24 Seven Mart only - Grabit is now a regular cafe)
  const isGroceryOrder = () => {
    const cartCafeName = getCartCafeName();
    return cartCafeName?.toLowerCase().includes('24 seven') || 
           cartCafeName?.toLowerCase().includes('grocery') ||
           cafe?.name?.toLowerCase().includes('24 seven') ||
           cafe?.name?.toLowerCase().includes('grocery') ||
           cafe?.type === 'grocery';
  };

  // Check if this is a Grabit order (to hide takeaway/dine-in options)
  const isGrabitOrder = () => {
    const cartCafeName = getCartCafeName();
    return cartCafeName?.toLowerCase().includes('grabit') ||
           cafe?.name?.toLowerCase().includes('grabit') ||
           cafe?.slug === 'grabit';
  };

  // Form states
  const [deliveryDetails, setDeliveryDetails] = useState({
    orderType: 'delivery', // 'delivery', 'takeaway', or 'dine_in'
    block: selectedBlock,
    deliveryNotes: '',
    paymentMethod: 'cod',
    phoneNumber: profile?.phone || ''
  });

  // Force delivery for grocery orders and Grabit
  useEffect(() => {
    if (isGroceryOrder() || isGrabitOrder()) {
      // Force delivery order type
      if (deliveryDetails.orderType !== 'delivery') {
        setDeliveryDetails(prev => ({ ...prev, orderType: 'delivery' }));
      }
    }
  }, [isGroceryOrder(), isGrabitOrder(), deliveryDetails.orderType]);

  // Calculate final amount
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  
  // Tax and delivery charges
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  
  // MUJ FOOD CLUB discount
  const [discountAmount, setDiscountAmount] = useState(0);
  const isEligibleForDiscount = cafe?.name === 'CHATKARA' || cafe?.name === 'COOK HOUSE' || 
                                cafe?.name?.toLowerCase().includes('mini meals') || 
                                cafe?.name === 'MINI MEALS' ||
                                cafe?.name?.toLowerCase().includes('taste of india') ||
                                cafe?.name?.toLowerCase().includes('food court') || 
                                cafe?.name === 'FOOD COURT';

  // Referral system states
  const [referralCode, setReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralValidation, setReferralValidation] = useState<ReferralValidation | null>(null);
  
  // Check if user is verified (email confirmed)
  const isUserVerified = user?.email_confirmed_at !== null;

  // Minimum order amount validation
  const isMinimumOrderMet = totalAmount >= ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT;

  // Redirect if no cart data
  useEffect(() => {
    console.log('🛒 Checkout cart data:', cart);
    console.log('🏪 Cafe data:', cafe);
    console.log('💰 Total amount:', totalAmount);
    
    if (!cart || Object.keys(cart).length === 0 || !cafe) {
      console.log('❌ No cart data or cafe, redirecting to cafes');
      navigate('/cafes');
      return;
    }
  }, [cart, cafe, navigate, totalAmount]);

  // Update phone number when profile changes
  useEffect(() => {
    if (profile?.phone) {
      setDeliveryDetails(prev => ({ ...prev, phoneNumber: profile.phone }));
    }
  }, [profile?.phone]);

  // Calculate delivery charges and discount
  useEffect(() => {
    const subtotal = totalAmount;
    const deliveryCharge = deliveryDetails.orderType === 'delivery' ? ORDER_CONSTANTS.DELIVERY_CHARGE : 0;
    
    // Calculate MUJ FOOD CLUB discount (different rates for different cafes and order types)
    let discountRate = 0;
    if (cafe?.name === 'CHATKARA') {
      discountRate = 0.10; // 10% for Chatkara (all order types)
    } else if (cafe?.name === 'COOK HOUSE') {
      // Cook House: Different rates based on order type
      if (deliveryDetails.orderType === 'delivery') {
        discountRate = 0.10; // 10% for delivery
      } else if (deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') {
        discountRate = 0.05; // 5% for dine-in and takeaway
      }
    } else if (cafe?.name?.toLowerCase().includes('mini meals') || cafe?.name === 'MINI MEALS') {
      discountRate = 0.10; // 10% for Mini Meals
    } else if (cafe?.name?.toLowerCase().includes('taste of india')) {
      discountRate = 0.10; // 10% for Taste of India
    } else if (cafe?.name?.toLowerCase().includes('food court') || cafe?.name === 'FOOD COURT') {
      discountRate = 0.05; // 5% for Food Court
    }
    const discount = isEligibleForDiscount ? subtotal * discountRate : 0;
    
    // Check if this is Food Court, Pizza Bakers, or Taste of India order for GST calculation
    const isFoodCourt = cafe?.name?.toLowerCase().includes('food court') || 
                       cafe?.name === 'FOOD COURT' ||
                       cafe?.name?.toLowerCase() === 'food court';
    
    const isPizzaBakers = cafe?.name?.toLowerCase().includes('pizza bakers') || 
                         cafe?.name?.toLowerCase().includes('crazy chef');
    
    const isTasteOfIndia = cafe?.name?.toLowerCase().includes('taste of india') || 
                          cafe?.name === 'TASTE OF INDIA';
    
    
    // Calculate GST for Food Court, Pizza Bakers, and Taste of India orders
    let cgstAmount = 0;
    let sgstAmount = 0;
    
    if (isFoodCourt || isPizzaBakers || isTasteOfIndia) {
      // GST is calculated on subtotal (before discount and delivery)
      cgstAmount = subtotal * 0.025; // 2.5% CGST
      sgstAmount = subtotal * 0.025; // 2.5% SGST
    }
    
    const finalAmountWithDelivery = subtotal + cgstAmount + sgstAmount + deliveryCharge - discount - referralDiscount;
    
    setCgst(cgstAmount);
    setSgst(sgstAmount);
    setDeliveryFee(deliveryCharge);
    setDiscountAmount(discount);
    setFinalAmount(Math.max(0, finalAmountWithDelivery));
  }, [totalAmount, deliveryDetails.orderType, isEligibleForDiscount, cafe?.name, referralDiscount]);

  // Handle referral code validation
  const handleReferralValidation = async (validation: ReferralValidation | null) => {
    setReferralValidation(validation);

    // Only allow referral discount for verified users
    if (validation?.isValid && isUserVerified) {
      setReferralDiscount(5); // Apply ₹5 referral discount
    } else {
      setReferralDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      setError('Please sign in to place an order');
      return;
    }

    // Check if cafe is accepting orders from database
    // This check applies to ALL cafes including Grabit
    if (cafe && !cafe.accepting_orders) {
      setError('This cafe is temporarily not accepting orders. They will resume service in the next 2 days.');
      return;
    }

    // Check if the selected order type is currently available
    // Skip time restrictions for grocery orders and Grabit
    if (!isGroceryOrder() && !isGrabitOrder()) {
      if (deliveryDetails.orderType === 'delivery' && !isDeliveryAllowed(cafe?.name)) {
        toast({
          title: "Delivery Unavailable",
          description: getDeliveryMessage(cafe?.name),
          variant: "destructive"
        });
        return;
      }
      
      if ((deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') && !isDineInTakeawayAllowed()) {
        toast({
          title: "Dine-in/Takeaway Unavailable", 
          description: getDineInTakeawayMessage(),
          variant: "destructive"
        });
        return;
      }
    }

    // Validate phone number
    if (!deliveryDetails.phoneNumber || deliveryDetails.phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate location selection for all order types
    if (!deliveryDetails.block) {
      if (deliveryDetails.orderType === 'dine_in') {
        setError('Please select a table number for dine-in orders');
        return;
      } else if (deliveryDetails.orderType === 'delivery') {
        setError('Please select a block for delivery orders');
        return;
      } else if (deliveryDetails.orderType === 'takeaway') {
        setError('Please select a location for takeaway orders');
        return;
      }
    }

    if (!isMinimumOrderMet) {
      setError(`Minimum order amount is ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT}`);
      return;
    }


    setIsLoading(true);
    setError('');

    // Validate cafe exists
    if (!cafe || !cafe.id) {
      setError('Cafe information is missing. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🛒 Starting order creation...');
      console.log('🛒 Order data:', {
        user_id: user.id,
        cafe_id: cafe.id,
        cafe_name: cafe.name,
        cafe_type: cafe.type,
        cafe_slug: cafe.slug,
        is_grocery_order: isGroceryOrder(),
        total_amount: finalAmount,
        order_type: deliveryDetails.orderType,
        delivery_block: deliveryDetails.block,
        items_count: Object.values(cart).length
      });

      // Generate order number using new daily reset system
      console.log('🔄 Generating order number for cafe:', cafe.id);
      let orderNumber: string;
      
      try {
        orderNumber = await generateDailyOrderNumber(cafe.id);
        console.log('✅ Generated daily order number:', orderNumber);
      } catch (error) {
        console.error('❌ Failed to generate daily order number, using fallback:', error);
        // Fallback to old system
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        const userSuffix = user.id.substr(-4).toUpperCase();
        orderNumber = `ONLINE-${timestamp}-${random}-${userSuffix}`;
      }

      // Handle delivery_block based on order type
      let deliveryBlock;
      let tableNumber = null;
      
      if (deliveryDetails.orderType === 'dine_in') {
        // For dine-in, store table number separately and use 'DINE_IN' for delivery_block
        tableNumber = deliveryDetails.block.replace('Table ', ''); // Extract "1" from "Table 1"
        deliveryBlock = 'DINE_IN';
      } else if (deliveryDetails.orderType === 'takeaway') {
        deliveryBlock = 'TAKEAWAY';
      } else {
        // For delivery, use the block directly (B1, B2, etc.)
        deliveryBlock = deliveryDetails.block;
      }

      console.log('🛒 Inserting order into database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          cafe_id: cafe.id,
          order_number: orderNumber,
          total_amount: finalAmount,
          order_type: deliveryDetails.orderType,
          delivery_block: deliveryBlock,
          table_number: tableNumber,
          delivery_notes: deliveryDetails.deliveryNotes || '',
          payment_method: deliveryDetails.paymentMethod,
          phone_number: deliveryDetails.phoneNumber || '',
          customer_name: profile?.full_name || '',
          points_earned: 0, // No points in simplified version
          status: 'received',
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          referral_code_used: referralCode || null,
          discount_amount: referralDiscount,
          team_member_credit: referralValidation?.isValid ? 0.50 : 0 // ₹0.50 per order for team member
        })
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at
        `)
        .single();

      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        console.error('❌ Order error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw new Error(`Failed to create order: ${orderError.message || 'Unknown database error'}`);
      }

      if (!order || !order.id) {
        console.error('❌ Order was not created - no order data returned');
        throw new Error('Order creation failed - no order data returned from database');
      }

      console.log('✅ Order created successfully:', order.order_number, 'ID:', order.id);

      // Create order items (using the exact same pattern as the working CafeScanner)
      const orderItems = Object.values(cart).map((cartItem) => {
        if (!cartItem.item.id) {
          console.error('❌ Missing menu_item_id for item:', cartItem.item);
          throw new Error(`Missing menu item ID for "${cartItem.item.name}". Please remove this item and try again.`);
        }
        return {
          order_id: order.id,
          menu_item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          unit_price: cartItem.item.price,
          total_price: cartItem.item.price * cartItem.quantity,
          special_instructions: cartItem.notes
        };
      });

      console.log('🛒 Creating order items:', orderItems.length, 'items');
      console.log('🛒 Order items data:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError);
        console.error('❌ Order items error details:', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
          code: itemsError.code
        });
        throw new Error(`Failed to create order items: ${itemsError.message || 'Unknown error'}`);
      }
      
      console.log('✅ Order items created successfully');

      // Track referral usage if referral code was used
      if (referralCode && referralValidation?.isValid) {
        try {
          const { referralService } = await import('@/services/referralService');

          await referralService.trackReferralUsage({
            user_id: user.id,
            referral_code_used: referralCode,
            usage_type: 'checkout',
            order_id: order.id,
            discount_applied: referralDiscount,
            team_member_credit: 0.50 // ₹0.50 per order for team member
          });

          console.log('Referral usage tracked successfully:', referralCode);
        } catch (error) {
          console.error('Error tracking referral usage:', error);
          // Don't throw error - referral tracking is optional
        }
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.order_number} has been confirmed. Estimated delivery: 30 minutes.`,
      });

      // Send WhatsApp notification to cafe
      try {
        console.log('📱 [CHECKOUT] Starting WhatsApp notification process...');
        console.log('📱 [CHECKOUT] Order:', order.order_number);
        console.log('📱 [CHECKOUT] Cafe ID:', cafe?.id);
        console.log('📱 [CHECKOUT] Cafe Name:', cafe?.name);
        
        const whatsappService = WhatsAppService.getInstance();
        console.log('📱 [CHECKOUT] WhatsApp service instance created');
        
        // Format order data for WhatsApp
        const orderData = {
          id: order.id,
          order_number: order.order_number,
          customer_name: profile?.full_name || 'Customer',
          phone_number: deliveryDetails.phoneNumber || '+91 0000000000',
          delivery_block: deliveryDetails.block || 'N/A',
          total_amount: order.total_amount.toString(),
          created_at: order.created_at,
          items_text: Object.values(cart).map(item => 
            `• ${item.item.name} x${item.quantity} - ₹${(item.item.price * item.quantity).toFixed(2)}`
          ).join('\n'),
          delivery_notes: deliveryDetails.deliveryNotes || '',
          frontend_url: window.location.origin,
          order_items: Object.values(cart).map(item => ({
            quantity: item.quantity,
            menu_item: {
              name: item.item.name,
              price: item.item.price
            },
            total_price: item.item.price * item.quantity
          }))
        };
        
        console.log('📱 [CHECKOUT] Order data formatted:', JSON.stringify(orderData, null, 2));
        console.log('📱 [CHECKOUT] Calling WhatsApp service...');
        
        const whatsappSuccess = await whatsappService.sendOrderNotification(cafe?.id || '', orderData);
        
        console.log('📱 [CHECKOUT] WhatsApp service result:', whatsappSuccess);
        
        if (whatsappSuccess) {
          console.log('✅ [CHECKOUT] WhatsApp notification sent successfully');
        } else {
          console.log('❌ [CHECKOUT] WhatsApp notification failed');
        }
      } catch (whatsappError) {
        console.error('❌ [CHECKOUT] WhatsApp notification error:', whatsappError);
        // Don't fail the order if WhatsApp fails
      }

      // Clear the cart after successful order placement
      clearCart();
      console.log('🛒 Cart cleared after successful order placement');

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
          
      } catch (error) {
      console.error('❌ Order placement error:', error);
      console.error('❌ Error details:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Extract more detailed error message
      let errorMessage = 'Failed to place order';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('details' in error) {
          errorMessage = String(error.details) || errorMessage;
        } else if ('hint' in error) {
          errorMessage = String(error.hint) || errorMessage;
        }
      }
      
      setError(errorMessage || 'Failed to place order. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!cart || Object.keys(cart).length === 0 || !cafe) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Items in Cart</h2>
            <p className="text-muted-foreground mb-4">Please add items to your cart before checkout</p>
            <Button onClick={() => navigate('/cafes')}>
              Browse Cafes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Go back to previous page in browser history
                // This will take user back to where they came from (grocery, cafe menu, home, etc.)
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  // Fallback: if no history, go to appropriate page based on cart context
                  const cartCafeName = getCartCafeName();
                  if (cartCafeName?.toLowerCase().includes('24 seven') || cartCafeName?.toLowerCase().includes('grocery')) {
                    navigate('/grabit');
                  } else if (cafe?.slug || cafe?.id) {
                    navigate(`/menu/${cafe.slug || cafe.id}`);
                  } else {
                    navigate('/');
                  }
                }
              }}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">{cafe.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Order Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="delivery"
                          name="orderType"
                          value="delivery"
                          checked={deliveryDetails.orderType === 'delivery'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isGroceryOrder() && !isGrabitOrder() && !isDeliveryAllowed(cafe?.name)}
                        />
                        <Label htmlFor="delivery" className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Delivery
                          {!isGroceryOrder() && !isGrabitOrder() && !isDeliveryAllowed(cafe?.name) && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                  </div>

                      {/* Hide takeaway and dine-in for grocery orders and Grabit */}
                      {!isGroceryOrder() && !isGrabitOrder() && (
                        <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="takeaway"
                          name="orderType"
                          value="takeaway"
                          checked={deliveryDetails.orderType === 'takeaway'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isDineInTakeawayAllowed()}
                        />
                        <Label htmlFor="takeaway" className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Takeaway
                          {!isDineInTakeawayAllowed() && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dine_in"
                          name="orderType"
                          value="dine_in"
                          checked={deliveryDetails.orderType === 'dine_in'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isDineInTakeawayAllowed()}
                        />
                        <Label htmlFor="dine_in" className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Dine In
                          {!isDineInTakeawayAllowed() && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                      </div>
                        </>
                      )}
                        </div>
                    
                    {/* Hide time restriction alerts for grocery orders and Grabit */}
                    {!isGroceryOrder() && !isGrabitOrder() && !isDeliveryAllowed(cafe?.name) && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {getDeliveryMessage(cafe?.name)}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {!isGroceryOrder() && !isGrabitOrder() && !isDineInTakeawayAllowed() && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {getDineInTakeawayMessage()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location Details - Dynamic based on order type */}
                  {(deliveryDetails.orderType === 'delivery' || deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') && (
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                        {deliveryDetails.orderType === 'delivery' ? 'Delivery Details' : 
                         deliveryDetails.orderType === 'dine_in' ? 'Dine In Details' : 
                         'Takeaway Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="location">
                        {deliveryDetails.orderType === 'delivery' ? 'Block' : 
                         deliveryDetails.orderType === 'dine_in' ? 'Table Number *' : 
                         'Location'}
                      </Label>
                        <Select 
                          value={deliveryDetails.block} 
                        onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, block: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              deliveryDetails.orderType === 'delivery' ? 'Select your block' :
                              deliveryDetails.orderType === 'dine_in' ? 'Select table number' :
                              'Select location'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                          {getLocationOptions(deliveryDetails.orderType, cafe.name).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                          </SelectContent>
                        </Select>
                      </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <div className="relative">
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={deliveryDetails.phoneNumber}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="Enter your phone number"
                          required
                          minLength={10}
                          maxLength={10}
                        />
                      </div>
                      {deliveryDetails.phoneNumber && deliveryDetails.phoneNumber.length !== 10 && (
                        <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
                  )}
                      </div>

                    <div>
                      <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="deliveryNotes"
                        value={deliveryDetails.deliveryNotes}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                        placeholder="Any special instructions for delivery"
                        rows={3}
                      />
                    </div>

                  </CardContent>
                </Card>
                  )}

              {/* Referral Code Input - Always Visible */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className="text-sm font-medium text-gray-700">
                      Referral Code (Optional)
                    </Label>
                    <ReferralCodeInput
                      value={referralCode}
                      onChange={setReferralCode}
                      onValidation={handleReferralValidation}
                      placeholder="Enter referral code (e.g., TEAM123)"
                      className="w-full"
                    />
                    {referralValidation?.isValid && (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <span>✅</span>
                        Valid code! You'll get ₹5 off your order
                      </div>
                    )}
                    {!isUserVerified && referralCode && (
                      <div className="text-sm text-orange-600 flex items-center gap-1">
                        <span>⚠️</span>
                        Please verify your email to use referral codes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Banknote className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={deliveryDetails.paymentMethod === 'cod'}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>


            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {Object.values(cart).map((cartItem) => {
                      const isFreeBogoItem = cartItem.item.name.startsWith('FREE ') && cartItem.item.price === 0;
                      
                      return (
           <div 
             key={cartItem.item.id} 
             className={`flex justify-between items-start p-3 rounded-lg border ${
               isFreeBogoItem 
                 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                 : 'bg-gray-50 border-gray-200'
             }`}
           >
             <div className="flex-1">
               <div className="flex items-center gap-2">
                 <p className={`font-medium ${isFreeBogoItem ? 'text-green-800' : 'text-gray-900'}`}>
                   {cartItem.item.name}
                 </p>
                 {/* Removed FREE BOGO Badge */}
               </div>
               <div className="flex items-center gap-2 mt-1">
                 <p className="text-sm text-muted-foreground">Qty:</p>
                 <div className="flex items-center gap-1">
                   <Button
                     size="sm"
                     variant="outline"
                     className="h-6 w-6 p-0"
                     onClick={() => removeFromCart(cartItem.item.id)}
                   >
                     <Minus className="h-3 w-3" />
                   </Button>
                   <span className="text-sm font-medium min-w-[20px] text-center">
                     {cartItem.quantity}
                   </span>
                   <Button
                     size="sm"
                     variant="outline"
                     className="h-6 w-6 p-0"
                     onClick={() => addToCart(cartItem.item, 1, cartItem.notes)}
                   >
                     <Plus className="h-3 w-3" />
                   </Button>
                 </div>
               </div>
               {cartItem.notes && (
                 <p className="text-xs text-muted-foreground mt-1">Note: {cartItem.notes}</p>
               )}
             </div>
             <div className="text-right">
               <p className={`font-medium ${isFreeBogoItem ? 'text-green-600' : 'text-gray-900'}`}>
                 {isFreeBogoItem ? 'FREE' : `₹${(cartItem.item.price * cartItem.quantity).toFixed(2)}`}
               </p>
               {!isFreeBogoItem && (
                 <p className="text-xs text-muted-foreground">₹{cartItem.item.price} each</p>
               )}
             </div>
           </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    
                    {/* CGST and SGST for Food Court, Pizza Bakers, and Taste of India orders */}
                    {((cafe?.name?.toLowerCase().includes('food court') || 
                      cafe?.name === 'FOOD COURT' ||
                      cafe?.name?.toLowerCase() === 'food court') ||
                      cafe?.name?.toLowerCase().includes('pizza bakers') ||
                      cafe?.name?.toLowerCase().includes('crazy chef') ||
                      cafe?.name?.toLowerCase().includes('taste of india') ||
                      cafe?.name === 'TASTE OF INDIA') && (
                      <>
                        {cgst > 0 && (
                          <div className="flex justify-between items-center text-black">
                            <span>CGST @2.5%</span>
                            <span>+₹{cgst.toFixed(2)}</span>
                          </div>
                        )}
                        {sgst > 0 && (
                          <div className="flex justify-between items-center text-black">
                            <span>SGST @2.5%</span>
                            <span>+₹{sgst.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {deliveryDetails.orderType === 'delivery' && (
                      <div className="flex justify-between items-center text-black">
                        <span>Delivery Charge</span>
                        <span>+₹{ORDER_CONSTANTS.DELIVERY_CHARGE}</span>
                      </div>
                    )}
                    
                    {/* MUJ FOOD CLUB Discount */}
                    {isEligibleForDiscount && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-bold">
                          MUJ FOOD CLUB DISCOUNT ({cafe?.name?.toLowerCase().includes('food court') || cafe?.name === 'FOOD COURT' ? '5%' : 
                            cafe?.name === 'COOK HOUSE' ? (deliveryDetails.orderType === 'delivery' ? '10%' : '5%') : 
                            cafe?.name?.toLowerCase().includes('taste of india') ? '10%' : '10%'})
                        </span>
                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Referral Discount Display */}
                    {referralDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-bold">Referral Discount</span>
                        <span className="font-bold">-₹{referralDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Order Notice */}
                  {!isMinimumOrderMet && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Minimum order amount is ₹{ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT}
                      </AlertDescription>
                </Alert>
              )}

                  {/* Order Confirmation Notice */}
                  {deliveryDetails.orderType === 'delivery' && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                      <strong>Please double-check your order and address details.</strong>
                    </div>
                  )}
                  
                  {/* Takeaway Notice */}
                  {deliveryDetails.orderType === 'takeaway' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <strong>Takeaway:</strong> No delivery charge for takeaway orders
                    </div>
                  )}
                  
                  {/* Dine In Notice */}
                  {deliveryDetails.orderType === 'dine_in' && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                      <strong>Dine In:</strong> No delivery charge for dine-in orders
                    </div>
                  )}

                  {/* Place Order Button */}
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaceOrder();
                }}
                disabled={isLoading || !isMinimumOrderMet || 
                  (!isGroceryOrder() && !isGrabitOrder() && deliveryDetails.orderType === 'delivery' && !isDeliveryAllowed(cafe?.name)) ||
                  (!isGroceryOrder() && !isGrabitOrder() && (deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') && !isDineInTakeawayAllowed())
                }
                className="w-full"
                size="lg"
                variant="hero"
                type="button"
              >
                    {isLoading ? 'Placing Order...' :
                     !isMinimumOrderMet ? `Minimum Order ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT} Required` :
                     (!isGroceryOrder() && !isGrabitOrder() && deliveryDetails.orderType === 'delivery' && !isDeliveryAllowed(cafe?.name)) ? 'Delivery Unavailable' :
                     (!isGroceryOrder() && !isGrabitOrder() && (deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') && !isDineInTakeawayAllowed()) ? 'Dine-in/Takeaway Unavailable' :
                     `Place Order - ₹${finalAmount.toFixed(2)}`}
              </Button>

                  {/* Show all errors including accepting_orders errors */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
