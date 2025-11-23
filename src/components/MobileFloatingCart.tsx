import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const MobileFloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount, getTotalAmount, cart, cafe, clearCart } = useCart();
  
  const itemCount = getItemCount();
  const totalAmount = getTotalAmount();

  // Don't render if no items or not on a menu/grabit page (table orders have their own button)
  if (itemCount === 0 || (!location.pathname.startsWith('/menu/') && !location.pathname.startsWith('/grabit'))) return null;
  
  // Don't render for Dev Sweets (no online ordering)
  const isDevSweets = cafe?.name && (cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet'));
  if (isDevSweets) return null;

  const handleViewCart = () => {
    // Navigate to checkout - cart data will come from global context
    if (!cafe) {
      console.error('No cafe data available for checkout');
      return;
    }
    
    navigate('/checkout');
  };

  const handleClearCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-[60] block lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} added
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearCart}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Clear cart"
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={handleViewCart}
            className="bg-white text-green-600 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
          >
            <span>View Cart</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFloatingCart;
