import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (currentIndex + 1) % PROMOTIONAL_BANNERS.length;
        setCurrentIndex(nextIndex);
        
        // Smooth scroll to next banner
        const bannerWidth = 260 + 16; // banner width + gap
        scrollRef.current.scrollTo({
          left: nextIndex * bannerWidth,
          behavior: 'smooth'
        });
      }
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="px-6 py-4">
      {/* Banners Scroll Container - No slide buttons */}
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
          {PROMOTIONAL_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className={`relative rounded-xl overflow-hidden ${banner.backgroundColor} w-[260px] h-32 flex-shrink-0`}
            >
              {/* Badge */}
              {banner.badge && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                    {banner.badgeIcon && <span className="mr-1">{banner.badgeIcon}</span>}
                    {banner.badge}
                  </Badge>
                </div>
              )}

              {/* Content */}
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  <h3 className={`text-base font-bold ${banner.textColor} mb-1`}>
                    {banner.title}
                  </h3>
                  <p className={`text-xs ${banner.textColor} opacity-90 mb-2`}>
                    {banner.subtitle}
                  </p>
                </div>
                
                <Button
                  size="sm"
                  className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs py-1 px-3 h-auto"
                >
                  {banner.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobilePromotionalBanners;
