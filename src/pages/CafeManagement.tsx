import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Store, ToggleLeft, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Cafe {
  id: string;
  name: string;
  accepting_orders: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
  out_of_stock: boolean;
}

const CafeManagement = () => {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCafeData();
  }, [user, navigate]);

  const fetchCafeData = async () => {
    try {
      let cafeId: string | null = null;

      // Check if user is cafe owner
      if (profile?.user_type === 'cafe_owner') {
        cafeId = profile.cafe_id;
      } else if (profile?.user_type === 'cafe_staff') {
        // Cafe staff get cafe_id from cafe_staff table
        const { data: staffData, error: staffError } = await supabase
          .from('cafe_staff')
          .select('cafe_id')
          .eq('user_id', user?.id)
          .eq('is_active', true)
          .single();

        if (staffError || !staffData) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access cafe management",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        cafeId = staffData.cafe_id;
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access cafe management",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      if (!cafeId) {
        toast({
          title: "Access Denied",
          description: "No cafe associated with your account",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Get cafe details
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (cafeError) throw cafeError;
      setCafe(cafeData);

      // Get menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (menuError) throw menuError;
      setMenuItems(menuData || []);
    } catch (error) {
      console.error('Error fetching cafe data:', error);
      toast({
        title: "Error",
        description: "Failed to load cafe data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderAcceptance = async () => {
    if (!cafe) return;
    
    setUpdating(true);
    try {
      const newStatus = !cafe.accepting_orders;
      
      console.log('Attempting to update cafe order acceptance:', {
        cafeId: cafe.id,
        newStatus,
        userId: user?.id
      });

      const { data, error } = await supabase
        .from('cafes')
        .update({ accepting_orders: newStatus })
        .eq('id', cafe.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      setCafe(prev => prev ? { ...prev, accepting_orders: newStatus } : null);
      toast({
        title: "Success",
        description: `Cafe is now ${newStatus ? 'accepting' : 'not accepting'} orders`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating order acceptance:', error);
      
      // More detailed error message
      let errorMessage = "Failed to update order acceptance status";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleItemStock = async (itemId: string, currentStatus: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ out_of_stock: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, out_of_stock: !currentStatus }
          : item
      ));

      toast({
        title: "Success",
        description: `Item ${!currentStatus ? 'marked as out of stock' : 'restocked'}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating item stock:', error);
      toast({
        title: "Error",
        description: "Failed to update item stock status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cafe management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You don't have permission to access cafe management</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/cafe-dashboard')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Store className="w-8 h-8 mr-3 text-primary" />
                {cafe.name} Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your cafe settings and menu availability
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Acceptance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ToggleLeft className="w-5 h-5 mr-2 text-primary" />
                Order Acceptance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Accept New Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    When disabled, students cannot place new orders
                  </p>
                </div>
                <Switch
                  checked={cafe.accepting_orders}
                  onCheckedChange={toggleOrderAcceptance}
                  disabled={updating}
                />
              </div>
              <div className="flex items-center space-x-2">
                {cafe.accepting_orders ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Currently accepting orders</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Not accepting orders</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Menu Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {menuItems.filter(item => !item.out_of_stock && item.is_available).length}
                  </div>
                  <div className="text-sm text-green-600">Available Items</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {menuItems.filter(item => item.out_of_stock).length}
                  </div>
                  <div className="text-sm text-red-600">Out of Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Menu Items Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toggle items as out of stock when they're temporarily unavailable
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No menu items found</p>
                </div>
              ) : (
                menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground">₹{item.price}</span>
                      </div>
                      {item.out_of_stock && (
                        <div className="flex items-center space-x-2 mt-1">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={!item.out_of_stock}
                      onCheckedChange={() => toggleItemStock(item.id, item.out_of_stock)}
                      disabled={updating}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CafeManagement;
