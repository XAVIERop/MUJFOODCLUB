import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Minus, X } from 'lucide-react';

interface Portion {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  out_of_stock: boolean;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  max_selection?: number;
}

interface GroupedMenuItem {
  baseName: string;
  category: string;
  description: string;
  preparation_time: number;
  is_vegetarian: boolean;
  portions: Portion[];
}

interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GroupedMenuItem | null;
  addOns?: AddOn[];
  onAddToCart: (item: GroupedMenuItem, selectedPortion: string, selectedAddOns: string[], quantity: number, notes: string) => void;
}

const ItemCustomizationModal = ({ 
  isOpen, 
  onClose, 
  item, 
  addOns = [], 
  onAddToCart 
}: ItemCustomizationModalProps) => {
  const [selectedPortion, setSelectedPortion] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!item) return null;

  const handleAddOnToggle = (addOnId: string, maxSelection?: number) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.includes(addOnId);
      
      if (isSelected) {
        return prev.filter(id => id !== addOnId);
      } else {
        if (maxSelection && prev.length >= maxSelection) {
          return prev; // Don't add if max selection reached
        }
        return [...prev, addOnId];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedPortion) return;
    
    onAddToCart(item, selectedPortion, selectedAddOns, quantity, notes);
    onClose();
    
    // Reset form
    setSelectedPortion('');
    setSelectedAddOns([]);
    setQuantity(1);
    setNotes('');
  };

  const getTotalPrice = () => {
    const portion = item.portions.find(p => p.id === selectedPortion);
    if (!portion) return 0;
    
    const addOnPrice = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    
    return (portion.price + addOnPrice) * quantity;
  };

  const selectedPortionData = item.portions.find(p => p.id === selectedPortion);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {item.baseName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Portion Selection */}
          <div>
            <h3 className="font-semibold mb-3 text-orange-600">
              Choose Your Portion (Required)
            </h3>
            <div className="space-y-2">
              {item.portions.map((portion) => (
                <Button
                  key={portion.id}
                  variant={selectedPortion === portion.id ? "default" : "outline"}
                  onClick={() => setSelectedPortion(portion.id)}
                  disabled={portion.out_of_stock}
                  className="w-full justify-between h-12"
                >
                  <span className="font-medium">{portion.name}</span>
                  <span className="text-lg font-bold">₹{portion.price}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Add-ons Selection */}
          {addOns.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-orange-600">
                Choose Your Add-ons (Optional)
              </h3>
              <div className="space-y-2">
                {addOns.map((addOn) => (
                  <div key={addOn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={addOn.id}
                        checked={selectedAddOns.includes(addOn.id)}
                        onChange={() => handleAddOnToggle(addOn.id, addOn.max_selection)}
                        disabled={!addOn.is_available}
                        className="w-4 h-4 text-orange-600"
                      />
                      <label htmlFor={addOn.id} className="font-medium cursor-pointer">
                        {addOn.name}
                      </label>
                    </div>
                    <span className="font-bold text-orange-600">+₹{addOn.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div>
            <h3 className="font-semibold mb-3 text-orange-600">Quantity</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <h3 className="font-semibold mb-3 text-orange-600">Special Instructions</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? (optional)"
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Total Price and Add to Cart */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-orange-600">₹{getTotalPrice()}</span>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedPortion}
              className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
            >
              Add Item - ₹{getTotalPrice()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemCustomizationModal;



