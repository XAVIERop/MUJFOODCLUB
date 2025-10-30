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

  // Structured selections for Let's Go Live pasta builder
  const pastaTypes = [
    'Macaroni', 'Penne', 'Fusilli', 'Spaghetti'
  ];
  const sauces = [
    'White Sauce', 'Red Sauce', 'Pink Sauce', 'Makhani Sauce', 'Kadhai Sauce', 'Bhuna Masala'
  ];
  const veggies = [
    'Broccoli', 'Green Pepper', 'Red Pepper', 'Yellow Pepper', 'Tomato',
    'Mushroom', 'Jalapeno', 'Corn', 'Zucchini', 'Baby Corn',
    'Black Olives', 'Red Paprika', 'Onion'
  ];
  const proteins = [
    'Spicy Chicken', 'Salami', 'Sausages', 'Herby Chicken'
  ];

  const [selectedPastaType, setSelectedPastaType] = useState<string>('');
  const [selectedSauce, setSelectedSauce] = useState<string>('');
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>([]);
  const [selectedProtein, setSelectedProtein] = useState<string>('');

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

    // Build a structured summary as add-ons text for downstream notes
    const parts: string[] = [];
    if (selectedPastaType) parts.push(`Pasta: ${selectedPastaType}`);
    if (selectedSauce) parts.push(`Sauce: ${selectedSauce}`);
    if (selectedVeggies.length > 0) parts.push(`Veggies: ${selectedVeggies.join(', ')}`);
    if (!item.is_vegetarian && selectedProtein) parts.push(`Protein: ${selectedProtein}`);

    const consolidated = parts.length ? parts : [];

    onAddToCart(item, selectedPortion, consolidated, quantity, notes);
    onClose();
    
    // Reset form
    setSelectedPortion('');
    setSelectedAddOns([]);
    setQuantity(1);
    setNotes('');
    setSelectedPastaType('');
    setSelectedSauce('');
    setSelectedVeggies([]);
    setSelectedProtein('');
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
          {/* Pasta Builder Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pasta Type */}
            <div>
              <h3 className="font-semibold mb-3 text-orange-600">Pasta Type (Choose 1)</h3>
              <div className="flex flex-wrap gap-2">
                {pastaTypes.map(name => (
                  <Button
                    key={name}
                    variant={selectedPastaType === name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPastaType(name)}
                    className="rounded-full text-xs"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sauce */}
            <div>
              <h3 className="font-semibold mb-3 text-orange-600">Sauce (Choose 1)</h3>
              <div className="flex flex-wrap gap-2">
                {sauces.map(name => (
                  <Button
                    key={name}
                    variant={selectedSauce === name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSauce(name)}
                    className="rounded-full text-xs"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Veggies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-orange-600">Vegetables (Choose up to 3)</h3>
              <Badge className="bg-orange-100 text-orange-700">{selectedVeggies.length}/3</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {veggies.map(name => {
                const selected = selectedVeggies.includes(name);
                const limitReached = !selected && selectedVeggies.length >= 3;
                return (
                  <Button
                    key={name}
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                    disabled={limitReached}
                    onClick={() => {
                      setSelectedVeggies(prev => selected ? prev.filter(v => v !== name) : [...prev, name]);
                    }}
                    className="rounded-full text-xs"
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Protein */}
          {!item.is_vegetarian && (
            <div>
              <h3 className="font-semibold mb-3 text-orange-600">Non‑veg Protein (Choose 1, optional)</h3>
              <div className="flex flex-wrap gap-2">
                {proteins.map(name => (
                  <Button
                    key={name}
                    variant={selectedProtein === name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProtein(prev => prev === name ? '' : name)}
                    className="rounded-full text-xs"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

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

          {/* Legacy add-ons hidden for pasta builder (not used) */}

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
              disabled={!selectedPortion || !selectedPastaType || !selectedSauce}
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



