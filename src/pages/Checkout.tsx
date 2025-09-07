import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Clock, Banknote, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CAFE_REWARDS, calculatePointsEarned, calculateMaxRedeemablePoints, getTierDiscount } from '@/lib/constants';
import { useCafeRewards } from '@/hooks/useCafeRewards';
import { whatsappService } from '@/services/whatsappService';
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
  const location = useLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { getCafeRewardData } = useCafeRewards();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get cart data from navigation state
  const cart: {[key: string]: CartItem} = location.state?.cart || {};
  const cafe: Cafe = location.state?.cafe;
  const totalAmount: number = location.state?.totalAmount || 0;
  
  // Get cafe-specific points for redemption
  const cafeRewardData = cafe ? getCafeRewardData(cafe.id) : null;
  const availablePoints = cafeRewardData?.points || 0;

  // Form states
  const [deliveryDetails, setDeliveryDetails] = useState({
    orderType: 'delivery', // 'delivery' or 'takeaway'
    block: profile?.block || 'B1',
    deliveryNotes: '',
    paymentMethod: 'cod',
    phoneNumber: profile?.phone || ''
  });

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [pointsToEarn, setPointsToEarn] = useState(0);
  const [customPointsInput, setCustomPointsInput] = useState('');
  
  // Tax and delivery charges
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Redirect if no cart data
  useEffect(() => {
    console.log('🛒 Checkout cart data:', cart);
    console.log('🏪 Cafe data:', cafe);
    console.log('💰 Total amount:', totalAmount);
    
    if (!cart || Object.keys(cart).length === 0) {
      console.error('❌ No cart data found - redirecting to home');
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    if (!cafe) {
      console.error('❌ No cafe data found - redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('✅ Cart validation passed - proceeding with checkout');
  }, [cart, cafe, totalAmount, navigate, toast]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is verified
    if (!user.email_confirmed_at) {
      setError('Please verify your email address before placing an order. Check your email for the verification link.');
      toast({
        title: "Email Not Verified",
        description: "Please check your email and click the verification link before placing an order.",
        variant: "destructive"
      });
      return;
    }
  }, [user, navigate, profile, toast]);

  const blocks = [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'
  ];

  const calculatePoints = async (amount: number) => {
    if (!user || !profile) return 0;
    
    try {
      // Use the enhanced point calculation function
      const { data, error } = await (supabase.rpc as any)('calculate_enhanced_points', {
        order_amount: amount,
        user_id: user.id,
      });

      if (error) {
        console.error('Error calculating enhanced points:', error);
        // Fallback to basic calculation
        return Math.floor(amount / 10);
      }

      return data || 0;
    } catch (error) {
      console.error('Error calculating enhanced points:', error);
      // Fallback to basic calculation
      return Math.floor(amount / 10);
    }
  };

  // Calculate points to earn (cafe-specific first order check)
  const calculatePointsToEarn = async (amount: number, cafeId: string) => {
    if (!user) return 0;
    
    // Check if this is the user's first order from this specific cafe
    const { data: existingOrders, error } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('cafe_id', cafeId)
      .eq('status', 'completed')
      .limit(1);
    
    if (error) {
      console.error('Error checking existing orders:', error);
      return Math.floor(amount * CAFE_REWARDS.POINTS_RATE); // Fallback to base points only
    }
    
    const isFirstOrderFromCafe = !existingOrders || existingOrders.length === 0;
    return calculatePointsEarned(amount, isFirstOrderFromCafe && amount >= CAFE_REWARDS.FIRST_ORDER_MIN_AMOUNT);
  };

  const calculatePointsDiscount = (points: number) => {
    // 1 point = ₹1 discount (1:1 ratio)
    const discount = points * CAFE_REWARDS.POINT_VALUE;
    // Limit to 10% of order value for points redemption
    const maxPointsDiscount = calculateMaxRedeemablePoints(totalAmount);
    return Math.min(discount, maxPointsDiscount);
  };

  const calculateMaxRedeemablePointsForOrder = () => {
    // Maximum points that can be redeemed (10% of order value)
    return calculateMaxRedeemablePoints(totalAmount);
  };

  const handlePointsRedeem = (points: number) => {
    const maxRedeemable = calculateMaxRedeemablePointsForOrder();
    const actualPointsToRedeem = Math.min(points, maxRedeemable);
    const discount = calculatePointsDiscount(actualPointsToRedeem);
    setPointsToRedeem(actualPointsToRedeem);
    setPointsDiscount(discount);
    setFinalAmount(Math.max(0, totalAmount - loyaltyDiscount - discount));
  };

  const handleCustomPointsRedeem = () => {
    const customPoints = parseInt(customPointsInput);
    const maxRedeemable = calculateMaxRedeemablePointsForOrder();
    const maxAllowed = Math.min(availablePoints, maxRedeemable);
    
    if (customPoints && customPoints > 0 && customPoints <= maxAllowed) {
      handlePointsRedeem(customPoints);
      setCustomPointsInput('');
    } else if (customPoints > maxRedeemable) {
      toast({
        title: "Points Limit Exceeded",
        description: `You can only redeem up to ${maxRedeemable} points (10% of order value)`,
        variant: "destructive"
      });
    }
  };

  // Calculate taxes and delivery fees for Food Court
  useEffect(() => {
    if (cafe && cafe.name === 'FOOD COURT') {
      // Calculate CGST and SGST (2.5% each on subtotal)
      const subtotal = totalAmount - loyaltyDiscount - pointsDiscount;
      const cgstAmount = Math.round((subtotal * 2.5) / 100);
      const sgstAmount = Math.round((subtotal * 2.5) / 100);
      const deliveryFeeAmount = 10; // ₹10 delivery fee
      
      setCgst(cgstAmount);
      setSgst(sgstAmount);
      setDeliveryFee(deliveryFeeAmount);
    } else {
      setCgst(0);
      setSgst(0);
      setDeliveryFee(0);
    }
  }, [totalAmount, loyaltyDiscount, pointsDiscount, cafe]);

  // Calculate tier discount and final amount (cafe-specific)
  useEffect(() => {
    // Use cafe-specific tier, default to Foodie if no data
    const tier = cafeRewardData?.tier || 'foodie';
    const tierDiscount = Math.floor((totalAmount * CAFE_REWARDS.TIER_DISCOUNTS[tier.toUpperCase() as keyof typeof CAFE_REWARDS.TIER_DISCOUNTS]) / 100);
    setLoyaltyDiscount(tierDiscount);
    
    // Calculate final amount including taxes and delivery fees
    const subtotal = totalAmount - tierDiscount - pointsDiscount;
    const finalAmountWithTaxes = subtotal + cgst + sgst + deliveryFee;
    setFinalAmount(Math.max(0, finalAmountWithTaxes));
  }, [totalAmount, pointsDiscount, cgst, sgst, deliveryFee]);

  // Calculate points to earn when component loads or total amount changes
  useEffect(() => {
    if (totalAmount > 0 && cafe) {
      // Points are calculated on the original order amount (before taxes and delivery fees)
      calculatePointsToEarn(totalAmount, cafe.id).then(points => {
        setPointsToEarn(points);
      });
    }
  }, [totalAmount, cafe]);

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to place an order",
        variant: "destructive"
      });
      return;
    }

    // Check if cafe is accepting orders
    if (!cafe.accepting_orders) {
      toast({
        title: "Cafe Not Available",
        description: `${cafe.name} is currently not accepting orders. Please try again later.`,
        variant: "destructive"
      });
      return;
    }

    // Validate phone number
    if (!deliveryDetails.phoneNumber || deliveryDetails.phoneNumber.trim() === '') {
      setError('Phone number is required');
      toast({
        title: "Missing Information",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(deliveryDetails.phoneNumber.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number (10-15 digits)');
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate unique order number with better uniqueness
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      const userSuffix = user.id.substr(-4).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${random}-${userSuffix}`;
      
      // Use the pre-calculated points (based on original total amount, not final amount after discount)
      // This ensures users get points based on what they spent, not what they paid after discounts

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          cafe_id: cafe.id,
          order_number: orderNumber,
          total_amount: finalAmount,
          delivery_block: deliveryDetails.orderType === 'delivery' ? deliveryDetails.block : 'TAKEAWAY',
          delivery_notes: deliveryDetails.deliveryNotes,
          payment_method: deliveryDetails.paymentMethod,
          points_earned: pointsToEarn,
          estimated_delivery: new Date(Date.now() + (deliveryDetails.orderType === 'delivery' ? 30 : 15) * 60 * 1000).toISOString(), // 30 min delivery, 15 min takeaway
          phone_number: deliveryDetails.phoneNumber
        } as any)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        console.error('Order creation error details:', {
          code: orderError.code,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint
        });
        throw orderError;
      }

      // Handle enhanced rewards system (only if database functions exist)
      try {
        // Check if enhanced rewards functions exist before calling them
        const { data: functionCheck } = await (supabase.rpc as any)('calculate_enhanced_points', {
          order_amount: totalAmount,
          user_id: user.id,
        });

        if (functionCheck !== undefined) {
          // Enhanced rewards system is available
          
          // Track maintenance spending for tier maintenance
          await (supabase.rpc as any)('track_monthly_spending', {
            user_id: user.id,
            order_amount: totalAmount
          });

          // Check tier maintenance (only based on spending, not points redemption)
          await (supabase.rpc as any)('check_tier_maintenance_only', {
            user_id: user.id
          });

          // Enhanced rewards system is available
          console.log('✅ Enhanced rewards system active');
        }
      } catch (error) {
        console.error('Enhanced rewards system not available or error occurred:', error);
        // Don't fail the order for rewards errors
      }

      // Create order items
      console.log('🛒 Cart data for order items:', cart);
      console.log('📦 Order items to create:', Object.values(cart));
      
      if (Object.keys(cart).length === 0) {
        console.error('❌ Cart is empty - no items to save');
        throw new Error('Cart is empty - cannot create order without items');
      }
      
      const orderItems = Object.values(cart).map(({item, quantity, notes}) => ({
        order_id: order!.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity,
        special_instructions: notes
      }));
      
      console.log('📝 Final order items array:', orderItems);

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems as any)
        .select();

      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError);
        console.error('Error details:', {
          code: itemsError.code,
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint
        });
        throw itemsError;
      }
      
      console.log('✅ Order items created successfully:', insertedItems);

      // Handle points redemption transaction if points were redeemed
      if (pointsToRedeem > 0) {
        
        const { error: redemptionError } = await supabase
          .from('loyalty_transactions')
          .insert({
            user_id: user.id,
            order_id: order!.id,
            points_change: -pointsToRedeem,
            transaction_type: 'redeemed',
            description: `Redeemed ${pointsToRedeem} points for order ${orderNumber}`
          } as any);

        if (redemptionError) {
          console.error('Points redemption error:', redemptionError);
          throw redemptionError;
        }

        // Note: Points redemption will be handled by the cafe-specific system
        // The old unified points system is deprecated
        console.log('Points redemption:', pointsToRedeem, 'points for cafe:', cafe.id);
      } else {
        // No points redeemed, just log the order placement
        console.log('Order placed without points redemption');
      }

      // Create loyalty transaction to earn points for the order
      if (pointsToEarn > 0) {
        // Points will be earned when order is completed, not immediately
        // Store the points to earn in the order for later processing
        console.log(`Order placed with ${pointsToEarn} points to earn upon completion`);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order!.order_number} has been confirmed. Estimated delivery: 30 minutes.`,
      });

      // Send WhatsApp notification to cafe owner
      try {
        console.log('📱 Sending WhatsApp notification for order:', order?.order_number);
        
        // Get order items for the notification
        const orderItems = Object.values(cart).map(cartItem => ({
          quantity: cartItem.quantity,
          menu_item: {
            name: cartItem.item.name,
            price: cartItem.item.price
          },
          total_price: cartItem.item.price * cartItem.quantity
        }));

        if (order && cafe) {
          const orderData = {
            id: order.id,
            order_number: order.order_number,
            customer_name: profile?.full_name || 'Customer',
            phone_number: deliveryDetails.phoneNumber,
            delivery_block: deliveryDetails.orderType === 'delivery' ? deliveryDetails.block : 'TAKEAWAY',
            total_amount: finalAmount,
            created_at: order.created_at,
            delivery_notes: deliveryDetails.deliveryNotes,
            order_items: orderItems
          };

          // Send WhatsApp notification (non-blocking)
          whatsappService.sendOrderNotification(cafe.id, orderData)
            .then(success => {
              if (success) {
                console.log('✅ WhatsApp notification sent successfully');
              } else {
                console.log('❌ WhatsApp notification failed');
              }
            })
            .catch(error => {
              console.error('❌ WhatsApp notification error:', error);
            });
        }
          
      } catch (error) {
        console.error('❌ Error preparing WhatsApp notification:', error);
        // Don't fail the order for notification errors
      }

      // Refresh profile to update loyalty points
      await refreshProfile();

      // Navigate to order confirmation with the ACTUAL order number from database
      if (order) {
        navigate(`/order-confirmation/${order.order_number}`, { 
          state: { 
            order,
            pointsEarned: pointsToEarn
          } 
        });
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setError(`Failed to place order: ${error.message || 'Unknown error'}`);
      toast({
        title: "Order Failed",
        description: `There was an error placing your order: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || Object.keys(cart).length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Cafe Info */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{cafe.name}</h3>
                    <p className="text-muted-foreground mb-2">
                      {cafe.name === 'FOOD COURT' 
                        ? 'Quick bites, wholesome bowls, and sweet treats—all in one place.'
                        : cafe.description
                      }
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {cafe.location}
                    </div>
                    {cafe.name === 'FOOD COURT' && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <strong>Note:</strong> CGST @ 2.5%, SGST @ 2.5%, and ₹10 delivery fee will be added to your order.
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    {Object.values(cart).map(({item, quantity, notes}) => (
                      <div key={item.id} className="flex justify-between items-start border-b border-border pb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-semibold">₹{item.price * quantity}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price} × {quantity}
                          </p>
                          {notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Note: {notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Points Redemption */}
                  {availablePoints > 0 && (
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                          Redeem Loyalty Points
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          You have {availablePoints} points available at {cafe?.name}
                          <br />
                          <span className="text-blue-600 font-medium">
                            Max redeemable: {calculateMaxRedeemablePointsForOrder()} points (10% of order)
                          </span>
                        </p>
                        
                        <div className="space-y-2">
                          {/* Quick Redeem Button */}
                          {calculateMaxRedeemablePointsForOrder() > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePointsRedeem(calculateMaxRedeemablePointsForOrder())}
                              className="w-full"
                            >
                              Redeem Max ({calculateMaxRedeemablePointsForOrder()} points)
                            </Button>
                          )}
                          
                          {/* Custom Points Input */}
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              placeholder="Custom points"
                              value={customPointsInput}
                              onChange={(e) => setCustomPointsInput(e.target.value)}
                              min="1"
                              max={Math.min(availablePoints, calculateMaxRedeemablePointsForOrder())}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCustomPointsRedeem}
                              disabled={!customPointsInput || parseInt(customPointsInput) <= 0 || parseInt(customPointsInput) > Math.min(availablePoints, calculateMaxRedeemablePointsForOrder())}
                            >
                              Redeem
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground text-center">
                            1 point = ₹1 discount • Max 10% of order total
                          </p>
                        </div>
                        
                        {pointsToRedeem > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPointsToRedeem(0);
                              setPointsDiscount(0);
                            }}
                            className="w-full mt-2 text-red-600 hover:text-red-700"
                          >
                            Remove points redemption
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Points Message */}
                  {availablePoints === 0 && (
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          You don't have any loyalty points yet. 
                          <br />
                          Complete this order to start earning points!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                      </div>
                      {loyaltyDiscount > 0 && (
                        <div className="flex justify-between items-center text-blue-600">
                          <span>Loyalty Discount ({cafeRewardData?.tier || 'foodie'})</span>
                          <span>-₹{loyaltyDiscount}</span>
                        </div>
                      )}
                      {pointsDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Points Discount</span>
                          <span>-₹{pointsDiscount}</span>
                        </div>
                      )}
                      
                      {/* Tax and Delivery Charges for Food Court */}
                      {cafe && cafe.name === 'FOOD COURT' && (
                        <>
                          {cgst > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span>CGST @ 2.5%</span>
                              <span>₹{cgst}</span>
                            </div>
                          )}
                          {sgst > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span>SGST @ 2.5%</span>
                              <span>₹{sgst}</span>
                            </div>
                          )}
                          {deliveryFee > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span>Delivery Fee</span>
                              <span>₹{deliveryFee}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-2">
                        <span>Final Amount</span>
                        <span className="text-primary">₹{finalAmount}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                      <span>Points to Earn</span>
                      <span className="text-green-600">+{pointsToEarn} pts</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Points will be awarded when your order is completed
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Tier:</span> {cafeRewardData?.tier || 'foodie'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery & Payment */}
            <div className="space-y-6">
              <Card className="food-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {deliveryDetails.orderType === 'delivery' ? (
                      <>
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Delivery Details
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-green-600" />
                        Takeaway Details
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select 
                      value={deliveryDetails.orderType} 
                      onValueChange={(value) => setDeliveryDetails(prev => ({...prev, orderType: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delivery">🚚 Delivery</SelectItem>
                        <SelectItem value="takeaway">📦 Takeaway</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Order Type Badge */}
                    <div className="flex justify-center mt-2">
                      <Badge 
                        variant={deliveryDetails.orderType === 'delivery' ? 'default' : 'secondary'}
                        className={`px-4 py-2 text-sm font-medium ${
                          deliveryDetails.orderType === 'delivery' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}
                      >
                        {deliveryDetails.orderType === 'delivery' ? (
                          <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Delivery to Block {deliveryDetails.block}
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Takeaway from Cafe
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {deliveryDetails.orderType === 'delivery' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="block">Delivery Block</Label>
                        <Select 
                          value={deliveryDetails.block} 
                          onValueChange={(value) => setDeliveryDetails(prev => ({...prev, block: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your block" />
                          </SelectTrigger>
                          <SelectContent>
                            {blocks.map((block) => (
                              <SelectItem key={block} value={block}>
                                Block {block}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="deliveryNotes"
                          placeholder="Any special delivery instructions..."
                          value={deliveryDetails.deliveryNotes}
                          onChange={(e) => setDeliveryDetails(prev => ({...prev, deliveryNotes: e.target.value}))}
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {deliveryDetails.orderType === 'takeaway' && (
                    <div className="space-y-2">
                      <Label htmlFor="takeawayNotes">Takeaway Notes (Optional)</Label>
                      <Textarea
                        id="takeawayNotes"
                        placeholder="Any special takeaway instructions..."
                        value={deliveryDetails.deliveryNotes}
                        onChange={(e) => setDeliveryDetails(prev => ({...prev, deliveryNotes: e.target.value}))}
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center">
                      Phone Number
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number (required)"
                      value={deliveryDetails.phoneNumber}
                      onChange={(e) => setDeliveryDetails(prev => ({...prev, phoneNumber: e.target.value}))}
                      required
                      className={!deliveryDetails.phoneNumber || deliveryDetails.phoneNumber.trim() === '' ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      Required for delivery coordination
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="food-card">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg bg-muted/30">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={true}
                        disabled={true}
                        className="text-primary"
                      />
                      <Banknote className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Currently accepting Cash on Delivery only
                  </p>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full"
                size="lg"
                variant="hero"
              >
                {isLoading ? 'Placing Order...' : `Place Order - ₹${finalAmount}`}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                {deliveryDetails.orderType === 'delivery' 
                  ? 'Estimated delivery time: 30-45 minutes'
                  : 'Estimated pickup time: 15-20 minutes'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
