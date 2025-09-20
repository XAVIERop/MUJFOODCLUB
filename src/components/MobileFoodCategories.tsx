import React, { useRef } from 'react';

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
    <div className="bg-white px-4 py-3">
      {/* Categories Scroll Container - Clean Style */}
      <div 
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FOOD_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center space-y-2 min-w-[50px] cursor-pointer"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl hover:bg-orange-50 transition-colors">
              {category.emoji}
            </div>
            <span className="text-xs text-gray-600 text-center leading-tight">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileFoodCategories;
