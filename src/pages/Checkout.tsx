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
import { ArrowLeft, MapPin, Clock, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { ORDER_CONSTANTS } from '@/lib/constants';
import { whatsappService } from '@/services/whatsappService';
import { isDineInTakeawayAllowed, isDeliveryAllowed, getDineInTakeawayMessage } from '@/utils/timeRestrictions';
import Header from '@/components/Header';

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
  const { user, profile, refreshProfile, sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const { selectedBlock } = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Verification states
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  
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
    phoneNumber: profile?.phone || '',
    tableNumber: ''
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

    // Validate phone number
    if (!deliveryDetails.phoneNumber || deliveryDetails.phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!isMinimumOrderMet) {
      setError(`Minimum order amount is ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT}`);
      return;
    }

    // Check if phone number is verified
    if (verifiedPhoneNumber !== deliveryDetails.phoneNumber) {
      setError('Please verify your phone number with OTP before placing the order');
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

      // Create order (using the exact same pattern as the working CafeScanner)
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      const userSuffix = user.id.substr(-4).toUpperCase();
      const orderNumber = `ONLINE-${timestamp}-${random}-${userSuffix}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          cafe_id: cafe.id,
          order_number: orderNumber,
          total_amount: finalAmount,
          order_type: deliveryDetails.orderType,
          delivery_block: deliveryDetails.block,
          delivery_notes: deliveryDetails.deliveryNotes,
          payment_method: deliveryDetails.paymentMethod,
          phone_number: deliveryDetails.phoneNumber,
          customer_name: profile.full_name,
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

      // Send WhatsApp notification to cafe owner
      try {
        console.log('📱 Sending WhatsApp notification for order:', order?.order_number);
        
        const orderItems = Object.values(cart).map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          price: item.item.price,
          notes: item.notes
        }));

          const orderData = {
            id: order.id,
            order_number: order.order_number,
          customer_name: profile.full_name,
            phone_number: deliveryDetails.phoneNumber,
          delivery_block: deliveryDetails.block,
            total_amount: finalAmount,
            created_at: order.created_at,
            delivery_notes: deliveryDetails.deliveryNotes,
          order_items: orderItems.map(item => ({
            quantity: item.quantity,
            menu_item: {
              name: item.name,
              price: item.price
            },
            total_price: item.price * item.quantity
          }))
        };

        const whatsappSuccess = await whatsappService.sendOrderNotification(cafe.id, orderData);
        
        if (whatsappSuccess) {
          console.log('✅ WhatsApp notification sent successfully');
              } else {
          console.log('⚠️ WhatsApp notification failed, but order was placed');
        }
      } catch (whatsappError) {
        console.error('❌ WhatsApp notification error:', whatsappError);
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

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!deliveryDetails.phoneNumber || deliveryDetails.phoneNumber.length !== 10) {
      setOtpError('Please enter a valid 10-digit phone number first');
      return;
    }

    setIsOTPLoading(true);
    setOtpError('');

    try {
      const { error } = await sendPhoneOTP(deliveryDetails.phoneNumber);
      
      if (error) {
        setOtpError(error.message || 'Failed to send OTP');
      } else {
        setOtpSent(true);
        toast({
          title: "OTP Sent Successfully",
          description: `OTP sent to +91${deliveryDetails.phoneNumber}`,
        });
      }
    } catch (err) {
      setOtpError('Failed to send OTP');
    } finally {
      setIsOTPLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsOTPLoading(true);
    setOtpError('');

    try {
      const { error } = await verifyPhoneOTP(deliveryDetails.phoneNumber, otpCode);
      
      if (error) {
        setOtpError(error.message || 'Invalid OTP');
      } else {
        setVerifiedPhoneNumber(deliveryDetails.phoneNumber);
        setOtpCode('');
        setOtpSent(false);
        toast({
          title: "Phone Verified Successfully",
          description: "Your phone number has been verified!",
        });
      }
    } catch (err) {
      setOtpError('Failed to verify OTP');
    } finally {
      setIsOTPLoading(false);
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
    <div className="min-h-screen bg-background">
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
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value }))}
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
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value }))}
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
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value }))}
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

              {/* Delivery Details */}
                  {deliveryDetails.orderType === 'delivery' && (
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                        Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="block">Block</Label>
                        <Select 
                          value={deliveryDetails.block} 
                        onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, block: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your block" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="B1">B1</SelectItem>
                          <SelectItem value="B2">B2</SelectItem>
                          <SelectItem value="B3">B3</SelectItem>
                          <SelectItem value="B4">B4</SelectItem>
                          <SelectItem value="B5">B5</SelectItem>
                          <SelectItem value="B6">B6</SelectItem>
                          <SelectItem value="B7">B7</SelectItem>
                          <SelectItem value="B8">B8</SelectItem>
                          <SelectItem value="B9">B9</SelectItem>
                          <SelectItem value="B10">B10</SelectItem>
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
                          onChange={(e) => {
                            setDeliveryDetails(prev => ({ ...prev, phoneNumber: e.target.value }));
                            // Reset verified phone and OTP state if user changes the number
                            if (verifiedPhoneNumber && verifiedPhoneNumber !== e.target.value) {
                              setVerifiedPhoneNumber(null);
                              setOtpSent(false);
                              setOtpCode('');
                              setOtpError('');
                            }
                          }}
                          placeholder="Enter your phone number"
                          required
                          minLength={10}
                          maxLength={10}
                          className={verifiedPhoneNumber === deliveryDetails.phoneNumber ? "border-green-500 bg-green-50" : ""}
                          />
                        {verifiedPhoneNumber === deliveryDetails.phoneNumber && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                        )}
                      </div>
                      {deliveryDetails.phoneNumber && deliveryDetails.phoneNumber.length !== 10 && (
                        <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
                      )}
                      {verifiedPhoneNumber === deliveryDetails.phoneNumber && (
                        <p className="text-green-600 text-sm mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Phone number verified
                        </p>
                      )}
                      
                      {/* OTP Verification Section */}
                      {deliveryDetails.phoneNumber && deliveryDetails.phoneNumber.length === 10 && verifiedPhoneNumber !== deliveryDetails.phoneNumber && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Verify phone number for secure delivery
                            </span>
                            {!otpSent ? (
                              <Button
                                onClick={handleSendOTP}
                                disabled={isOTPLoading}
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                {isOTPLoading ? 'Sending...' : 'Get OTP'}
                              </Button>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">OTP Sent!</span>
                            )}
                          </div>
                          
                          {otpSent && (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="otpCode" className="text-sm">Enter 6-digit OTP sent to +91{deliveryDetails.phoneNumber}</Label>
                                <Input
                                  id="otpCode"
                                  type="text"
                                  inputMode="numeric"
                                  value={otpCode}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                    if (value.length <= 6) {
                                      setOtpCode(value);
                                      setOtpError(''); // Clear error when user starts typing
                                    }
                                  }}
                                  placeholder="000000"
                                  className="text-center text-lg tracking-widest mt-1"
                                  maxLength={6}
                                  disabled={isOTPLoading}
                                />
                              </div>
                              <Button
                                onClick={handleVerifyOTP}
                                disabled={isOTPLoading || otpCode.length !== 6}
                                size="sm"
                                className="w-full"
                                variant="hero"
                              >
                                {isOTPLoading ? 'Verifying...' : 'Verify OTP'}
                              </Button>
                            </div>
                          )}
                          
                          {otpError && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">{otpError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
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

              {/* Dine In Details */}
                  {deliveryDetails.orderType === 'dine_in' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Dine In Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="tableNumber">Table Number</Label>
                      <Input
                        id="tableNumber"
                        value={deliveryDetails.tableNumber}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, tableNumber: e.target.value }))}
                        placeholder="Enter table number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="relative">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={deliveryDetails.phoneNumber}
                          onChange={(e) => {
                            setDeliveryDetails(prev => ({ ...prev, phoneNumber: e.target.value }));
                            // Reset verified phone and OTP state if user changes the number
                            if (verifiedPhoneNumber && verifiedPhoneNumber !== e.target.value) {
                              setVerifiedPhoneNumber(null);
                              setOtpSent(false);
                              setOtpCode('');
                              setOtpError('');
                            }
                          }}
                          placeholder="Enter your phone number"
                          className={verifiedPhoneNumber === deliveryDetails.phoneNumber ? "border-green-500 bg-green-50" : ""}
                        />
                        {verifiedPhoneNumber === deliveryDetails.phoneNumber && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {verifiedPhoneNumber === deliveryDetails.phoneNumber && (
                        <p className="text-green-600 text-sm mt-1 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Phone number verified
                        </p>
                      )}
                      
                      {/* OTP Verification Section for Dine-in */}
                      {deliveryDetails.phoneNumber && deliveryDetails.phoneNumber.length === 10 && verifiedPhoneNumber !== deliveryDetails.phoneNumber && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              Verify phone number for secure service
                            </span>
                            {!otpSent ? (
                              <Button
                                onClick={handleSendOTP}
                                disabled={isOTPLoading}
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                {isOTPLoading ? 'Sending...' : 'Get OTP'}
                              </Button>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">OTP Sent!</span>
                            )}
                          </div>
                          
                          {otpSent && (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="otpCode" className="text-sm">Enter 6-digit OTP sent to +91{deliveryDetails.phoneNumber}</Label>
                                <Input
                                  id="otpCode"
                                  type="text"
                                  inputMode="numeric"
                                  value={otpCode}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                    if (value.length <= 6) {
                                      setOtpCode(value);
                                      setOtpError(''); // Clear error when user starts typing
                                    }
                                  }}
                                  placeholder="000000"
                                  className="text-center text-lg tracking-widest mt-1"
                                  maxLength={6}
                                  disabled={isOTPLoading}
                                />
                              </div>
                              <Button
                                onClick={handleVerifyOTP}
                                disabled={isOTPLoading || otpCode.length !== 6}
                                size="sm"
                                className="w-full"
                                variant="hero"
                              >
                                {isOTPLoading ? 'Verifying...' : 'Verify OTP'}
                              </Button>
                            </div>
                          )}
                          
                          {otpError && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">{otpError}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
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
