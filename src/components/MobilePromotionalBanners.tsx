import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  backgroundImage?: string;
}

const PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'chatkara',
    title: '',
    subtitle: '',
    buttonText: '',
    backgroundColor: 'bg-orange-600',
    textColor: 'text-white',
    badge: '',
    badgeIcon: '',
    cafeId: 'CHATKARA',
    backgroundImage: '/chatkara_offer.jpeg',
  },
  {
    id: 'food-court',
    title: '',
    subtitle: '',
    buttonText: '',
    backgroundColor: 'bg-blue-600',
    textColor: 'text-white',
    badge: '',
    badgeIcon: '',
    cafeId: 'FOOD COURT',
    backgroundImage: '/foodcourt.png',
  },
  {
    id: 'cook-house',
    title: '',
    subtitle: '',
    buttonText: '',
    backgroundColor: 'bg-yellow-600',
    textColor: 'text-white',
    badge: '',
    badgeIcon: '',
    cafeId: 'COOK HOUSE',
    backgroundImage: '/cookhouse_offer.jpeg',
  },
  {
    id: 'pizza-bakers',
    title: '',
    subtitle: '',
    buttonText: '',
    backgroundColor: 'bg-red-600',
    textColor: 'text-white',
    badge: '',
    badgeIcon: '',
    cafeId: 'Pizza Bakers',
    backgroundImage: 'https://ik.imagekit.io/foodclub/Banners/Mobile/Pizza%20Bakers.png?updatedAt=1761896484845',
  },
  {
    id: 'punjabi-tadka',
    title: '',
    subtitle: '',
    buttonText: '',
    backgroundColor: 'bg-orange-600',
    textColor: 'text-white',
    badge: '',
    badgeIcon: '',
    cafeId: 'Punjabi Tadka',
    backgroundImage: 'https://ik.imagekit.io/foodclub/Banners/Mobile/Punjabi%20Tadka.png?updatedAt=1761896484185',
  },
];

const MobilePromotionalBanners: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleBannerClick = async (cafeName: string) => {
    try {
      // Fetch the actual cafe ID from the database using the cafe name
      const { data, error } = await supabase
        .from('cafes')
        .select('id')
        .eq('name', cafeName)
        .single();
      
      if (error || !data) {
        console.error('Error fetching cafe:', error);
        // Fallback: try to navigate to cafes page
        navigate('/cafes');
        return;
      }
      
      // Navigate to the menu page using the actual cafe ID (UUID)
      navigate(`/menu/${data.id}`);
    } catch (error) {
      console.error('Error navigating to cafe:', error);
      navigate('/cafes');
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (currentIndex + 1) % PROMOTIONAL_BANNERS.length;
        setCurrentIndex(nextIndex);
        
        // Smooth scroll to next banner
        const bannerWidth = 320 + 16; // banner width + gap
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
            className={`relative rounded-xl overflow-hidden ${banner.backgroundColor} w-[320px] h-32 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity`}
            style={banner.backgroundImage ? {
              backgroundImage: `url(${banner.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {}}
            onClick={() => handleBannerClick(banner.cafeId)}
          >
            {/* Dark overlay for background images - Removed for offer banners */}
            {banner.backgroundImage && banner.id !== 'chatkara' && banner.id !== 'cook-house' && banner.id !== 'food-court' && banner.id !== 'pizza-bakers' && banner.id !== 'punjabi-tadka' && (
              <div className="absolute inset-0 bg-black/40" />
            )}
            
            {/* Badge - Only show if badge exists */}
            {banner.badge && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                  {banner.badgeIcon && <span className="mr-1">{banner.badgeIcon}</span>}
                  {banner.badge}
                </Badge>
              </div>
            )}

            {/* Content - Only show if title exists */}
            {banner.title && (
              <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                <div>
                  <h3 className={`text-base font-bold ${banner.textColor} mb-1`}>
                    {banner.title}
                  </h3>
                  <p className={`text-xs ${banner.textColor} opacity-90 mb-2`}>
                    {banner.subtitle}
                  </p>
                </div>
                
                {banner.buttonText && (
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
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilePromotionalBanners;