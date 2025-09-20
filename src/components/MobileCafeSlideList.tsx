import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Cafe {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  priority: number | null;
}

interface MobileCafeSlideListProps {
  cafes: Cafe[];
}

const MobileCafeSlideList: React.FC<MobileCafeSlideListProps> = ({ cafes }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Get first 6 cafes (the ones accepting orders) for the slide list
  const featuredCafes = cafes
    .filter(cafe => cafe.accepting_orders)
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, 6);

  if (featuredCafes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Featured Cafes</h3>
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          {featuredCafes.length} Available
        </Badge>
      </div>

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

        {/* Cafes Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredCafes.map((cafe) => (
            <div
              key={cafe.id}
              className="min-w-[240px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Cafe Image Placeholder */}
              <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>

              {/* Cafe Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {cafe.name}
                  </h4>
                  {cafe.average_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {cafe.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{cafe.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{cafe.hours}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium"
                >
                  Order Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCafeSlideList;
