import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Cafe {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  type: string;
  location: string;
  slug?: string | null;
  priority?: number | null;
  accepting_orders?: boolean;
}

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaAction: string;
  backgroundImage?: string;
  backgroundColor: string;
  textColor: string;
  rating?: number;
  ratingCount?: number;
  features: string[];
  imageUrl?: string;
  cafeId?: string;
}

interface PromotionalCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  backgroundColor: string;
  discount?: string;
  price?: string;
  ctaText: string;
  ctaAction: string;
}

const HeroBannerSection: React.FC = () => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cafes data
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // Use the RPC function for consistent ordering
        const { data, error } = await supabase
          .rpc('get_cafes_ordered');

        if (error) {
          console.error('Error fetching cafes:', error);
          // Fallback to direct table query if RPC fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('cafes')
            .select('id, name, description, image_url, rating, total_reviews, type, location, slug')
            .eq('is_active', true)
            .order('priority', { ascending: true })
            .limit(6);

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
          } else {
            setCafes(fallbackData || []);
          }
        } else {
          // Show only first 6 cafes
          const limitedCafes = (data || []).slice(0, 6);
          setCafes(limitedCafes);
        }
      } catch (error) {
        console.error('Error fetching cafes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  // Get cafe card image mapping (same as EnhancedCafeCard)
  const getCafeCardImage = (cafeName: string): string => {
    const cafeImages: { [key: string]: string } = {
      'Dialog': '/dialog_card.jpg',
      'Chatkara': '/chaap_homebanner.png',
      'CHATKARA': '/chaap_homebanner.png',
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
      'Stardom': '/stardom_card.webp',
      'STARDOM Café & Lounge': '/stardom_card.webp',
      'Waffle Fit & Fresh': '/wafflefitnfresh_card.jpeg',
      'Waffle Fit N Fresh': '/wafflefitnfresh_card.jpeg',
      'The Crazy Chef': '/crazychef_logo.png',
      'Zero Degree Cafe': '/zerodegreecafe_logo.jpg',
      'ZERO DEGREE CAFE': '/zerodegreecafe_logo.jpg',
      'Zaika Restaurant': '/zaika_logo.png',
      'ZAIKA': '/zaika_logo.png',
      'Italian Oven': '/italainoven_card.jpg',
    };

    return cafeImages[cafeName] || cafeImages[cafeName.toUpperCase()] || '/menu_hero.png';
  };

  // Create hero banners from cafe data
  const createHeroBanners = (): HeroBanner[] => {
    const defaultBanners: HeroBanner[] = [
      {
        id: 'muj-food-club',
        title: 'Experience Campus Dining at Its Finest',
        subtitle: 'Fresh Ingredients, Authentic Flavors, Student-Friendly Prices',
        description: 'Elevating Campus Dining Experiences. Indulge Your Senses. Crafting Culinary Memories.',
        ctaText: 'Explore Cafes',
        ctaAction: 'scroll_to_cafes',
        backgroundColor: 'bg-gradient-to-r from-purple-600 to-indigo-700',
        textColor: 'text-white',
        rating: 4.8,
        ratingCount: 250,
        features: ['Fresh Ingredients', 'Quick Delivery', 'Student Discounts'],
        imageUrl: '/img.png'
      }
    ];

    // Add cafe-specific banners (simplified content)
    const cafeBanners: HeroBanner[] = cafes.slice(0, 3).map((cafe, index) => {
      const imageUrl = getCafeCardImage(cafe.name);
      
      return {
        id: `cafe-${cafe.id}`,
        title: `Discover ${cafe.name}`,
        subtitle: cafe.type || 'Delicious Food',
        description: `Fresh ingredients, authentic flavors, student-friendly prices.`,
        ctaText: 'Order Now',
        ctaAction: `menu_${cafe.slug || cafe.id}`,
        backgroundColor: `bg-gradient-to-r from-blue-600 to-purple-700`,
        textColor: 'text-white',
        rating: cafe.rating || 4.5,
        ratingCount: cafe.total_reviews || 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: imageUrl,
        cafeId: cafe.id
      };
    });

    return [...defaultBanners, ...cafeBanners];
  };

  const heroBanners: HeroBanner[] = createHeroBanners();

  // Promotional cards data with background images
  const promotionalCards: PromotionalCard[] = [
    {
      id: 'pizza-special',
      title: 'Pizza Lovers Special',
      description: 'Buy 2 Get 1 Free on all pizzas',
      backgroundColor: 'bg-gradient-to-br from-yellow-400 to-red-500',
      imageUrl: '/pizza.svg',
      discount: '33% OFF',
      ctaText: 'Order Now →',
      ctaAction: 'navigate_to_pizza'
    },
    {
      id: 'chinese-delight',
      title: 'Chinese Delight',
      description: 'Hot momos and noodles',
      backgroundColor: 'bg-gradient-to-br from-red-400 to-orange-500',
      imageUrl: '/chinese.svg',
      discount: '20% OFF',
      ctaText: 'Order Now →',
      ctaAction: 'navigate_to_chinese'
    },
    {
      id: 'indian-authentic',
      title: 'Authentic Indian',
      description: 'Biryani and curry specials',
      backgroundColor: 'bg-gradient-to-br from-orange-400 to-yellow-500',
      imageUrl: '/NorthIndian.svg',
      discount: '25% OFF',
      ctaText: 'Order Now →',
      ctaAction: 'navigate_to_indian'
    }
  ];

  // Auto-rotation logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => 
        prev === heroBanners.length - 1 ? 0 : prev + 1
      );
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroBanners.length]);

  const currentBanner = heroBanners[currentBannerIndex];

  const handlePrevious = () => {
    setCurrentBannerIndex((prev) => 
      prev === 0 ? heroBanners.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentBannerIndex((prev) => 
      prev === heroBanners.length - 1 ? 0 : prev + 1
    );
  };

  const handleBannerClick = (index: number) => {
    setCurrentBannerIndex(index);
  };

  const handleCtaClick = (action: string) => {
    switch (action) {
      case 'scroll_to_cafes':
        document.querySelector('.cafe-grid')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'navigate_to_chatkara':
        window.location.href = '/menu/chatkara';
        break;
      case 'navigate_to_food_court':
        window.location.href = '/menu/food-court';
        break;
      case 'navigate_to_mini_meals':
        window.location.href = '/menu/mini-meals';
        break;
      default:
        // Handle cafe-specific actions
        if (action.startsWith('menu_')) {
          const cafeId = action.replace('menu_', '');
          window.location.href = `/menu/${cafeId}`;
        } else {
          console.log('CTA action:', action);
        }
    }
  };

  // Show loading state while fetching cafes
  if (loading) {
    return (
      <div className="w-full mb-8 space-y-6">
        <div className="relative overflow-hidden rounded-xl shadow-lg w-full bg-gradient-to-r from-purple-600 to-indigo-700">
          <div className="relative p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-white text-xl">Loading cafes...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8 space-y-6">
      {/* Full-Width Hero Banner */}
      <div 
        className={cn(
          "relative overflow-hidden rounded-xl shadow-lg w-full",
          currentBanner.backgroundColor,
          currentBanner.textColor
        )}
        style={{
          backgroundImage: currentBanner.imageUrl 
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${currentBanner.imageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

        <div className="relative p-6 lg:p-8">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0 z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex flex-col lg:flex-row items-center gap-6 max-w-6xl mx-auto">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Rating */}
              {currentBanner.rating && (
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-3">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span className="text-sm font-medium">
                    {currentBanner.rating}★ ({currentBanner.ratingCount?.toLocaleString()}+ Rating)
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl lg:text-4xl font-bold mb-2">
                {currentBanner.title}
              </h2>

              {/* Subtitle */}
              <p className="text-lg lg:text-xl opacity-90 mb-3">
                {currentBanner.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm lg:text-base opacity-80 mb-6 max-w-2xl">
                {currentBanner.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-4 mb-6 justify-center lg:justify-start">
                {currentBanner.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {index === 0 ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCtaClick(currentBanner.ctaAction)}
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-4 rounded-lg shadow-lg text-lg"
                size="lg"
              >
                {currentBanner.ctaText}
              </Button>
            </div>

          </div>

          {/* Navigation Dots */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleBannerClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentBannerIndex
                    ? "bg-white w-6"
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Promotional Cards - Horizontal Row */}
      <div className="flex flex-wrap justify-center gap-4">
        {promotionalCards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden",
              card.backgroundColor
            )}
            style={{
              width: '300px',
              height: '150px',
              backgroundImage: card.imageUrl 
                ? `url(${card.imageUrl})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={() => handleCtaClick(card.ctaAction)}
          >

            {/* Only show discount badge - no overlay text */}
            {card.discount && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-red-500 text-white text-xs">
                  {card.discount}
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSection;
