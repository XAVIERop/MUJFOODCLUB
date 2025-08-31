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
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get cart data from navigation state
  const cart: {[key: string]: CartItem} = location.state?.cart || {};
  const cafe: Cafe = location.state?.cafe;
  const totalAmount: number = location.state?.totalAmount || 0;

  // Form states
  const [deliveryDetails, setDeliveryDetails] = useState({
    block: profile?.block || 'B1',
    deliveryNotes: '',
    paymentMethod: 'cod',
    phoneNumber: profile?.phone || ''
  });

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [pointsToEarn, setPointsToEarn] = useState(0);
  const [customPointsInput, setCustomPointsInput] = useState('');

  // Redirect if no cart data
  useEffect(() => {
    if (!cart || Object.keys(cart).length === 0) {
      navigate('/');
      return;
    }
  }, [cart, navigate]);

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
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'
  ];

  const calculatePoints = async (amount: number) => {
    if (!user || !profile) return 0;
    
    try {
      // Use the enhanced point calculation function
      const { data, error } = await (supabase.rpc as any)('calculate_enhanced_points', {
        order_amount: amount,
        user_id: user.id,
        is_new_user: profile.is_new_user || false,
        new_user_orders_count: profile.new_user_orders_count || 0
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

  // Enhanced points calculation with fallback
  const calculateEnhancedPoints = (amount: number) => {
    if (!profile) return Math.floor(amount / 10);
    
    let basePoints = Math.floor(amount / 10); // 10 points per ₹100
    
    // Apply tier multiplier
    let tierMultiplier = 1.0;
    if (profile.loyalty_tier === 'connoisseur') {
      tierMultiplier = 1.5;
    } else if (profile.loyalty_tier === 'gourmet') {
      tierMultiplier = 1.2;
    }
    
    // Apply new user bonus
    let newUserMultiplier = 1.0;
    if (profile.is_new_user && profile.new_user_orders_count && profile.new_user_orders_count <= 20) {
      if (profile.new_user_orders_count === 1) {
        newUserMultiplier = 1.5; // 50% bonus for first order
      } else {
        newUserMultiplier = 1.25; // 25% bonus for orders 2-20
      }
    }
    
    const finalPoints = Math.floor(basePoints * tierMultiplier * newUserMultiplier);
    
    return finalPoints;
  };

  const calculatePointsDiscount = (points: number) => {
    // 1 point = ₹0.25 discount (4:1 ratio)
    const discount = points * 0.25;
    return Math.min(discount, Math.floor(totalAmount * 0.5)); // Max 50% discount
  };

  const handlePointsRedeem = (points: number) => {
    const discount = calculatePointsDiscount(points);
    setPointsToRedeem(points);
    setPointsDiscount(discount);
    setFinalAmount(Math.max(0, totalAmount - discount));
  };

  const handleCustomPointsRedeem = () => {
    const customPoints = parseInt(customPointsInput);
    if (customPoints && customPoints > 0 && customPoints <= profile.loyalty_points) {
      handlePointsRedeem(customPoints);
      setCustomPointsInput('');
    }
  };

  // Update final amount when total amount changes
  useEffect(() => {
    setFinalAmount(Math.max(0, totalAmount - pointsDiscount));
  }, [totalAmount, pointsDiscount]);

  // Calculate points to earn when component loads or total amount changes
  useEffect(() => {
    const calculateInitialPoints = async () => {
      if (user && profile && totalAmount > 0) {
        const points = await calculateEnhancedPoints(totalAmount);
        setPointsToEarn(points);
      }
    };
    
    calculateInitialPoints();
  }, [user, profile, totalAmount]);

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to place an order",
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
          delivery_block: deliveryDetails.block,
          delivery_notes: deliveryDetails.deliveryNotes,
          payment_method: deliveryDetails.paymentMethod,
          points_earned: pointsToEarn,
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          phone_number: deliveryDetails.phoneNumber
        })
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
          is_new_user: profile.is_new_user || false,
          new_user_orders_count: profile.new_user_orders_count || 0
        });

        if (functionCheck !== undefined) {
          // Enhanced rewards system is available
          
          // Track maintenance spending for tier maintenance
          await (supabase.rpc as any)('track_maintenance_spending', {
            user_id: user.id,
            order_amount: totalAmount
          });

          // Handle new user first order bonus
          if (profile.is_new_user && (!profile.new_user_orders_count || profile.new_user_orders_count === 0)) {
            await (supabase.rpc as any)('handle_new_user_first_order', {
              user_id: user.id
            });
          }

          // Update user's new user orders count
          if (profile.is_new_user && profile.new_user_orders_count !== null) {
            const newCount = Math.min(profile.new_user_orders_count + 1, 20);
            await supabase
              .from('profiles')
              .update({ 
                new_user_orders_count: newCount,
                is_new_user: newCount < 20
              })
              .eq('id', user.id);
          }
        }
      } catch (error) {
        console.error('Enhanced rewards system not available or error occurred:', error);
        // Don't fail the order for rewards errors
      }

      // Create order items
      const orderItems = Object.values(cart).map(({item, quantity, notes}) => ({
        order_id: order!.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity,
        special_instructions: notes
      }));

      const { error: itemsError } = await (supabase
        .from('order_items')
        .insert(orderItems) as any);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      // Handle points redemption transaction if points were redeemed
      if (pointsToRedeem > 0) {
        
        const { error: redemptionError } = await (supabase
          .from('loyalty_transactions')
          .insert({
            user_id: user.id,
            order_id: order!.id,
            points_change: -pointsToRedeem,
            transaction_type: 'redeemed',
            description: `Redeemed ${pointsToRedeem} points for order ${orderNumber}`
          }) as any);

        if (redemptionError) {
          console.error('Points redemption error:', redemptionError);
          throw redemptionError;
        }

        // Update user profile to deduct redeemed points immediately
        const newTotalPoints = (profile.loyalty_points || 0) - pointsToRedeem;
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            loyalty_points: newTotalPoints
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
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

      // Refresh profile to update loyalty points
      await refreshProfile();

      // Navigate to order confirmation with the ACTUAL order number from database
      navigate(`/order-confirmation/${order!.order_number}`, { 
        state: { 
          order,
          pointsEarned: pointsToEarn
        } 
      });

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
                    <p className="text-muted-foreground mb-2">{cafe.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      {cafe.location}
                    </div>
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
                  {profile && profile.loyalty_points > 0 && (
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                          Redeem Loyalty Points
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          You have {profile.loyalty_points} points available
                        </p>
                        
                        <div className="space-y-2">
                          {/* Custom Points Input */}
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              placeholder="Custom points"
                              value={customPointsInput}
                              onChange={(e) => setCustomPointsInput(e.target.value)}
                              min="1"
                              max={profile.loyalty_points}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCustomPointsRedeem}
                              disabled={!customPointsInput || parseInt(customPointsInput) <= 0 || parseInt(customPointsInput) > profile.loyalty_points}
                            >
                              Redeem
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground text-center">
                            1 point = ₹0.25 discount • Max 50% of order total
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
                  {profile && profile.loyalty_points === 0 && (
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
                      {pointsDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Loyalty Points Discount</span>
                          <span>-₹{pointsDiscount}</span>
                        </div>
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
                    {profile && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Tier:</span> {profile.loyalty_tier} 
                        {profile.is_new_user && profile.new_user_orders_count && profile.new_user_orders_count <= 20 && (
                          <span className="ml-2 text-yellow-600">
                            • {profile.new_user_orders_count === 1 ? '50%' : '25%'} bonus active
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delivery & Payment */}
            <div className="space-y-6">
              <Card className="food-card">
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                Estimated delivery time: 30-45 minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
