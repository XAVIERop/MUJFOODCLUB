import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const MobileFloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount, getTotalAmount, cart, cafe } = useCart();
  
  const itemCount = getItemCount();
  const totalAmount = getTotalAmount();

  // Don't render if no items or not on a menu/grocery page
  if (itemCount === 0 || (!location.pathname.startsWith('/menu/') && !location.pathname.startsWith('/grocery'))) return null;

  const handleViewCart = () => {
    // Navigate to checkout with cart data, just like desktop
    if (!cafe) {
      console.error('No cafe data available for checkout');
      return;
    }
    
    navigate('/checkout', {
      state: {
        cart,
        cafe,
        totalAmount
      }
    });
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-[60]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} added
          </span>
        </div>
        <button 
          onClick={handleViewCart}
          className="bg-white text-green-600 px-4 py-1.5 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
        >
          <span>View Cart</span>
          <span>&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default MobileFloatingCart;
