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
import { ArrowLeft, MapPin, Clock, CreditCard, Banknote, AlertCircle, CheckCircle } from 'lucide-react';
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
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Calculate points to earn
      const pointsToEarn = calculatePoints(totalAmount);

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
          total_amount: totalAmount,
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

      // Add loyalty points
      if (pointsToEarn > 0) {
        console.log('Adding loyalty points:', pointsToEarn);
        
        const { error: pointsError } = await supabase
          .from('loyalty_transactions')
          .insert({
            user_id: user.id,
            order_id: order.id,
            points_change: pointsToEarn,
            transaction_type: 'earned',
            description: `Earned ${pointsToEarn} points for order ${orderNumber}`
          });

        if (pointsError) {
          console.error('Loyalty points error:', pointsError);
          throw pointsError;
        }

        // Update user profile with new points
        const newTotalPoints = (profile.loyalty_points || 0) + pointsToEarn;
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            loyalty_points: newTotalPoints,
            total_orders: (profile.total_orders || 0) + 1,
            total_spent: (profile.total_spent || 0) + totalAmount
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }

        console.log('Profile updated successfully');
      }

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

                  {/* Total */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{totalAmount}</span>
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
