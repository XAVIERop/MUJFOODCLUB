import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, ShoppingCart, Clock, Star, ArrowLeft, Filter } from 'lucide-react';
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
  out_of_stock: boolean;
}

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  average_rating: number | null;
  total_ratings: number | null;
}

const Menu = () => {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{[key: string]: {item: MenuItem, quantity: number, notes: string}}>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (cafeId) {
      fetchCafeData();
    }
  }, [cafeId]);

  // Real-time subscription for cafe rating updates
  useEffect(() => {
    if (!cafeId) return;

    const channel = supabase
      .channel(`cafe-${cafeId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'cafes',
          filter: `id=eq.${cafeId}`
        }, 
        (payload) => {
          console.log('Cafe updated:', payload.new);
          // Update cafe data when ratings change
          if (payload.new) {
            setCafe(prev => prev ? { ...prev, ...payload.new as Partial<Cafe> } : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cafeId]);

  const fetchCafeData = async () => {
    try {
      // Fetch cafe details
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (cafeError) throw cafeError;
      setCafe(cafeData);

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (menuError) throw menuError;
      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching cafe data:', error);
      toast({
        title: "Error",
        description: "Failed to load cafe menu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh cafe data (useful for testing)
  const refreshCafeData = () => {
    if (cafeId) {
      fetchCafeData();
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
        notes: prev[item.id]?.notes || ''
      }
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId].quantity > 1) {
        newCart[itemId].quantity -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((total, {item, quantity}) => 
      total + (item.price * quantity), 0
    );
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, {quantity}) => total + quantity, 0);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    // Navigate to checkout with cart data
    navigate('/checkout', { 
      state: { 
        cart, 
        cafe, 
        totalAmount: getTotalAmount() 
      } 
    });
  };

  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as {[key: string]: MenuItem[]});

  // Get unique categories for the filter
  const categories = Object.keys(groupedItems);
  
  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? groupedItems 
    : { [selectedCategory]: groupedItems[selectedCategory] || [] };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Cafe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Cafe Header */}
      <div className="gradient-primary text-white py-12">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cafes
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-white/20 text-white mb-4">{cafe.type}</Badge>
              <h1 className="text-4xl font-bold mb-4">{cafe.name}</h1>
              <p className="text-white/90 text-lg mb-4">{cafe.description}</p>
              
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}</span>
                  {cafe.total_ratings && cafe.total_ratings > 0 && (
                    <span className="ml-1 text-sm opacity-75">
                      ({cafe.total_ratings})
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{cafe.hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter System */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Filter by Category</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* All Categories Button */}
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`transition-all duration-200 ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-white shadow-lg scale-105' 
                  : 'hover:bg-primary/10'
              }`}
            >
              All Categories ({menuItems.length})
            </Button>
            
            {/* Individual Category Buttons */}
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-200 ${
                  selectedCategory === category 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'hover:bg-primary/10'
                }`}
              >
                {category} ({groupedItems[category].length})
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(filteredItems).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mr-3">
                    {items.length} items
                  </span>
                  {category}
                </h2>
                <div className="grid gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="food-card border-0">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {item.name}
                              </h3>
                              {item.out_of_stock && (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {item.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {item.preparation_time} min
                              </div>
                              <div className="text-xl font-bold text-primary">
                                ₹{item.price}
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {item.out_of_stock ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="opacity-50 cursor-not-allowed"
                              >
                                Out of Stock
                              </Button>
                            ) : cart[item.id] ? (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold">
                                  {cart[item.id].quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="order"
                                size="sm"
                                onClick={() => addToCart(item)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {cart[item.id] && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <Textarea
                              placeholder="Special instructions (optional)"
                              value={cart[item.id].notes}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="food-card border-0 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Your Order ({getCartItemCount()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(cart).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.values(cart).map(({item, quantity}) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price} × {quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          ₹{item.price * quantity}
                        </p>
                      </div>
                    ))}
                    
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">₹{getTotalAmount()}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant="hero"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;