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

  // Get unique cafe types/categories
  const categories = Array.from(new Set(cafes.map(cafe => cafe.type).filter(Boolean)));

  // Map cafe types to icons and colors
  const getCategoryInfo = (type: string) => {
    const categoryMap: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      'North Indian': { icon: '🍛', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      'South Indian': { icon: '🍽️', color: 'text-green-600', bgColor: 'bg-green-50' },
      'Chinese': { icon: '🥢', color: 'text-red-600', bgColor: 'bg-red-50' },
      'Italian': { icon: '🍝', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      'Fast Food': { icon: '🍔', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
      'Desserts': { icon: '🍰', color: 'text-pink-600', bgColor: 'bg-pink-50' },
      'Beverages': { icon: '☕', color: 'text-brown-600', bgColor: 'bg-brown-50' },
      'Street Food': { icon: '🌮', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    };

    return categoryMap[type] || { icon: '🍽️', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/cafes?category=${encodeURIComponent(category)}`);
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-4">
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
  );
};

export default CafeCategories;
