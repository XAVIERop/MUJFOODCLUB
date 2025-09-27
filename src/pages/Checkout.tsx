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
import { ArrowLeft, MapPin, Clock, Banknote, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { ORDER_CONSTANTS } from '@/lib/constants';
import { isDineInTakeawayAllowed, isDeliveryAllowed, getDineInTakeawayMessage } from '@/utils/timeRestrictions';
import { generateDailyOrderNumber } from '@/utils/orderNumberGenerator';
import { getCafeTableOptions } from '@/utils/tableMapping';
import { WhatsAppService } from '@/services/whatsappService';
import Header from '@/components/Header';

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
  const { selectedBlock } = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  
  // Get cart data from navigation state
  const cart: {[key: string]: CartItem} = location.state?.cart || {};
  const cafe: Cafe = location.state?.cafe;
  const totalAmount: number = location.state?.totalAmount || 0;

  // Form states
  const [deliveryDetails, setDeliveryDetails] = useState({
    orderType: 'delivery', // 'delivery', 'takeaway', or 'dine_in'
    block: selectedBlock,
    deliveryNotes: '',
    paymentMethod: 'cod',
    phoneNumber: profile?.phone || ''
  });

  // Calculate final amount
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  
  // Tax and delivery charges
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

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
  }, [cart, cafe, navigate]);

  // Calculate delivery charges (no taxes for Chatkara)
  useEffect(() => {
    const subtotal = totalAmount;
    const deliveryCharge = deliveryDetails.orderType === 'delivery' ? ORDER_CONSTANTS.DELIVERY_CHARGE : 0;
    // No CGST/SGST for Chatkara orders
    const finalAmountWithDelivery = subtotal + deliveryCharge;
    
      setCgst(0);
      setSgst(0);
    setDeliveryFee(deliveryCharge);
    setFinalAmount(Math.max(0, finalAmountWithDelivery));
  }, [totalAmount, deliveryDetails.orderType]);

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      setError('Please sign in to place an order');
      return;
    }

    // TEMPORARY RESTRICTION: Only Cook House accepting orders
    if (cafe.name !== 'COOK HOUSE') {
      setError('This cafe is temporarily not accepting orders. They will resume service in the next 2 days.');
      return;
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

    try {
      console.log('🛒 Starting order creation...');
      console.log('🛒 Order data:', {
        user_id: user.id,
        cafe_id: cafe.id,
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
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
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
        console.error('Order creation error:', orderError);
        console.error('Order error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw orderError;
      }

      // Create order items (using the exact same pattern as the working CafeScanner)
      const orderItems = Object.values(cart).map((cartItem) => ({
        order_id: order.id,
        menu_item_id: cartItem.item.id,
        quantity: cartItem.quantity,
        unit_price: cartItem.item.price,
        total_price: cartItem.item.price * cartItem.quantity,
        special_instructions: cartItem.notes
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
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

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
          
      } catch (error) {
      console.error('Order placement error:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order');
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
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
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
                          disabled={!isDeliveryAllowed()}
                        />
                        <Label htmlFor="delivery" className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Delivery
                          {!isDeliveryAllowed() && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                  </div>

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
                        </div>
                    
                    {!isDeliveryAllowed() && !isDineInTakeawayAllowed() && (
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
                    {Object.values(cart).map((cartItem) => (
                      <div key={cartItem.item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{cartItem.item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {cartItem.quantity}</p>
                          {cartItem.notes && (
                            <p className="text-xs text-muted-foreground">Note: {cartItem.notes}</p>
                          )}
                        </div>
                        <p className="font-medium">₹{cartItem.item.price * cartItem.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    
                    {deliveryDetails.orderType === 'delivery' && (
                      <div className="flex justify-between items-center text-orange-600">
                        <span>Delivery Charge</span>
                        <span>+₹{ORDER_CONSTANTS.DELIVERY_CHARGE}</span>
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

                  {/* Delivery Charge Notice */}
                  {deliveryDetails.orderType === 'delivery' && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                      <strong>Delivery:</strong> ₹{ORDER_CONSTANTS.DELIVERY_CHARGE} delivery charge added to all orders
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
                onClick={handlePlaceOrder}
                    disabled={isLoading || !isMinimumOrderMet}
                className="w-full"
                size="lg"
                variant="hero"
              >
                    {isLoading ? 'Placing Order...' :
                     !isMinimumOrderMet ? `Minimum Order ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT} Required` :
                     `Place Order - ₹${finalAmount.toFixed(2)}`}
              </Button>

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
