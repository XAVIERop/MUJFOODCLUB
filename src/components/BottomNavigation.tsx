import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getCartItemCount = () => {
    // This would need to be connected to your cart state
    // For now, returning 0 as placeholder
    return 0;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden shadow-lg">
      <div className="flex items-center justify-around py-2 px-2">
        {/* Home Tab */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-all duration-200 ${
            isActive('/') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${isActive('/') ? 'text-primary' : ''}`} />
          <span className="text-xs font-medium">Home</span>
        </button>

        {/* Cafes Tab */}
        <button
          onClick={() => navigate('/cafes')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-all duration-200 ${
            isActive('/cafes') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Store className={`w-5 h-5 mb-1 ${isActive('/cafes') ? 'text-primary' : ''}`} />
          <span className="text-xs font-medium">Cafes</span>
        </button>

        {/* Cart Tab */}
        <button
          onClick={() => navigate('/cart')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-all duration-200 relative ${
            isActive('/cart') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <ShoppingCart className={`w-5 h-5 mb-1 ${isActive('/cart') ? 'text-primary' : ''}`} />
          <span className="text-xs font-medium">Cart</span>
          
          {/* Cart Badge */}
          {getCartItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getCartItemCount() > 9 ? '9+' : getCartItemCount()}
            </span>
          )}
        </button>
      </div>
      
      {/* Home Indicator for iOS - More compact */}
      <div className="w-24 h-0.5 bg-gray-300 rounded-full mx-auto mb-1"></div>
    </div>
  );
};

export default BottomNavigation;
