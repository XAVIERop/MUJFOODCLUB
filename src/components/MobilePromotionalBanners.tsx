import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  badge?: string;
  badgeIcon?: string;
}

const PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'order-now',
    title: 'Order Now',
    subtitle: 'Get your favorite meals delivered to your block',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-orange-600',
    textColor: 'text-white',
  },
  {
    id: 'special-offers',
    title: 'Special Offers',
    subtitle: 'Exclusive deals for MUJ students',
    buttonText: 'VIEW OFFERS',
    backgroundColor: 'bg-green-600',
    textColor: 'text-white',
    badge: 'LIMITED TIME',
    badgeIcon: '⚡',
  },
  {
    id: 'new-cafes',
    title: 'New Cafes',
    subtitle: 'Discover the latest additions to our food court',
    buttonText: 'EXPLORE',
    backgroundColor: 'bg-purple-600',
    textColor: 'text-white',
    badge: 'NEW',
    badgeIcon: '🆕',
  },
];

const MobilePromotionalBanners: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        const currentScroll = scrollRef.current.scrollLeft;
        
        // If we're at the end, scroll back to start
        if (currentScroll >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-4">
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

        {/* Banners Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PROMOTIONAL_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className={`relative rounded-xl overflow-hidden ${banner.backgroundColor} w-[260px] flex-shrink-0 h-32`}
            >
              {/* Badge */}
              {banner.badge && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                    {banner.badgeIcon && <span className="mr-1">{banner.badgeIcon}</span>}
                    {banner.badge}
                  </Badge>
                </div>
              )}

              {/* Content */}
              <div className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-base font-bold ${banner.textColor} mb-1`}>
                      {banner.title}
                    </h3>
                    <p className={`text-xs ${banner.textColor} opacity-90 mb-2`}>
                      {banner.subtitle}
                    </p>
                    <Button
                      size="sm"
                      className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs px-3 py-1"
                    >
                      {banner.buttonText}
                    </Button>
                  </div>
                  
                  {/* Right side image placeholder */}
                  <div className="ml-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🍽️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobilePromotionalBanners;
