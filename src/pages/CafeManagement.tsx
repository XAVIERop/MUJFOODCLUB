import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Store, ToggleLeft, Package, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Cafe {
  id: string;
  name: string;
  accepting_orders: boolean;
  whatsapp_phone?: string;
  whatsapp_enabled?: boolean;
  whatsapp_notifications?: boolean;
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // WhatsApp settings state
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Get the source dashboard from URL parameters
  const getSourceDashboard = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('from') || 'cafe-dashboard'; // Default to cafe-dashboard
  };

  // Navigate back to the correct dashboard
  const handleBackNavigation = () => {
    const source = getSourceDashboard();
    if (source === 'pos-dashboard') {
      navigate('/pos-dashboard');
    } else {
      navigate('/cafe-dashboard');
    }
  };

  // Filter menu items based on search query and selected category
  const filteredMenuItems = menuItems.filter(item => {
    // First filter by category if one is selected
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    
    // Then filter by search query if provided
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.price.toString().includes(query)
    );
  });

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

      // Get cafe details including WhatsApp settings
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', cafeId)
        .single();

      if (cafeError) throw cafeError;
      setCafe(cafeData);
      
      // Initialize WhatsApp settings
      setWhatsappPhone(cafeData.whatsapp_phone || '');
      setWhatsappEnabled(cafeData.whatsapp_enabled || false);
      setWhatsappNotifications(cafeData.whatsapp_notifications !== false); // Default to true

      // Get menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (menuError) throw menuError;
      setMenuItems(menuData || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(menuData?.map(item => item.category) || [])];
      setCategories(uniqueCategories);
      
      // Set first category as selected
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
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

  const saveWhatsAppSettings = async () => {
    if (!cafe) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('cafes')
        .update({
          whatsapp_phone: whatsappPhone.trim() || null,
          whatsapp_enabled: whatsappEnabled,
          whatsapp_notifications: whatsappNotifications
        })
        .eq('id', cafe.id);

      if (error) throw error;

      // Update local state
      setCafe(prev => prev ? {
        ...prev,
        whatsapp_phone: whatsappPhone.trim() || undefined,
        whatsapp_enabled: whatsappEnabled,
        whatsapp_notifications: whatsappNotifications
      } : null);

      toast({
        title: "WhatsApp Settings Saved",
        description: "Your WhatsApp notification settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp settings",
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
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={handleBackNavigation}
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

          {/* WhatsApp Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📱</span>
                WhatsApp Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp-phone" className="text-base font-medium">
                    WhatsApp Phone Number
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter your WhatsApp number (with country code, e.g., +91XXXXXXXXXX)
                  </p>
                  <Input
                    id="whatsapp-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    disabled={updating}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow WhatsApp notifications for this cafe
                    </p>
                  </div>
                  <Switch
                    checked={whatsappEnabled}
                    onCheckedChange={setWhatsappEnabled}
                    disabled={updating}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send WhatsApp messages for new orders
                    </p>
                  </div>
                  <Switch
                    checked={whatsappNotifications}
                    onCheckedChange={setWhatsappNotifications}
                    disabled={updating || !whatsappEnabled}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  {whatsappEnabled && whatsappPhone ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">
                        WhatsApp notifications enabled for {whatsappPhone}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600">
                        WhatsApp notifications disabled
                      </span>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={saveWhatsAppSettings}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? 'Saving...' : 'Save WhatsApp Settings'}
                </Button>
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
                    {searchQuery 
                      ? filteredMenuItems.filter(item => !item.out_of_stock && item.is_available).length
                      : menuItems.filter(item => !item.out_of_stock && item.is_available).length
                    }
                  </div>
                  <div className="text-sm text-green-600">
                    {searchQuery ? 'Filtered Available' : 'Available Items'}
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {searchQuery 
                      ? filteredMenuItems.filter(item => item.out_of_stock).length
                      : menuItems.filter(item => item.out_of_stock).length
                    }
                  </div>
                  <div className="text-sm text-red-600">
                    {searchQuery ? 'Filtered Out of Stock' : 'Out of Stock'}
                  </div>
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
            {/* Two-Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Panel - Categories */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Menu Items */}
              <div className="lg:col-span-3">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search menu items by name, category, or price..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedCategory ? `${selectedCategory} (${filteredMenuItems.length} items)` : `All Items (${filteredMenuItems.length} items)`}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenuItems.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No menu items match your search' : 'No menu items found'}
                      </p>
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                              <span className="text-sm font-medium text-gray-900">₹{item.price}</span>
                            </div>
                            {item.out_of_stock && (
                              <div className="flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span className="text-xs text-red-600">Out of Stock</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {item.out_of_stock ? 'Out of Stock' : 'Available'}
                          </span>
                          <Switch
                            checked={!item.out_of_stock}
                            onCheckedChange={() => toggleItemStock(item.id, item.out_of_stock)}
                            disabled={updating}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CafeManagement;
