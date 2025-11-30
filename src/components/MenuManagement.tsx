import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  Package,
  DollarSign,
  Eye,
  EyeOff,
  TrendingUp,
  Filter,
  Grid,
  List,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  out_of_stock: boolean;
  preparation_time: number | null;
  is_vegetarian: boolean | null;
  image_url: string | null;
  daily_stock_quantity: number | null;
  current_stock_quantity: number | null;
  last_stock_reset: string | null;
}

interface MenuManagementProps {
  cafeId: string | null;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ cafeId }) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all'); // all, available, unavailable, out_of_stock
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Editing states
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editingStockItem, setEditingStockItem] = useState<string | null>(null);
  const [editDailyStock, setEditDailyStock] = useState<string>('');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Fetch menu items
  const fetchMenuItems = async () => {
    if (!cafeId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [cafeId]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  // Filter menu items
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by availability
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(item => item.is_available && !item.out_of_stock);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.is_available);
    } else if (availabilityFilter === 'out_of_stock') {
      filtered = filtered.filter(item => item.out_of_stock);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, availabilityFilter, searchQuery]);

  // Toggle item availability
  const toggleAvailability = async (itemId: string, currentValue: boolean) => {
    if (!cafeId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentValue })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, is_available: !currentValue } : item
      ));

      toast({
        title: 'Success',
        description: `Item ${!currentValue ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Toggle out of stock status
  const toggleOutOfStock = async (itemId: string, currentValue: boolean) => {
    if (!cafeId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ out_of_stock: !currentValue })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, out_of_stock: !currentValue } : item
      ));

      toast({
        title: 'Success',
        description: `Item marked as ${!currentValue ? 'out of stock' : 'in stock'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Start editing price
  const startEditPrice = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditPrice(item.price.toString());
  };

  // Save price edit
  const savePrice = async (itemId: string) => {
    if (!cafeId) return;
    
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: newPrice })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, price: newPrice } : item
      ));

      setEditingItem(null);
      toast({
        title: 'Success',
        description: 'Price updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update price',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Cancel price edit
  const cancelEditPrice = () => {
    setEditingItem(null);
    setEditPrice('');
  };

  // Start editing daily stock
  const startEditDailyStock = (item: MenuItem) => {
    setEditingStockItem(item.id);
    setEditDailyStock(item.daily_stock_quantity?.toString() || '');
  };

  // Save daily stock
  const saveDailyStock = async (itemId: string) => {
    if (!cafeId) return;
    
    const stockValue = editDailyStock.trim() === '' ? null : parseInt(editDailyStock);
    if (stockValue !== null && (isNaN(stockValue) || stockValue < 0)) {
      toast({
        title: 'Invalid Stock',
        description: 'Please enter a valid positive number or leave empty for unlimited',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const updateData: any = { daily_stock_quantity: stockValue };
      
      // If setting daily stock for the first time, initialize current stock
      const item = menuItems.find(m => m.id === itemId);
      if (stockValue !== null && item?.current_stock_quantity === null) {
        updateData.current_stock_quantity = stockValue;
        updateData.last_stock_reset = new Date().toISOString();
      }

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { 
          ...item, 
          daily_stock_quantity: stockValue,
          current_stock_quantity: stockValue !== null && item.current_stock_quantity === null 
            ? stockValue 
            : item.current_stock_quantity
        } : item
      ));

      setEditingStockItem(null);
      setEditDailyStock('');
      toast({
        title: 'Success',
        description: stockValue !== null 
          ? `Daily stock set to ${stockValue}` 
          : 'Daily stock tracking disabled',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update daily stock',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Cancel daily stock edit
  const cancelEditDailyStock = () => {
    setEditingStockItem(null);
    setEditDailyStock('');
  };

  // Manual stock reset for a cafe
  const manualResetStock = async () => {
    if (!cafeId) return;
    
    try {
      const { error } = await supabase.rpc('manual_reset_stock', {
        p_cafe_id: cafeId
      });

      if (error) throw error;

      // Refresh menu items to get updated stock
      await fetchMenuItems();
      
      toast({
        title: 'Success',
        description: 'Stock reset successfully for all items',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset stock',
        variant: 'destructive',
      });
    }
  };

  // Bulk toggle availability
  const bulkToggleAvailability = async (makeAvailable: boolean) => {
    if (!cafeId || selectedItems.size === 0) return;

    setUpdatingItems(new Set(selectedItems));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: makeAvailable })
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        selectedItems.has(item.id) ? { ...item, is_available: makeAvailable } : item
      ));

      setSelectedItems(new Set());
      toast({
        title: 'Success',
        description: `Updated availability for ${selectedItems.size} item(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update items',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(new Set());
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!cafeId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please select a cafe to manage menu</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading menu items...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{menuItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {menuItems.filter(item => item.is_available && !item.out_of_stock).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold text-orange-600">
                  {menuItems.filter(item => !item.is_available).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {menuItems.filter(item => item.out_of_stock).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu Items</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={manualResetStock}
                title="Reset stock for all items to daily quantity"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMenuItems}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {selectedItems.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkToggleAvailability(true)}
                >
                  Enable Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkToggleAvailability(false)}
                >
                  Disable Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear ({selectedItems.size})
                </Button>
              </div>
            )}
          </div>

          {/* Menu Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => {
                const isUpdating = updatingItems.has(item.id);
                const isSelected = selectedItems.has(item.id);
                const isEditing = editingItem === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-300' : ''
                    } ${!item.is_available || item.out_of_stock ? 'opacity-60' : ''}`}
                  >
                    {/* Checkbox for bulk selection */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => new Set(prev).add(item.id));
                        } else {
                          setSelectedItems(prev => {
                            const next = new Set(prev);
                            next.delete(item.id);
                            return next;
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.is_vegetarian && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            Veg
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price Editing */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24"
                            min="0"
                            step="0.01"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                savePrice(item.id);
                              } else if (e.key === 'Escape') {
                                cancelEditPrice();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => savePrice(item.id)}
                            disabled={isUpdating}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditPrice}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right min-w-[80px]">
                            <p className="font-semibold">{formatCurrency(item.price)}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditPrice(item)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Availability Toggles */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`available-${item.id}`} className="text-sm">
                          Available
                        </Label>
                        <Switch
                          id={`available-${item.id}`}
                          checked={item.is_available}
                          onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`out-of-stock-${item.id}`} className="text-sm">
                          Out of Stock
                        </Label>
                        <Switch
                          id={`out-of-stock-${item.id}`}
                          checked={item.out_of_stock}
                          onCheckedChange={() => toggleOutOfStock(item.id, item.out_of_stock)}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    {/* Daily Stock Management */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      {editingStockItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editDailyStock}
                            onChange={(e) => setEditDailyStock(e.target.value)}
                            placeholder="Unlimited"
                            className="w-24"
                            min="0"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveDailyStock(item.id);
                              } else if (e.key === 'Escape') {
                                cancelEditDailyStock();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => saveDailyStock(item.id)}
                            disabled={isUpdating}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditDailyStock}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {item.daily_stock_quantity !== null ? (
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Daily:</span>
                                <span className="text-sm font-medium">{item.daily_stock_quantity}</span>
                              </div>
                              {item.current_stock_quantity !== null && (
                                <div className={`flex items-center gap-2 ${
                                  item.current_stock_quantity <= 0 
                                    ? 'text-red-600 font-semibold' 
                                    : item.current_stock_quantity <= 5 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                                }`}>
                                  <span className="text-xs">Current:</span>
                                  <span className="text-sm font-bold">
                                    {item.current_stock_quantity}
                                    {item.current_stock_quantity < -10 && (
                                      <Badge variant="destructive" className="ml-1 text-xs">
                                        Critical
                                      </Badge>
                                    )}
                                    {item.current_stock_quantity < 0 && item.current_stock_quantity >= -10 && (
                                      <Badge variant="outline" className="ml-1 text-xs border-orange-500 text-orange-700">
                                        Oversold
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unlimited</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditDailyStock(item)}
                            disabled={isUpdating}
                            title="Edit daily stock"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            Showing {filteredItems.length} of {menuItems.length} items
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManagement;

