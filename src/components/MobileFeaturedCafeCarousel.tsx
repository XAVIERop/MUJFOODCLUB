import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Cafe {
  id: string;
  name: string;
  slug?: string;
  description: string;
  location: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  priority: number | null;
  image_url?: string | null;
  type?: string;
}

interface MobileFeaturedCafeCarouselProps {
  cafes: Cafe[];
  title?: string;
}

const MobileFeaturedCafeCarousel: React.FC<MobileFeaturedCafeCarouselProps> = ({
  cafes,
  title = "Featured this week"
}) => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // First, get the top cafes by priority (regardless of open/closed status)
  const topCafes = cafes.sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 10);
  
  // Then reorder within those: open cafes first, then closed cafes
  const openCafes = topCafes.filter(cafe => cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const closedCafes = topCafes.filter(cafe => !cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const featuredCafes = [...openCafes, ...closedCafes];

  // Use same cafe images as desktop EnhancedCafeCard
  const getCafeImage = (cafe: Cafe): string => {
    if (cafe.image_url) {
      return cafe.image_url;
    }
    
    const cafeImages: { [key: string]: string } = {
      'Dialog': '/dialog_card.jpg',
      'Chatkara': '/chatkara_card.png',
      'CHATKARA': '/chatkara_card.png',
      'Mini Meals': '/minimeals_cardhome.png',
      'MINI MEALS': '/minimeals_cardhome.png',
      'Cook House': '/cookhouse_card.png',
      'COOK HOUSE': '/cookhouse_card.png',
      'Dev Sweets & Snacks': '/devsweets_card.png',
      'DEV SWEETS & SNACKS': '/devsweets_card.png',
      'Taste of India': '/tasteofindia_card.jpg',
      'Food Court': '/foodcourt_card.jpg',
      'The Kitchen Curry': '/thekitchencurry_logo.png',
      'The Kitchen & Curry': '/thekitchencurry_logo.png',
      'Havmor': '/havmor_card.jpg',
      'Pizza Bakers': '/pizz.png',
      'Stardom': '/stardom_card.webp',
      'STARDOM Café & Lounge': '/stardom_card.webp',
      'Waffle Fit & Fresh': '/wafflefitnfresh_card.jpeg',
      'Waffle Fit N Fresh': '/wafflefitnfresh_card.jpeg',
      'The Crazy Chef': '/crazychef_logo.png',
      'Zero Degree Cafe': '/zerodegreecafe_logo.jpg',
      'ZERO DEGREE CAFE': '/zerodegreecafe_logo.jpg',
      'Zaika Restaurant': '/zaika_logo.png',
      'ZAIKA': '/zaika_logo.png',
      'Italian Oven': '/italianoven_logo.png',
      'Munch Box': '/munchbox_card.png',
      'Punjabi Tadka': '/punjabitadka_card.jpg',
      'The Waffle Co': '/thewaffleco.png',
      'Soya Chaap Corner': '/chatkara_logo.jpg',
      'Tea Tradition': '/teatradition_card.jpeg',
      'China Town': '/china_card.png',
      'Let\'s Go Live': '/letsgolive_card.jpg',
      'LETS GO LIVE': '/letsgolive_card.jpg',
      'Momos Cart': '/chatkara_logo.jpg',
      'Grabit': 'https://ik.imagekit.io/foodclub/Cafe/Grabit/grabit.png?updatedAt=1762388020298'
    };

    if (cafeImages[cafe.name]) {
      return cafeImages[cafe.name];
    }

    const cafeNameLower = cafe.name.toLowerCase();
    for (const [cafeKey, imagePath] of Object.entries(cafeImages)) {
      if (cafeNameLower.includes(cafeKey.toLowerCase()) || cafeKey.toLowerCase().includes(cafeNameLower)) {
        return imagePath;
      }
    }

    return '/chatkara_logo.jpg';
  };

  // Get discount badge text for cafe
  const getDiscountBadge = (cafe: Cafe): string | null => {
    const name = cafe.name.toLowerCase();
    if (name.includes('chatkara') || name.includes('cook house') || name.includes('mini meals') || name.includes('taste of india')) {
      return 'Flat 10% Off';
    }
    if (name.includes('food court') || cafe.name === 'FOOD COURT') {
      return 'Flat 5% Off';
    }
    if (name.includes('pizza bakers') || cafe.name === 'Pizza Bakers') {
      return '🍕 BOGO Offers';
    }
    if (name.includes('dev') && name.includes('sweet')) {
      return '📞 Call Only';
    }
    return null;
  };

  // Navigate to next/previous
  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % featuredCafes.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + featuredCafes.length) % featuredCafes.length);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
  };

  // Auto-play functionality
  useEffect(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }

    if (!isAutoPlaying || featuredCafes.length <= 1) {
      return;
    }

    autoplayIntervalRef.current = setInterval(() => {
      goToNext();
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [isAutoPlaying, featuredCafes.length]);

  // Touch/swipe handlers
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext(); // Swipe left, go to next
    } else if (distance < -minSwipeDistance) {
      goToPrev(); // Swipe right, go to previous
    }
  };

  if (featuredCafes.length === 0) {
    return null;
  }

  // Get visible cards (current, prev, next)
  const getVisibleCards = () => {
    const cards = [];
    for (let i = -1; i <= 1; i++) {
      let index = current + i;
      if (index < 0) index = featuredCafes.length + index;
      if (index >= featuredCafes.length) index = index - featuredCafes.length;
      cards.push({ index, cafe: featuredCafes[index], position: i });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="w-full bg-white py-4">
      {/* Section Title */}
      <div className="px-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      {/* Custom Carousel Container - Playing Card Style with 3D Effect */}
      <div 
        ref={containerRef}
        className="relative w-full h-[360px] overflow-visible"
        style={{ zIndex: 1, isolation: 'isolate' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Render visible cards with 3D positioning */}
        {visibleCards.map(({ index, cafe, position }) => {
          const isActive = position === 0;
          const isPrev = position === -1;
          const isNext = position === 1;

          return (
            <Link
              key={`${cafe.id}-${index}`}
              to={`/menu/${cafe.slug || cafe.id}`}
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => setIsAutoPlaying(false)}
              style={{
                transform: isActive 
                  ? 'translateX(0) scale(1) translateZ(0)' 
                  : isPrev 
                    ? 'translateX(-60px) scale(0.85) translateZ(-20px)' 
                    : 'translateX(60px) scale(0.85) translateZ(-20px)',
                zIndex: isActive ? 1 : isPrev ? 0 : 0,
                opacity: isActive ? 1 : 0.7,
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '85%',
                left: isActive ? '7.5%' : isPrev ? '0%' : '15%',
              }}
            >
              <div 
                className={cn(
                  "relative w-full h-[320px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500",
                  isActive && "shadow-2xl",
                  (isPrev || isNext) && "shadow-xl"
                )}
                style={{
                  transform: isActive 
                    ? 'perspective(1000px) rotateY(0deg)' 
                    : isPrev 
                      ? 'perspective(1000px) rotateY(15deg)' 
                      : 'perspective(1000px) rotateY(-15deg)',
                }}
              >
                {/* Large Cafe Image */}
                <img
                  src={getCafeImage(cafe)}
                  alt={cafe.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Open/Closed Badge - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm",
                      cafe.accepting_orders
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                    )}
                  >
                    {cafe.accepting_orders ? "Open" : "Closed"}
                  </span>
                </div>

                {/* Discount Badge - Top Left */}
                {getDiscountBadge(cafe) && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg",
                      (cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet'))
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : "bg-gradient-to-r from-green-500 to-green-600"
                    )}>
                      {getDiscountBadge(cafe)}
                    </span>
                  </div>
                )}

                {/* Text Overlay - Bottom (White Box) */}
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="bg-white rounded-t-2xl p-4 shadow-2xl">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{cafe.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{cafe.location}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span>{cafe.type || 'Multi Cuisine'}</span>
                      {cafe.accepting_orders && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                          <span>Order Now</span>
                        </>
                      )}
                    </div>
                    {getDiscountBadge(cafe) && (
                      <div className="mt-1">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md",
                          (cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet'))
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gradient-to-r from-green-500 to-green-600"
                        )}>
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          {getDiscountBadge(cafe)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center mt-6 gap-2">
        {featuredCafes.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-300 rounded-full",
              index === current
                ? "w-8 h-2 bg-orange-500"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Current Slide Indicator */}
      <div className="flex items-center justify-center mt-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {current + 1} / {featuredCafes.length}
        </span>
      </div>
    </div>
  );
};

export default MobileFeaturedCafeCarousel;

