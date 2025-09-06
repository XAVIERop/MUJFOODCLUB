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

  // Map categories to icons and colors
  const getCategoryInfo = (type: string) => {
    const categoryMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      'Pizza': { icon: '🍕', color: 'text-red-600', bgColor: 'bg-red-50' },
      'North Indian': { icon: '🍛', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      'Chinese': { icon: '🥢', color: 'text-red-600', bgColor: 'bg-red-50' },
      'Sandwiches': { icon: '🥪', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'Deserts': { icon: '🍰', color: 'text-pink-600', bgColor: 'bg-pink-50' },
      'Quick Bites': { icon: '🍔', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'Chaap': { icon: '🥘', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      'Coffee': { icon: '☕', color: 'text-brown-600', bgColor: 'bg-brown-50' },
      'Momos': { icon: '🥟', color: 'text-green-600', bgColor: 'bg-green-50' },
      'Rolls': { icon: '🌯', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      'Combos': { icon: '🍱', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      'Waffles': { icon: '🧇', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'Multi Cuisine': { icon: '🍽️', color: 'text-gray-600', bgColor: 'bg-gray-50' },
    };

    return categoryMap[type] || { icon: '🍽️', color: 'text-gray-600', bgColor: 'bg-gray-50' };
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
            <Card
              key={category}
              className="flex-shrink-0 w-20 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCategoryClick(category)}
            >
              <CardContent className="p-3 text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${categoryInfo.bgColor} flex items-center justify-center`}>
                  <span className="text-2xl">{categoryInfo.icon}</span>
                </div>
                <p className="text-xs font-medium text-gray-700 truncate">{category}</p>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default CafeCategories;
