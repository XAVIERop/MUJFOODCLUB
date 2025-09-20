import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FoodCategory {
  id: string;
  name: string;
  emoji: string;
}

const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'pasta', name: 'Pasta', emoji: '🍝' },
  { id: 'burgers', name: 'Burgers', emoji: '🍔' },
  { id: 'chinese', name: 'Chinese', emoji: '🥢' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'fast-food', name: 'Fast Food', emoji: '🍟' },
  { id: 'beverages', name: 'Beverages', emoji: '🥤' },
  { id: 'snacks', name: 'Snacks', emoji: '🍿' },
  { id: 'healthy', name: 'Healthy', emoji: '🥗' },
];

const MobileFoodCategories: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white px-4 py-4">
      <div className="relative">
        {/* Left Scroll Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </Button>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 shadow-lg"
          onClick={scrollRight}
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </Button>

        {/* Categories Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FOOD_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center space-y-2 min-w-[60px] cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl hover:bg-orange-50 transition-colors">
                {category.emoji}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileFoodCategories;
