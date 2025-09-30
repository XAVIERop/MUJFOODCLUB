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

  // Categories that match the database cuisine_categories
  const categories = [
    'Pizza',
    'North Indian',
    'Chinese',
    'Desserts',
    'Chaap',
    'Multi-Cuisine',
    'Waffles',
    'Ice Cream',
    'Beverages',
    'Fast Food'
  ];

  // Map categories to SVG icons
  const getCategoryInfo = (type: string) => {
    const categoryMap: { [key: string]: { image: string; name: string } } = {
      'Pizza': { image: '/pizza.svg', name: 'Pizza' },
      'North Indian': { image: '/NorthIndian.svg', name: 'North Indian' },
      'Chinese': { image: '/chinese.svg', name: 'Chinese' },
      'Desserts': { image: '/deserts.svg', name: 'Desserts' },
      'Chaap': { image: '/chaap.svg', name: 'Chaap' },
      'Multi-Cuisine': { image: '/multicuisine.svg', name: 'Multi-Cuisine' },
      'Waffles': { image: '/waffles.svg', name: 'Waffles' },
      'Ice Cream': { image: '/deserts.svg', name: 'Ice Cream' }, // Using deserts.svg as fallback
      'Beverages': { image: '/coffee.svg', name: 'Beverages' }, // Using coffee.svg as fallback
      'Fast Food': { image: '/QuickBites.svg', name: 'Fast Food' }, // Using QuickBites.svg as fallback
    };

    return categoryMap[type] || { image: '/multicuisine.svg', name: type };
  };

  const handleCategoryClick = (category: string) => {
    // Make Waffles not clickable
    if (category === 'Waffles') {
      return;
    }
    navigate(`/cafes?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="bg-white pt-4 pb-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const categoryInfo = getCategoryInfo(category);
          const isClickable = category !== 'Waffles';
          return (
            <div
              key={category}
              className={`flex-shrink-0 w-20 ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'} transition-transform`}
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
