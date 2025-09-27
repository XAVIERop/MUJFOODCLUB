import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  count: number;
}

interface FloatingMenuButtonProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  totalItems: number;
}

const FloatingMenuButton: React.FC<FloatingMenuButtonProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  totalItems
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show button after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 200);
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.floating-menu-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCategoryClick = (category: string) => {
    onCategorySelect(category);
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <div className="floating-menu-container fixed bottom-6 right-6 z-[9999]">
      {/* Floating Menu Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-20 h-20 rounded-full shadow-2xl transition-all duration-300 border-2 border-orange-500 flex flex-col items-center justify-center",
          isOpen 
            ? "bg-black hover:bg-gray-800" 
            : "bg-black hover:bg-gray-800"
        )}
        style={{ 
          zIndex: 10000,
          position: 'relative'
        }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <span className="text-white text-sm font-medium">MENU</span>
        )}
      </Button>

      {/* Category Overlay */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-80 bg-black/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/10"
          style={{ zIndex: 10001 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Recommended</h3>
            <span className="text-orange-400 text-sm font-medium">{totalItems}</span>
          </div>

          {/* Categories List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {/* All Items */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors duration-200",
                selectedCategory === 'all'
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">All Items</span>
                <span className="text-sm opacity-75">{totalItems}</span>
              </div>
            </button>

            {/* Veg/Non-veg */}
            <button
              onClick={() => handleCategoryClick('veg')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors duration-200",
                selectedCategory === 'veg'
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Vegetarian</span>
                <span className="text-sm opacity-75">
                  {categories.find(c => c.name === 'veg')?.count || 0}
                </span>
              </div>
            </button>

            <button
              onClick={() => handleCategoryClick('non-veg')}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg transition-colors duration-200",
                selectedCategory === 'non-veg'
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Non-Vegetarian</span>
                <span className="text-sm opacity-75">
                  {categories.find(c => c.name === 'non-veg')?.count || 0}
                </span>
              </div>
            </button>

            {/* Menu Categories */}
            {categories
              .filter(cat => cat.name !== 'veg' && cat.name !== 'non-veg' && cat.name !== 'all')
              .map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors duration-200",
                    selectedCategory === category.name
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{category.name}</span>
                    <span className="text-sm opacity-75">{category.count}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingMenuButton;
