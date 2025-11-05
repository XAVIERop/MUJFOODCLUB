import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingBag, Package } from 'lucide-react';
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


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden shadow-lg">
      <div className="flex items-center justify-center gap-4 sm:gap-6 py-2 px-2">
        {/* Home Tab */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 ${
            isActive('/') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${isActive('/') ? 'text-primary' : ''}`} />
          <span className="text-[11px] font-medium">Home</span>
        </button>

        {/* Food Tab */}
        <button
          onClick={() => navigate('/cafes')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 ${
            isActive('/cafes') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Store className={`w-5 h-5 mb-0.5 ${isActive('/cafes') ? 'text-primary' : ''}`} />
          <span className="text-[11px] font-medium">Food</span>
        </button>

        {/* Grabit Tab */}
        <button
          onClick={() => navigate('/grabit')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 ${
            isActive('/grabit') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 mb-0.5 ${isActive('/grabit') ? 'text-primary' : ''}`} />
          <span className="text-[11px] font-medium">Grabit</span>
        </button>

        {/* Track Order Tab */}
        <button
          onClick={() => navigate('/orders')}
          className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition-all duration-200 ${
            isActive('/orders') 
              ? 'text-primary bg-primary/10' 
              : 'text-gray-600 hover:text-primary hover:bg-gray-50'
          }`}
        >
          <Package className={`w-5 h-5 mb-0.5 ${isActive('/orders') ? 'text-primary' : ''}`} />
          <span className="text-[11px] font-medium">Orders</span>
        </button>

      </div>
      
      {/* Home Indicator for iOS - More compact */}
      <div className="w-20 h-0.5 bg-gray-300 rounded-full mx-auto mb-1"></div>
    </div>
  );
};

export default BottomNavigation;


      </div>
      
      {/* Home Indicator for iOS - More compact */}
      <div className="w-20 h-0.5 bg-gray-300 rounded-full mx-auto mb-1"></div>
    </div>
  );
};

export default BottomNavigation;
