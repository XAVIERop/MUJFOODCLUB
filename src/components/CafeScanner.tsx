import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  QrCode, 
  Camera, 
  Search, 
  User, 
  Crown, 
  Star,
  ShoppingCart,
  Percent,
  X
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateDailyOrderNumber } from '@/utils/orderNumberGenerator';

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  block: string;
  loyalty_points: number;
  loyalty_tier: string;
  qr_code: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

const CafeScanner = ({ cafeId }: { cafeId: string }) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: {item: MenuItem, quantity: number, special_instructions: string}}>({});
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [cafeId]);

  const fetchMenuItems = async () => {
    try {
      setMenuLoading(true);
      console.log('Fetching menu items for cafe:', cafeId);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      
      console.log('Menu items fetched:', data);
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setMenuLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowScanner(true);
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Error",
        description: "Please allow camera access or use manual QR entry",
        variant: "destructive"
      });
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
    setScanning(false);
  };

  const handleQRInput = async () => {
    if (!qrInput.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('qr_code', qrInput.trim())
        .single();

      if (error) throw error;
      
      setStudentProfile(data);
      toast({
        title: "Student Found!",
        description: `${data.full_name} - ${data.loyalty_tier} tier`,
      });
    } catch (error) {
      console.error('Error finding student:', error);
      toast({
        title: "Student Not Found",
        description: "Please check the QR code ID",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'connoisseur': return 20; // Diamond
      case 'gourmet': return 15;     // Gold
      case 'foodie': return 10;      // Silver
      default: return 5;             // Bronze
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'connoisseur': return 'bg-blue-500';
      case 'gourmet': return 'bg-yellow-500';
      case 'foodie': return 'bg-gray-500';
      default: return 'bg-orange-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'connoisseur': return Crown;
      case 'gourmet': return Star;
      default: return User;
    }
  };

  const addToOrder = (item: MenuItem) => {
    setSelectedItems(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1,
        special_instructions: prev[item.id]?.special_instructions || ''
      }
    }));
  };

  const removeFromOrder = (itemId: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId].quantity > 1) {
        newItems[itemId].quantity -= 1;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const updateNotes = (itemId: string, special_instructions: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], special_instructions }
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedItems).forEach(({ item, quantity }) => {
      total += item.price * quantity;
    });
    return total;
  };

  const calculateDiscount = () => {
    if (!studentProfile) return 0;
    const total = calculateTotal();
    const discountPercent = getTierDiscount(studentProfile.loyalty_tier);
    return (total * discountPercent) / 100;
  };

  const calculateFinalTotal = () => {
    return calculateTotal() - calculateDiscount();
  };

  const placeOfflineOrder = async () => {
    if (!studentProfile || Object.keys(selectedItems).length === 0) return;

    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const discount = calculateDiscount();
      const finalAmount = calculateFinalTotal();
      const pointsToEarn = Math.floor(finalAmount * 0.1); // 10% of final amount

      // Generate order number using new daily reset system
      console.log('🔄 Generating offline order number for cafe:', cafeId);
      let orderNumber: string;
      
      try {
        orderNumber = await generateDailyOrderNumber(cafeId);
        console.log('✅ Generated daily order number:', orderNumber);
      } catch (error) {
        console.error('❌ Failed to generate daily order number, using fallback:', error);
        // Fallback to old system
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        const userSuffix = studentProfile.id.substr(-4).toUpperCase();
        orderNumber = `OFFLINE-${timestamp}-${random}-${userSuffix}`;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: studentProfile.id,
          cafe_id: cafeId,
          order_number: orderNumber,
          total_amount: finalAmount,
          delivery_block: studentProfile.block,
          delivery_notes: 'Offline order placed at cafe',
          payment_method: 'cod',
          points_earned: pointsToEarn,
          status: 'received',
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = Object.values(selectedItems).map(({ item, quantity, special_instructions }) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity,
        unit_price: item.price,
        total_price: item.price * quantity,
        special_instructions: special_instructions
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update student's loyalty points
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ 
          loyalty_points: studentProfile.loyalty_points + pointsToEarn,
          total_orders: studentProfile.total_orders + 1,
          total_spent: studentProfile.total_spent + finalAmount
        })
        .eq('id', studentProfile.id);

      if (pointsError) throw pointsError;

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${orderNumber} created for ${studentProfile.full_name}`,
      });

      // Reset form
      setStudentProfile(null);
      setSelectedItems({});
      setQrInput('');
      
    } catch (error) {
      console.error('Error placing offline order:', error);
      toast({
        title: "Error",
        description: "Failed to place offline order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="food-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <QrCode className="w-5 h-5 mr-2" />
            Cafe Scanner - Offline Orders
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Scan student QR codes or manually enter QR IDs to place offline orders
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Enter QR Code ID (e.g., QR_12345678)"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleQRInput} disabled={loading || !qrInput.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Find Student
            </Button>
            <Button 
              variant="outline" 
              onClick={showScanner ? stopScanner : startScanner}
            >
              {showScanner ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Stop Scanner
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR
                </>
              )}
            </Button>
          </div>

          {/* Camera Scanner */}
          {showScanner && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                  <p className="text-white text-sm">Position QR code here</p>
                </div>
              </div>
            </div>
          )}

          {/* Student Profile Display */}
          {studentProfile && (
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{studentProfile.full_name}</h3>
                    <p className="text-white/70 text-sm">{studentProfile.email}</p>
                    <p className="text-white/70 text-sm">Block {studentProfile.block}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getTierColor(studentProfile.loyalty_tier)} text-white mb-2`}>
                      {(() => {
                        const Icon = getTierIcon(studentProfile.loyalty_tier);
                        return <Icon className="w-3 h-3 mr-1" />;
                      })()}
                      {studentProfile.loyalty_tier.toUpperCase()}
                    </Badge>
                    <div className="text-white">
                      <div className="text-2xl font-bold">{studentProfile.loyalty_points}</div>
                      <div className="text-sm text-white/70">points</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-white font-semibold">
                    {getTierDiscount(studentProfile.loyalty_tier)}% Discount Available
                  </div>
                  <div className="text-white/70 text-sm">
                    Show this student's loyalty tier for automatic discount
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Selection */}
          {studentProfile && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-lg">Select Menu Items</h4>
              
              {/* Debug Info */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <strong>Debug:</strong> Found {menuItems.length} menu items for cafe {cafeId}
                </p>
                <p className="text-blue-300 text-sm mt-1">
                  <strong>Status:</strong> {menuLoading ? 'Loading menu...' : 'Menu loaded'}
                </p>
              </div>
              
              {/* Loading State */}
              {menuLoading && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading menu items...</p>
                  </CardContent>
                </Card>
              )}
              
              {menuItems.length === 0 ? (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Menu Items Available</h3>
                    <p className="text-white/70">This cafe doesn't have any menu items yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="bg-white/10 border-white/20 hover:bg-white/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-white text-lg">{item.name}</h5>
                            {item.description && (
                              <p className="text-white/70 text-sm mt-1">{item.description}</p>
                            )}
                            <p className="text-white font-bold text-lg mt-2">₹{item.price}</p>
                            <Badge variant="secondary" className="mt-1 text-xs bg-white/20 text-white border-white/30">
                              {item.category}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToOrder(item)}
                            className="bg-primary hover:bg-primary/80 ml-4"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        
                        {selectedItems[item.id] && (
                          <div className="mt-3 p-3 bg-white/20 rounded-lg border border-white/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">
                                Quantity: {selectedItems[item.id].quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromOrder(item.id)}
                                className="h-6 w-6 p-0 text-white border-white/30 hover:bg-white/20"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Special instructions (optional)..."
                              value={selectedItems[item.id].special_instructions}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="text-sm bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order Summary */}
          {Object.keys(selectedItems).length > 0 && (
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.values(selectedItems).map(({ item, quantity, special_instructions }) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="text-white font-medium">{item.name}</span>
                      <span className="text-white/70 text-sm ml-2">x{quantity}</span>
                      {special_instructions && <p className="text-white/60 text-xs">{special_instructions}</p>}
                    </div>
                    <span className="text-white">₹{item.price * quantity}</span>
                  </div>
                ))}
                
                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Subtotal:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  {studentProfile && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({getTierDiscount(studentProfile.loyalty_tier)}%):</span>
                      <span>-₹{calculateDiscount()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateFinalTotal()}</span>
                  </div>
                </div>

                <Button 
                  onClick={placeOfflineOrder} 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/80"
                >
                  {loading ? 'Placing Order...' : 'Place Offline Order'}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CafeScanner;
