import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  item: any; // MenuItem type
  quantity: number;
  notes: string;
}

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

  const addToCart = (item: any, quantity: number = 1, notes: string = '') => {
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
