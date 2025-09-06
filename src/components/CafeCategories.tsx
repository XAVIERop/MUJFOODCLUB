import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  cuisine_categories: string[] | null;
  priority: number | null;
}

interface CafeCategoriesProps {
  cafes: Cafe[];
}

const CafeCategories: React.FC<CafeCategoriesProps> = ({ cafes }) => {
  const navigate = useNavigate();

  // Predefined categories as requested
  const categories = [
    'Pizza',
    'North Indian',
    'Chinese',
    'Sandwiches',
    'Deserts',
    'Quick Bites',
    'Chaap',
    'Coffee',
    'Momos',
    'Rolls',
    'Combos',
    'Waffles',
    'Multi Cuisine'
  ];

  // Map categories to food images (Swiggy-style)
  const getCategoryInfo = (type: string) => {
    const categoryMap: { [key: string]: { image: string; name: string } } = {
      'Pizza': { image: '/pizza.svg', name: 'Pizza' },
      'North Indian': { image: '/tasteofindia_card.jpg', name: 'North Indian' },
      'Chinese': { image: '/china_card.png', name: 'Chinese' },
      'Sandwiches': { image: '/minimeals_card.png', name: 'Sandwiches' },
      'Deserts': { image: '/havmor_card.jpg', name: 'Deserts' },
      'Quick Bites': { image: '/munchbox_card.png', name: 'Quick Bites' },
      'Chaap': { image: '/soyachaap_card.png', name: 'Chaap' },
      'Coffee': { image: '/dialog_card.jpg', name: 'Coffee' },
      'Momos': { image: '/foodcourt_card.jpg', name: 'Momos' },
      'Rolls': { image: '/letsgolive_card.jpg', name: 'Rolls' },
      'Combos': { image: '/cookhouse_card.png', name: 'Combos' },
      'Waffles': { image: '/wafflefitnfresh_card.jpeg', name: 'Waffles' },
      'Multi Cuisine': { image: '/chatkara_card.png', name: 'Multi Cuisine' },
    };

    return categoryMap[type] || { image: '/chatkara_card.png', name: type };
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/cafes?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="bg-white pt-4 pb-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What's on your mind?</h3>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const categoryInfo = getCategoryInfo(category);
          return (
            <div
              key={category}
              className="flex-shrink-0 w-20 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img 
                    src={categoryInfo.image} 
                    alt={categoryInfo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{categoryInfo.name}</p>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default CafeCategories;
