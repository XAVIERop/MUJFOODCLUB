import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_available: boolean;
  image_url?: string;
}

interface Cafe {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes: string;
}

const Elicit = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchElicitCafe();
  }, []);

  const fetchElicitCafe = async () => {
    try {
      setLoading(true);
      
      // Fetch ELICIT cafe
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('*')
        .eq('slug', 'elicit-2025')
        .single();

      if (cafeError) {
        console.error('Error fetching ELICIT cafe:', cafeError);
        return;
      }

      setCafe(cafeData);

      // Fetch menu items for ELICIT cafe
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeData.id)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (menuError) {
        console.error('Error fetching menu items:', menuError);
        return;
      }

      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching ELICIT data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const itemId = item.id;
    setCart(prev => ({
      ...prev,
      [itemId]: {
        item,
        quantity: (prev[itemId]?.quantity || 0) + 1,
        notes: prev[itemId]?.notes || ''
      }
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId]) {
        newCart[itemId].quantity -= 1;
        if (newCart[itemId].quantity <= 0) {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) {
      alert("Please add items to your cart before checkout");
      return;
    }

    if (!user) {
      alert("Please sign in to place an order");
      navigate('/auth');
      return;
    }

    // Convert cart to regular format and navigate to checkout
    const regularCart = Object.values(cart).reduce((acc, cartItem) => {
      acc[cartItem.item.id] = {
        item: cartItem.item,
        quantity: cartItem.quantity,
        notes: cartItem.notes
      };
      return acc;
    }, {} as {[key: string]: any});

    const totalAmount = getCartTotal();

    navigate('/checkout', {
      state: {
        cart: regularCart,
        cafe: null, // Don't pass cafe for ELICIT orders
        totalAmount: totalAmount,
        isElicitOrder: true
      }
    });
  };

  const getCategories = () => {
    const categories = ['All', ...new Set(menuItems.map(item => item.category))];
    return categories;
  };

  const getFilteredMenuItems = () => {
    if (selectedCategory === 'All') {
      return menuItems;
    }
    return menuItems.filter(item => item.category === selectedCategory);
  };

  const getCategoryItems = (category: string) => {
    return menuItems.filter(item => item.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ELICIT Cafe Not Found</h1>
          <p className="text-gray-600">The ELICIT cafe is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Cafe Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{cafe.name}</h1>
              <p className="text-lg opacity-90">{cafe.description}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {cafe.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {cafe.hours}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {cafe.phone}
                </div>
              </div>
            </div>
            <Badge className="bg-white text-purple-600 px-4 py-2 text-lg">
              ELICIT Special
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {getCategories().map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Items by Category */}
            {getCategories().filter(cat => cat !== 'All').map((category) => {
              const categoryItems = getCategoryItems(category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {category}
                  </h3>
                  <div className="grid gap-4">
                    {categoryItems.map((item) => {
                      const quantity = cart[item.id]?.quantity || 0;
                      return (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                <div className="flex items-center mt-2">
                                  <span className="text-lg font-bold text-purple-600">₹{item.price}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {item.preparation_time} min
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                {quantity > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => removeFromCart(item.id)}
                                      className="w-8 h-8 p-0 rounded-full"
                                    >
                                      -
                                    </Button>
                                    <span className="font-medium text-purple-600 min-w-[20px] text-center">
                                      {quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addToCart(item)}
                                      className="w-8 h-8 p-0 rounded-full"
                                    >
                                      +
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({getCartItemCount()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(cart).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {Object.values(cart).map((cartItem) => (
                        <div key={cartItem.item.id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{cartItem.item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {cartItem.quantity}</p>
                          </div>
                          <p className="font-medium">₹{cartItem.item.price * cartItem.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      <Button 
                        onClick={handleCheckout}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        Checkout ELICIT Order
                      </Button>
                    </div>
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

export default Elicit;