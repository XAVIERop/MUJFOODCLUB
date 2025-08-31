import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, ShoppingCart, Clock, Star, ArrowLeft, Filter, Search, Phone, MessageCircle } from 'lucide-react';
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

interface GroupedMenuItem {
  baseName: string;
  category: string;
  description: string;
  preparation_time: number;
  portions: {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    out_of_stock: boolean;
  }[];
}

interface CartItem {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    preparation_time: number;
    is_available: boolean;
  };
  selectedPortion: string; // portion ID
  quantity: number;
  notes: string;
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
  const [groupedMenuItems, setGroupedMenuItems] = useState<GroupedMenuItem[]>([]);
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      
      // Group menu items by name and portion
      const grouped = groupMenuItems(menuData || []);
      setGroupedMenuItems(grouped);
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

  // Function to group menu items by name and portion
  const groupMenuItems = (items: MenuItem[]): GroupedMenuItem[] => {
    console.log('Original menu items:', items);
    const grouped: { [key: string]: GroupedMenuItem } = {};
    
    items.forEach(item => {
      // Extract base name (remove portion indicators like " (Half)", " (Full)", " - Full", " - Half")
      const baseName = item.name.replace(/\s*[-\s]*\(?(Half|Full|Small|Large|Regular)\)?$/i, '').trim();
      const portionMatch = item.name.match(/\s*[-\s]*\(?(Half|Full|Small|Large|Regular)\)?$/i);
      const portionName = portionMatch ? portionMatch[1] : 'Regular';
      
      console.log(`Item: "${item.name}" -> Base: "${baseName}", Portion: "${portionName}"`);
      
      if (!grouped[baseName]) {
        grouped[baseName] = {
          baseName,
          category: item.category,
          description: item.description,
          preparation_time: item.preparation_time,
          portions: []
        };
      }
      
      grouped[baseName].portions.push({
        id: item.id,
        name: portionName,
        price: item.price,
        is_available: item.is_available,
        out_of_stock: item.out_of_stock
      });
    });
    
    console.log('Grouped menu items:', grouped);
    return Object.values(grouped);
  };

  // Function to manually refresh cafe data (useful for testing)
  const refreshCafeData = () => {
    if (cafeId) {
      fetchCafeData();
    }
  };

  const addToCart = (item: GroupedMenuItem, portionId: string) => {
    const selectedPortion = item.portions.find(p => p.id === portionId);
    
    if (!selectedPortion) {
      console.error('Selected portion not found:', portionId);
      return;
    }
    
    // Use portion ID as cart key for uniqueness
    const cartKey = portionId;
    
    setCart(prev => ({
      ...prev,
      [cartKey]: {
        item: {
          id: selectedPortion.id, // Use the portion ID
          name: `${item.baseName} (${selectedPortion.name})`,
          description: item.description,
          price: selectedPortion.price,
          category: item.category,
          preparation_time: item.preparation_time,
          is_available: selectedPortion.is_available
        },
        selectedPortion: portionId,
        quantity: (prev[cartKey]?.quantity || 0) + 1,
        notes: prev[cartKey]?.notes || ''
      }
    }));
  };

  const removeFromCart = (cartKey: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity -= 1;
      } else {
        delete newCart[cartKey];
      }
      return newCart;
    });
  };

  const updateNotes = (cartKey: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      [cartKey]: {
        ...prev[cartKey],
        notes
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((total, {item, quantity}) => {
      return total + item.price * quantity;
    }, 0);
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
  
  // Filter items based on selected category and search query
  const getFilteredItems = () => {
    let filtered = selectedCategory === 'all' 
      ? groupedMenuItems 
      : groupedMenuItems.filter(item => item.category === selectedCategory);
    
    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.baseName.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };
  
  // Group filtered items by category
  const filteredItems = getFilteredItems().reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as {[key: string]: GroupedMenuItem[]});

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
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-green-400" />
                  <a 
                    href={`tel:${cafe.phone}`} 
                    className="text-white hover:text-green-300 transition-colors duration-200 hover:underline"
                  >
                    {cafe.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1 text-blue-400" />
                  <a 
                    href={`https://wa.me/${cafe.phone.replace(/\D/g, '')}?text=Hi ${cafe.name}, I have a question about your menu.`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-blue-300 transition-colors duration-200 hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter System */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Filter by Category</h3>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-primary" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
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
              All Categories ({groupedMenuItems.length})
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
          
          {/* Search Status */}
          {searchQuery && (
            <div className="mt-3 text-sm text-muted-foreground">
              Searching for: <span className="font-medium text-primary">"{searchQuery}"</span>
              {Object.keys(filteredItems).length > 0 && (
                <span className="ml-2">• Found {Object.values(filteredItems).flat().length} items</span>
              )}
            </div>
          )}
        </div>

        {/* No Results Message */}
        {searchQuery && Object.keys(filteredItems).length === 0 && (
          <div className="mb-8 text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              No menu items match your search for "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="hover:bg-primary hover:text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

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
                    <Card key={item.baseName} className="food-card border-0">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {item.baseName}
                              </h3>
                              {item.portions.every(p => p.out_of_stock) && (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {item.description}
                            </p>
                            
                            {/* Portion Selection */}
                            {item.portions.length > 1 && (
                              <div className="mb-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium text-foreground">Portion:</span>
                                  {item.portions.map((portion) => (
                                    <Button
                                      key={portion.id}
                                      variant={cart[portion.id]?.selectedPortion === portion.id ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => {
                                        if (cart[portion.id]) {
                                          setCart(prev => ({
                                            ...prev,
                                            [portion.id]: {
                                              ...prev[portion.id],
                                              selectedPortion: portion.id
                                            }
                                          }));
                                        }
                                      }}
                                      disabled={portion.out_of_stock}
                                      className="text-xs"
                                    >
                                      {portion.name} - ₹{portion.price}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {item.preparation_time} min
                              </div>
                              {item.portions.length === 1 && (
                                <div className="text-xl font-bold text-primary">
                                  ₹{item.portions[0].price}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {item.portions.every(p => p.out_of_stock) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="opacity-50 cursor-not-allowed"
                              >
                                Out of Stock
                              </Button>
                            ) : (
                              // Show cart controls for each portion
                              <div className="space-y-2">
                                {item.portions.map((portion) => (
                                  <div key={portion.id} className="flex items-center space-x-2">
                                    {cart[portion.id] ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeFromCart(portion.id)}
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-8 text-center font-semibold">
                                          {cart[portion.id].quantity}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => addToCart(item, portion.id)}
                                        >
                                          <Plus className="w-4 h-4" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        variant="order"
                                        size="sm"
                                        onClick={() => addToCart(item, portion.id)}
                                        disabled={portion.out_of_stock}
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {portion.name} - ₹{portion.price}
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show notes for any portion in cart */}
                        {item.portions.some(portion => cart[portion.id]) && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <Textarea
                              placeholder="Special instructions (optional)"
                              value={cart[item.portions.find(p => cart[p.id])?.id || '']?.notes || ''}
                              onChange={(e) => {
                                const portionInCart = item.portions.find(p => cart[p.id]);
                                if (portionInCart) {
                                  updateNotes(portionInCart.id, e.target.value);
                                }
                              }}
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
                      <div key={item.name} className="flex justify-between items-center">
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