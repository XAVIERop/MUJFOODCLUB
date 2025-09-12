import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ElicitMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface ElicitCafe {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  image: string;
  menu: ElicitMenuItem[];
}

const Elicit = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cafes, setCafes] = useState<ElicitCafe[]>([]);
  const [cart, setCart] = useState<{[key: string]: {item: ElicitMenuItem, quantity: number}}>({});

  // ELICIT Event Cafes with specific menus
  const elicitCafes: ElicitCafe[] = [
    {
      id: 'zero-degree-elicit',
      name: 'Zero Degree Cafe',
      description: 'ELICIT Event Special - Sip & Eat!',
      location: 'Ground Floor, GHS',
      phone: '+91-82336 73311',
      hours: '11:00 AM - 2:00 AM',
      image: '/zerodegreecafe_logo.jpg',
      menu: [
        { id: 'zd-1', name: 'Classic margherita', price: 255, category: 'Pizza' },
        { id: 'zd-2', name: 'Veggie lover', price: 305, category: 'Pizza' },
        { id: 'zd-3', name: 'Paneer makhani', price: 335, category: 'Main Course' },
        { id: 'zd-4', name: 'Peri peri fries', price: 110, category: 'Sides' },
        { id: 'zd-5', name: 'Salted fries', price: 100, category: 'Sides' },
        { id: 'zd-6', name: 'Ice tea', price: 60, category: 'Beverages' },
        { id: 'zd-7', name: 'Cold coffee', price: 80, category: 'Beverages' }
      ]
    },
    {
      id: 'dialog-elicit',
      name: 'Dialog',
      description: 'ELICIT Event Special - Premium Experience',
      location: 'G1 First Floor',
      phone: '+91-9928884373',
      hours: '11:00 AM - 2:00 AM',
      image: '/dialog_card.jpg',
      menu: [
        { id: 'dl-1', name: 'C4', price: 390, category: 'Pizza' },
        { id: 'dl-2', name: 'Paneer makhani', price: 455, category: 'Main Course' },
        { id: 'dl-3', name: 'High five', price: 400, category: 'Pizza' },
        { id: 'dl-4', name: 'Cold coffee', price: 125, category: 'Beverages' },
        { id: 'dl-5', name: 'Oreo shake', price: 145, category: 'Beverages' },
        { id: 'dl-6', name: 'Coke', price: 40, category: 'Beverages' }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setCafes(elicitCafes);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const addToCart = (item: ElicitMenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1
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

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + (item.item.price * item.quantity), 0);
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

    // Store cart in localStorage and navigate to checkout
    localStorage.setItem('elicit_cart', JSON.stringify(cart));
    navigate('/checkout?elicit=true');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleWhatsApp = (phone: string, cafeName: string) => {
    const message = `Hi! I'd like to place an ELICIT order from ${cafeName}. Can you help me?`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading ELICIT Event..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      {/* Cafes Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {cafes.map((cafe) => (
            <Card key={cafe.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-purple-600 text-white font-bold">
                    ELICIT Special
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-800">
                  {cafe.name}
                </CardTitle>
                <p className="text-gray-600">{cafe.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {cafe.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {cafe.hours}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Menu Items */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-lg text-gray-800">ELICIT Menu</h3>
                  {cafe.menu.map((item) => {
                    const cartItem = cart[item.id];
                    const quantity = cartItem?.quantity || 0;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-purple-600">₹{item.price}</span>
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
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(cafe.phone)}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsApp(cafe.phone, cafe.name)}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary - Fixed Bottom */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">{getCartItemCount()} items</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                ₹{getCartTotal()}
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="bg-purple-600 hover:bg-purple-700 px-8"
            >
              Checkout ELICIT Order
            </Button>
          </div>
        </div>
      )}

      {/* Add bottom padding when cart is visible */}
      {getCartItemCount() > 0 && <div className="h-20" />}
    </div>
  );
};

export default Elicit;
