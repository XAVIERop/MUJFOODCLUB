import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  item: any; // MenuItem type
  quantity: number;
  notes: string;
}

// localStorage keys
const CART_STORAGE_KEY = 'muj_food_club_cart';
const CAFE_STORAGE_KEY = 'muj_food_club_cafe';

// Helper functions for localStorage
const getCafeSpecificCartKey = (cafeId: string) => `muj_food_club_cart_${cafeId}`;

const saveCartToStorage = (cart: { [key: string]: CartItem }, cafeId?: string) => {
  try {
    if (cafeId) {
      // Save cafe-specific cart
      localStorage.setItem(getCafeSpecificCartKey(cafeId), JSON.stringify(cart));
    } else {
      // Fallback to global cart (for backward compatibility)
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const loadCartFromStorage = (cafeId?: string): { [key: string]: CartItem } => {
  try {
    if (cafeId) {
      // Load cafe-specific cart
      const saved = localStorage.getItem(getCafeSpecificCartKey(cafeId));
      return saved ? JSON.parse(saved) : {};
    } else {
      // Fallback to global cart (for backward compatibility)
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return {};
  }
};

const saveCafeToStorage = (cafe: any | null) => {
  try {
    if (cafe) {
      localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafe));
    } else {
      localStorage.removeItem(CAFE_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving cafe to localStorage:', error);
  }
};

const loadCafeFromStorage = (): any | null => {
  try {
    const saved = localStorage.getItem(CAFE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading cafe from localStorage:', error);
    return null;
  }
};

interface CartContextType {
  cart: { [key: string]: CartItem };
  setCart: (cart: { [key: string]: CartItem }) => void;
  cafe: any | null;
  setCafe: (cafe: any | null) => void;
  addToCart: (item: any, quantity?: number, notes?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
  const [cafe, setCafe] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart and cafe from localStorage on mount
  useEffect(() => {
    const savedCart = loadCartFromStorage();
    const savedCafe = loadCafeFromStorage();
    
    setCart(savedCart);
    setCafe(savedCafe);
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(cart);
    }
  }, [cart, isInitialized]);

  // Save cafe to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveCafeToStorage(cafe);
    }
  }, [cafe, isInitialized]);

  const addToCart = (item: any, quantity: number = 1, notes: string = '') => {
    console.log('✅ Adding item to cart:', {
      itemName: item.name,
      cafeName: cafe?.name,
      quantity,
      notes
    });
    
    setCart(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + quantity,
        notes: notes || prev[item.id]?.notes || ''
      }
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId]) {
        if (newCart[itemId].quantity > 1) {
          newCart[itemId].quantity -= 1;
        } else {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    // localStorage will be cleared automatically by the useEffect
  };

  const getItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };


  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      cafe,
      setCafe,
      addToCart,
      removeFromCart,
      clearCart,
      getItemCount,
      getTotalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
