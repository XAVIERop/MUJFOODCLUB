import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const MobileFloatingCart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemCount, getTotalAmount, cart } = useCart();
  
  const itemCount = getItemCount();
  const totalAmount = getTotalAmount();

  // Don't render if no items or not on a menu page
  if (itemCount === 0 || !location.pathname.startsWith('/menu/')) return null;

  const handleViewCart = () => {
    // Simply scroll to bottom where the checkout button usually is
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 z-50 lg:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'} added
          </span>
        </div>
        <button 
          onClick={handleViewCart}
          className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          View Cart &gt;
        </button>
      </div>
    </div>
  );
};

export default MobileFloatingCart;
