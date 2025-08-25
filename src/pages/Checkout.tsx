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
import { ArrowLeft, MapPin, Clock, CreditCard, Banknote, AlertCircle, CheckCircle, Trophy } from 'lucide-react';
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
    paymentMethod: 'cod'
  });

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);

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
    console.log('User verification status:', {
      user: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      profile: profile
    });
    
    if (!user.email_confirmed_at) {
      setError('Please verify your email address before placing an order. Check your email for the verification link.');
      toast({
        title: "Email Not Verified",
        description: "Please verify your email address before placing an order.",
        variant: "destructive"
      });
    }
  }, [user, navigate, profile, toast]);

  const blocks = [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'
  ];

  const calculatePoints = (amount: number) => {
    // Earn 1 point per ₹10 spent
    return Math.floor(amount / 10);
  };

  const calculatePointsDiscount = (points: number) => {
    // 1 point = ₹1 discount (1:1 ratio)
    return Math.min(points, Math.floor(totalAmount * 0.5)); // Max 50% discount
  };

  const handlePointsRedeem = (points: number) => {
    const discount = calculatePointsDiscount(points);
    setPointsToRedeem(points);
    setPointsDiscount(discount);
    setFinalAmount(Math.max(0, totalAmount - discount));
  };

  // Update final amount when total amount changes
  useEffect(() => {
    setFinalAmount(Math.max(0, totalAmount - pointsDiscount));
  }, [totalAmount, pointsDiscount]);

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to place an order",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting order placement...', { user: user.id, profile, cafe, totalAmount });
      
      // Generate unique order number with better uniqueness
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      const userSuffix = user.id.substr(-4).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${random}-${userSuffix}`;
      
      // Calculate points to earn (based on final amount after discount)
      const pointsToEarn = calculatePoints(finalAmount);

      console.log('Creating order with data:', {
        user_id: user.id,
        cafe_id: cafe.id,
        order_number: orderNumber,
        total_amount: totalAmount,
        delivery_block: deliveryDetails.block,
        delivery_notes: deliveryDetails.deliveryNotes,
        payment_method: deliveryDetails.paymentMethod,
        points_earned: pointsToEarn
      });

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
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order);

      // Create order items
      const orderItems = Object.values(cart).map(({item, quantity, notes}) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity,
        special_instructions: notes
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // Handle points redemption transaction if points were redeemed
      if (pointsToRedeem > 0) {
        console.log('Adding points redemption transaction:', pointsToRedeem);
        
        const { error: redemptionError } = await supabase
          .from('loyalty_transactions')
          .insert({
            user_id: user.id,
            order_id: order.id,
            points_change: -pointsToRedeem,
            transaction_type: 'redeemed',
            description: `Redeemed ${pointsToRedeem} points for order ${orderNumber}`
          });

        if (redemptionError) {
          console.error('Points redemption error:', redemptionError);
          throw redemptionError;
        }

        // Update user profile to deduct redeemed points immediately
        const newTotalPoints = (profile.loyalty_points || 0) - pointsToRedeem;
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            loyalty_points: newTotalPoints,
            total_orders: (profile.total_orders || 0) + 1,
            total_spent: (profile.total_spent || 0) + finalAmount
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      } else {
        // Update user profile without points (points will be credited on completion)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            total_orders: (profile.total_orders || 0) + 1,
            total_spent: (profile.total_spent || 0) + finalAmount
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      }

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      }

      console.log('Profile updated successfully');

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderNumber} has been confirmed. Estimated delivery: 30 minutes.`,
      });

      // Refresh profile to update loyalty points
      await refreshProfile();

      // Navigate to order confirmation
      navigate('/order-confirmation', { 
        state: { 
          orderNumber,
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointsRedeem(10)}
                            disabled={profile.loyalty_points < 10 || pointsToRedeem === 10}
                            className="w-full justify-between"
                          >
                            <span>Redeem 10 points</span>
                            <span className="text-green-600">-₹10</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointsRedeem(25)}
                            disabled={profile.loyalty_points < 25 || pointsToRedeem === 25}
                            className="w-full justify-between"
                          >
                            <span>Redeem 25 points</span>
                            <span className="text-green-600">-₹25</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointsRedeem(50)}
                            disabled={profile.loyalty_points < 50 || pointsToRedeem === 50}
                            className="w-full justify-between"
                          >
                            <span>Redeem 50 points</span>
                            <span className="text-green-600">-₹50</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointsRedeem(profile.loyalty_points)}
                            disabled={pointsToRedeem === profile.loyalty_points}
                            className="w-full justify-between"
                          >
                            <span>Redeem all points</span>
                            <span className="text-green-600">-₹{Math.min(profile.loyalty_points, Math.floor(totalAmount * 0.5))}</span>
                          </Button>
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

                  {/* Total */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span>₹{totalAmount}</span>
                      </div>
                      {pointsDiscount > 0 && (
                        <div className="flex justify-between items-center text-green-600">
                          <span>Points Discount</span>
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
                      <span className="text-green-600">+{calculatePoints(totalAmount)} pts</span>
                    </div>
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
                </CardContent>
              </Card>

              <Card className="food-card">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                         onClick={() => setDeliveryDetails(prev => ({...prev, paymentMethod: 'cod'}))}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={deliveryDetails.paymentMethod === 'cod'}
                        onChange={() => setDeliveryDetails(prev => ({...prev, paymentMethod: 'cod'}))}
                        className="text-primary"
                      />
                      <Banknote className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                         onClick={() => setDeliveryDetails(prev => ({...prev, paymentMethod: 'online'}))}>
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={deliveryDetails.paymentMethod === 'online'}
                        onChange={() => setDeliveryDetails(prev => ({...prev, paymentMethod: 'online'}))}
                        className="text-primary"
                      />
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-muted-foreground">Pay securely online (Coming Soon)</div>
                      </div>
                    </div>
                  </div>
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
                {isLoading ? 'Placing Order...' : `Place Order - ₹${totalAmount}`}
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
