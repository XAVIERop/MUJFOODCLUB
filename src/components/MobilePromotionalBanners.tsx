import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  badge?: string;
  badgeIcon?: string;
  cafeId: string;
}

const PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'chatkara',
    title: 'Chatkara',
    subtitle: 'Authentic North Indian flavors',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-orange-600',
    textColor: 'text-white',
    badge: 'POPULAR',
    badgeIcon: '🔥',
    cafeId: 'chatkara',
  },
  {
    id: 'food-court',
    title: 'Food Court',
    subtitle: 'Variety of cuisines under one roof',
    buttonText: 'EXPLORE',
    backgroundColor: 'bg-green-600',
    textColor: 'text-white',
    badge: 'MULTI-CUISINE',
    badgeIcon: '🍽️',
    cafeId: 'food-court',
  },
  {
    id: 'mini-meals',
    title: 'Mini Meals',
    subtitle: 'Quick bites & light meals',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-purple-600',
    textColor: 'text-white',
    badge: 'QUICK',
    badgeIcon: '⚡',
    cafeId: 'mini-meals',
  },
  {
    id: 'punjabi-tadka',
    title: 'Punjabi Tadka',
    subtitle: 'Spicy Punjabi delights',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-red-600',
    textColor: 'text-white',
    badge: 'SPICY',
    badgeIcon: '🌶️',
    cafeId: 'punjabi-tadka',
  },
  {
    id: 'munch-box',
    title: 'Munch Box',
    subtitle: 'Snacks & beverages',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-blue-600',
    textColor: 'text-white',
    badge: 'SNACKS',
    badgeIcon: '🍿',
    cafeId: 'munch-box',
  },
  {
    id: 'cook-house',
    title: 'Cook House',
    subtitle: 'Home-style cooking',
    buttonText: 'ORDER NOW',
    backgroundColor: 'bg-yellow-600',
    textColor: 'text-white',
    badge: 'HOMESTYLE',
    badgeIcon: '🏠',
    cafeId: 'cook-house',
  },
];

const MobilePromotionalBanners: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleBannerClick = (cafeId: string) => {
    navigate(`/cafes/${cafeId}`);
  };

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
            className={`relative rounded-xl overflow-hidden ${banner.backgroundColor} w-[260px] h-32 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => handleBannerClick(banner.cafeId)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(banner.cafeId);
                }}
              >
                {banner.buttonText}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilePromotionalBanners;