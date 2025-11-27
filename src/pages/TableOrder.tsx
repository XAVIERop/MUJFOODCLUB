import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModernMenuLayout from '@/components/ModernMenuLayout';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  category: string;
  preparation_time?: number;
  out_of_stock?: boolean;
  cafe_id: string;
}

interface GroupedMenuItem {
  baseName: string;
  category: string;
  description: string;
  preparation_time: number;
  is_vegetarian: boolean;
  portions: {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    out_of_stock: boolean;
  }[];
}

interface Cafe {
  id: string;
  name: string;
  slug: string;
  accepting_orders: boolean;
  description?: string;
  location?: string;
  phone?: string;
  hours?: string;
  image_url?: string;
  type?: string;
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
  const [groupedMenuItems, setGroupedMenuItems] = useState<GroupedMenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);

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
        // Fetch cafe with full details
        const { data: cafeData, error: cafeError } = await supabase
          .from('cafes')
          .select('*')
          .eq('slug', cafeSlug)
          .single();

        if (cafeError || !cafeData) {
          throw new Error('Cafe not found');
        }

        console.log('🏪 Cafe data from DB:', cafeData);
        console.log('🏪 Cafe ID from DB:', cafeData.id);
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
        
        // Group menu items by base name (for portion sizes)
        const grouped = groupMenuItems(menuData || []);
        setGroupedMenuItems(grouped);
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

  // Group menu items by base name for portion sizes
  const groupMenuItems = (items: MenuItem[]): GroupedMenuItem[] => {
    const grouped = new Map<string, GroupedMenuItem>();

    items.forEach(item => {
      // Extract base name (remove portion indicators like "Half", "Full", "Regular", "Large")
      const baseName = item.name
        .replace(/\s*\((Half|Full|Regular|Large|Small|Medium)\)/gi, '')
        .trim();

      if (!grouped.has(baseName)) {
        grouped.set(baseName, {
          baseName,
          category: item.category,
          description: item.description || '',
          preparation_time: item.preparation_time || 0,
          is_vegetarian: item.is_vegetarian,
          portions: []
        });
      }

      grouped.get(baseName)!.portions.push({
        id: item.id,
        name: item.name,
        price: item.price,
        is_available: item.is_available,
        out_of_stock: item.out_of_stock || false
      });
    });

    return Array.from(grouped.values());
  };

  // Get unique categories from menu items
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  // Cart functions adapted for ModernMenuLayout interface
  const handleAddToCart = (item: GroupedMenuItem, selectedPortion?: string) => {
    // Find the actual menu item
    const portion = item.portions.find(p => p.id === selectedPortion) || item.portions[0];
    if (!portion) return;

    const menuItem = menuItems.find(mi => mi.id === portion.id);
    if (!menuItem) return;

    setCart(prev => {
      const existing = prev[menuItem.id];
      if (existing) {
        return {
          ...prev,
          [menuItem.id]: { ...existing, quantity: existing.quantity + 1 }
        };
      }
      return {
        ...prev,
        [menuItem.id]: { item: menuItem, quantity: 1 }
      };
    });
  };

  const handleRemoveFromCart = (item: any) => {
    // Handle both GroupedMenuItem and CartItem structures
    let cartItemId: string;
    
    if (item.portions && Array.isArray(item.portions)) {
      // GroupedMenuItem with portions array
      const portionIds = item.portions.map((p: any) => p.id);
      const foundId = portionIds.find((id: string) => cart[id]);
      if (!foundId) return;
      cartItemId = foundId;
    } else if (item.item && item.item.id) {
      // CartItem structure from ModernMenuLayout
      cartItemId = item.item.id;
    } else {
      // Direct item with id
      cartItemId = item.id;
    }
    
    if (!cartItemId || !cart[cartItemId]) return;

    setCart(prev => {
      const existing = prev[cartItemId];
      if (!existing) return prev;
      
      if (existing.quantity === 1) {
        const { [cartItemId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [cartItemId]: { ...existing, quantity: existing.quantity - 1 }
      };
    });
  };

  const getCartQuantity = (itemId: string): number => {
    return cart[itemId]?.quantity || 0;
  };

  const getTotalAmount = (): number => {
    return Object.values(cart).reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  };

  const getCartItemCount = (): number => {
    return Object.values(cart).reduce((sum, { quantity }) => sum + quantity, 0);
  };

  // Handle checkout button click - show guest form
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart',
        variant: 'destructive'
      });
      return;
    }
    setShowGuestForm(true);
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
      // Check current auth status
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('🔐 Current auth user:', currentUser);
      console.log('🔐 Is anonymous?', currentUser === null);

      // Generate order number
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 6).toUpperCase();
      const generatedOrderNumber = `TBL-${tableNumber}-${random}`;

      // Prepare order items for RPC function
      const orderItems = Object.values(cart).map(({ item, quantity }) => ({
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity
      }));

      console.log('📦 Calling create_table_order RPC...');
      console.log('📦 Cafe ID:', cafe.id);
      console.log('📦 Order items:', orderItems);

      // Use RPC function instead of direct insert (bypasses API restrictions)
      const { data: order, error: orderError } = await supabase
        .rpc('create_table_order', {
          p_cafe_id: cafe.id,
          p_table_number: tableNumber,
          p_customer_name: guestName.trim(),
          p_phone_number: guestPhone,
          p_delivery_notes: notes.trim() || null,
          p_total_amount: getTotalAmount(),
          p_order_items: orderItems
        });

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(orderError.message || 'Failed to create order');
      }

      if (!order) {
        throw new Error('Order was not created');
      }

      console.log('✅ Order created via RPC:', order);

      // Success - RPC function returns JSON object
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
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={() => navigate(`/table-order/${cafeSlug}/${tableNumber}`)}
                  className="w-full"
                >
                  Order Again
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-16 pb-20 lg:pb-0">
      <Header />
      
      {/* Main Menu Display */}
      <ModernMenuLayout
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        menuItems={groupedMenuItems}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        getCartQuantity={getCartQuantity}
        cart={cart}
        getTotalAmount={getTotalAmount}
        getCartItemCount={getCartItemCount}
        onCheckout={handleCheckout}
        cafe={cafe}
      />

      {/* Mobile Floating Checkout Button - Only for mobile, triggers guest form */}
      {getCartItemCount() > 0 && !showGuestForm && (
        <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-[60] block lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">
                {getCartItemCount()} {getCartItemCount() === 1 ? 'Item' : 'Items'} • ₹{getTotalAmount()}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="bg-white text-green-600 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
            >
              <span>Place Order</span>
              <span>&gt;</span>
            </button>
          </div>
        </div>
      )}

      {/* Guest Checkout Form - Overlay */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center pb-16 sm:pb-0">
          <Card className="w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl max-h-[calc(90vh-4rem)] sm:max-h-[85vh] flex flex-col overflow-hidden">
            <CardHeader className="relative flex-shrink-0 pb-3">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={() => setShowGuestForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="text-lg">Complete Your Order</CardTitle>
              <p className="text-xs text-gray-600">Table {tableNumber} • {cafe?.name}</p>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto flex-1 px-4 pb-4 sm:pb-6">
              <div>
                <Label htmlFor="name" className="text-sm">Name *</Label>
                <Input
                  id="name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                  rows={2}
                  className="text-sm resize-none"
                />
              </div>

              {/* Order Summary */}
              <div className="border-t pt-3 space-y-1.5">
                <h3 className="font-semibold text-sm">Order Summary</h3>
                {Object.values(cart).map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="truncate pr-2">{item.name} x{quantity}</span>
                    <span className="flex-shrink-0">₹{item.price * quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !cafe?.accepting_orders}
                className="w-full h-11 mt-2"
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
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Footer - Desktop only (mobile has bottom nav) */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default TableOrder;

