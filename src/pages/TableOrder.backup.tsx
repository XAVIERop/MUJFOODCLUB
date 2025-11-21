import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  is_available: boolean;
  category?: string;
}

interface Cafe {
  id: string;
  name: string;
  slug: string;
  accepting_orders: boolean;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

const TableOrder = () => {
  const { cafeSlug, tableNumber } = useParams<{ cafeSlug: string; tableNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Load cafe and menu
  useEffect(() => {
    const loadCafeAndMenu = async () => {
      if (!cafeSlug) {
        toast({
          title: 'Invalid QR Code',
          description: 'Cafe information is missing',
          variant: 'destructive'
        });
        return;
      }

      try {
        // Fetch cafe
        const { data: cafeData, error: cafeError } = await supabase
          .from('cafes')
          .select('id, name, slug, accepting_orders')
          .eq('slug', cafeSlug)
          .single();

        if (cafeError || !cafeData) {
          throw new Error('Cafe not found');
        }

        setCafe(cafeData);

        if (!cafeData.accepting_orders) {
          toast({
            title: 'Cafe Closed',
            description: `${cafeData.name} is not accepting orders right now`,
            variant: 'destructive'
          });
        }

        // Fetch menu
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeData.id)
          .eq('is_available', true)
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (menuError) {
          throw menuError;
        }

        setMenuItems(menuData || []);
      } catch (error) {
        console.error('Error loading cafe/menu:', error);
        toast({
          title: 'Error',
          description: 'Failed to load menu. Please try scanning the QR code again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCafeAndMenu();
  }, [cafeSlug, toast]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev[item.id];
      if (existing) {
        return {
          ...prev,
          [item.id]: { ...existing, quantity: existing.quantity + 1 }
        };
      }
      return {
        ...prev,
        [item.id]: { item, quantity: 1 }
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev[itemId];
      if (!existing) return prev;
      
      if (existing.quantity === 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [itemId]: { ...existing, quantity: existing.quantity - 1 }
      };
    });
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, { quantity }) => sum + quantity, 0);
  };

  // Place order
  const handlePlaceOrder = async () => {
    // Validation
    if (!guestName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return;
    }

    if (!guestPhone || guestPhone.length !== 10) {
      toast({
        title: 'Phone Required',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive'
      });
      return;
    }

    if (Object.keys(cart).length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart',
        variant: 'destructive'
      });
      return;
    }

    if (!cafe) {
      toast({
        title: 'Error',
        description: 'Cafe information is missing',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      const generatedOrderNumber = `TBL-${tableNumber}-${random}`;

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: null, // Guest order
          cafe_id: cafe.id,
          order_number: generatedOrderNumber,
          order_type: 'table_order',
          table_number: tableNumber,
          customer_name: guestName.trim(),
          phone_number: guestPhone,
          delivery_notes: notes.trim() || null,
          total_amount: getTotalAmount(),
          status: 'received',
          payment_method: 'cash',
          delivery_block: 'DINE_IN',
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
        .select('id, order_number')
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create order');
      }

      if (!order) {
        throw new Error('Order was not created');
      }

      // Insert order items
      const orderItems = Object.values(cart).map(({ item, quantity }) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error('Failed to add items to order');
      }

      // Success
      setOrderNumber(order.order_number);
      setOrderPlaced(true);
      
      toast({
        title: 'Order Placed!',
        description: `Your order #${order.order_number} has been sent to the kitchen`,
      });
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast({
        title: 'Order Failed',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Order Placed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold">Order #{orderNumber}</p>
              <p className="text-gray-600">
                Your order has been sent to the kitchen. Staff will bring it to Table {tableNumber}.
              </p>
              <p className="text-sm text-gray-500">
                Thank you for dining with us!
              </p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full mt-4"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{cafe?.name}</h1>
          <p className="text-gray-600">Table {tableNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Menu</h2>
            {menuItems.length === 0 ? (
              <p className="text-gray-500">No items available</p>
            ) : (
              <div className="space-y-3">
                {menuItems.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <p className="text-lg font-bold mt-2">₹{item.price}</p>
                        </div>
                        <div className="ml-4">
                          {cart[item.id] ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">
                                {cart[item.id].quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                            >
                              Add
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

          {/* Order Summary & Guest Details */}
          <div className="space-y-4">
            {/* Guest Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cart Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({getTotalItems()} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(cart).length === 0 ? (
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {Object.values(cart).map(({ item, quantity }) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x{quantity}</span>
                          <span className="font-semibold">₹{item.price * quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{getTotalAmount()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || !cafe?.accepting_orders}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        `Place Order - ₹${getTotalAmount()}`
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableOrder;

