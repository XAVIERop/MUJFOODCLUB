import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl } from '@/utils/imageSource';
import { shouldUserSeeCafe, getUserResidency } from '@/utils/residencyUtils';
import { useAuth } from '@/hooks/useAuth';

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
  location_scope?: 'ghs' | 'off_campus';
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
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const { profile } = useAuth();
  const userScope = getUserResidency(profile);

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
            .select('id, name, description, image_url, rating, total_reviews, type, location, slug, location_scope')
            .eq('is_active', true)
            .order('priority', { ascending: true })
            .limit(6);

          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
          } else {
            const filteredFallback = (fallbackData || []).filter((cafe) =>
              shouldUserSeeCafe(profile, cafe)
            );
            setCafes(filteredFallback);
          }
        } else {
          const scopedData = (data || []).filter((cafe: any) =>
            shouldUserSeeCafe(profile, cafe)
          );

          if (scopedData.length === 0) {
            setCafes([]);
            setLoading(false);
            return;
          }

          // First, get the top 10 cafes by priority (regardless of open/closed status)
          const top10Cafes = scopedData.sort((a: Cafe, b: Cafe) => (a.priority || 99) - (b.priority || 99)).slice(0, 10);
          
          // Then reorder within those 10: open cafes first, then closed cafes
          const openCafes = top10Cafes.filter(cafe => cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
          const closedCafes = top10Cafes.filter(cafe => !cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
          
          // Combine: open cafes first, then closed cafes (all within the top 10)
          const reorderedCafes = [...openCafes, ...closedCafes];
          setCafes(reorderedCafes);
        }
      } catch (error) {
        console.error('Error fetching cafes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, [profile]);

  // Get cafe card image mapping (same as EnhancedCafeCard)
  const getCafeCardImage = (cafeName: string): string => {
    const cafeImages: { [key: string]: string } = {
      'Dialog': '/dialog_card.jpg',
      'Chatkara': '/chatkara_bb.png',
      'CHATKARA': '/chatkara_bb.png',
      'Mini Meals': '/minimeals_bb.png',
      'MINI MEALS': '/minimeals_bb.png',
      'Cook House': '/cookhouse_card.png',
      'COOK HOUSE': '/cookhouse_card.png',
      'Dev Sweets & Snacks': '/devsweets_card.png',
      'DEV SWEETS & SNACKS': '/devsweets_card.png',
      'Taste of India': '/tasteofindia_card.jpg',
      'Food Court': '/cookhouse_bb.png',
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

  // Create hero banners from specific cafes
  const createHeroBanners = (): HeroBanner[] => {
    const specificBanners: HeroBanner[] = [
      {
        id: 'chatkara-banner',
        title: 'Discover Chatkara',
        subtitle: 'Delicious Food',
        description: 'Fresh ingredients, authentic flavors, student-friendly prices.',
        ctaText: 'Order Now',
        ctaAction: 'menu_chatkara',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-700',
        textColor: 'text-white',
        rating: 4.5,
        ratingCount: 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: getImageUrl('/optimized_images/chatkara_bb.webp'),
        cafeId: 'chatkara'
      },
      {
        id: 'mini-meals-banner',
        title: 'Discover Mini Meals',
        subtitle: 'Delicious Food',
        description: 'Fresh ingredients, authentic flavors, student-friendly prices.',
        ctaText: 'Order Now',
        ctaAction: 'menu_mini-meals',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-700',
        textColor: 'text-white',
        rating: 4.5,
        ratingCount: 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: getImageUrl('/optimized_images/minimeals_bb.webp'),
        cafeId: 'b09e9dcb-f7e2-4eac-87f1-a4555c4ecde7'
      },
      {
        id: 'mini-meals-special-banner',
        title: 'Discover Mini Meals Special',
        subtitle: 'Delicious Food',
        description: 'Fresh ingredients, authentic flavors, student-friendly prices.',
        ctaText: 'Order Now',
        ctaAction: 'menu_mini-meals',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-700',
        textColor: 'text-white',
        rating: 4.5,
        ratingCount: 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: getImageUrl('/optimized_images/minimeals_bbb.png'),
        cafeId: 'b09e9dcb-f7e2-4eac-87f1-a4555c4ecde7'
      },
      {
        id: 'cook-house-banner',
        title: 'Discover Cook House',
        subtitle: 'Delicious Food',
        description: 'Fresh ingredients, authentic flavors, student-friendly prices.',
        ctaText: 'Order Now',
        ctaAction: 'menu_cook-house',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-700',
        textColor: 'text-white',
        rating: 4.5,
        ratingCount: 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: getImageUrl('/optimized_images/cookhouse_bb.webp'),
        cafeId: '48cabbce-6b24-4be6-8be6-f2f01f21752b'
      },
      {
        id: 'food-court-banner',
        title: 'Discover Food Court',
        subtitle: 'Delicious Food',
        description: 'Fresh ingredients, authentic flavors, student-friendly prices.',
        ctaText: 'Order Now',
        ctaAction: 'menu_food-court',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-700',
        textColor: 'text-white',
        rating: 4.5,
        ratingCount: 100,
        features: ['Fresh Food', 'Fast Service', 'Great Prices'],
        imageUrl: getImageUrl('/optimized_images/fodcourt_bb.webp'),
        cafeId: '3e5955ba-9b90-48ce-9d07-cc686678a10e'
      }
    ];

    return specificBanners;
  };

  const heroBanners: HeroBanner[] = useMemo(() => {
    if (userScope === 'off_campus') {
      return [
        {
          id: 'outside-delivery',
          title: "Outside Cafés, Delivered",
          subtitle: "Campus Gate & PG Service",
          description: "Late-night cravings? Discover trusted partners delivering directly to MUJ gates and nearby hostels.",
          ctaText: 'Explore Options',
          ctaAction: 'scroll_to_cafes',
          backgroundColor: 'bg-gradient-to-r from-emerald-500 to-sky-600',
          textColor: 'text-white',
          rating: 4.6,
          ratingCount: 120,
          features: ['Easy delivery', 'Trusted partners', 'Late-night availability']
        },
        {
          id: 'bannas-chowki-highlight',
          title: "Banna's Chowki",
          subtitle: 'Tandoor • Rolls • Meals',
          description: "Signature tandoori nights, hearty combos, and quick bites—now just a tap away.",
          ctaText: 'View Menu',
          ctaAction: 'menu_bannas-chowki',
          backgroundColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
          textColor: 'text-white',
          rating: 4.5,
          ratingCount: 95,
          features: ['Open till 2 AM', 'Campus gate delivery', 'Student favourites'],
          cafeId: 'bannas-chowki'
        },
        {
          id: 'kokoro-highlight',
          title: "Koko'ro Korean-Italian Café",
          subtitle: 'Mocktails • Korean bowls • Pizzas',
          description: "From ramen to sushi and mocktails—discover the entire Koko'ro menu in one place.",
          ctaText: 'Explore Koko\'ro',
          ctaAction: 'menu_kokoro',
          backgroundColor: 'bg-gradient-to-r from-rose-500 to-orange-500',
          textColor: 'text-white',
          rating: 4.6,
          ratingCount: 142,
          features: ['Korean specials', 'Italian pizzas', 'Refreshing mocktails'],
          cafeId: 'kokoro'
        },
        {
          id: 'pg-discovery',
          title: 'Stay Nearby?',
          subtitle: 'Handpicked Outside Cafés',
          description: 'Browse curated lists for PG residents and off-campus students with transparent delivery options.',
          ctaText: 'Browse Cafés',
          ctaAction: 'scroll_to_cafes',
          backgroundColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
          textColor: 'text-white',
          rating: 4.4,
          ratingCount: 88,
          features: ['Verified partners', 'Clear delivery fees', 'Quick reorder']
        }
      ];
    }

    return createHeroBanners();
  }, [userScope]);

  // Preload next banner image
  useEffect(() => {
    const preloadNextImage = () => {
      const nextIndex = (currentBannerIndex + 1) % heroBanners.length;
      const nextBanner = heroBanners[nextIndex];
      
      if (nextBanner?.imageUrl && !preloadedImages.has(nextBanner.imageUrl)) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, nextBanner.imageUrl!]));
        };
        img.src = nextBanner.imageUrl;
      }
    };

    preloadNextImage();
  }, [currentBannerIndex, heroBanners, preloadedImages]);

  // Promotional cards data with background images
  const promotionalCards: PromotionalCard[] = useMemo(() => {
    if (userScope === 'off_campus') {
      return [
        {
          id: 'off-campus-curation',
          title: 'Curated Off-Campus List',
          description: 'Handpicked cafés delivering to MUJ gates & PG clusters.',
          backgroundColor: 'bg-gradient-to-br from-teal-500 to-emerald-600',
          imageUrl: undefined,
          ctaText: 'See Recommendations →',
          ctaAction: 'scroll_to_cafes'
        },
        {
          id: 'late-night-bites',
          title: 'Late-Night Bites',
          description: 'Discover kitchens serving till 2 AM around Manipal Road.',
          backgroundColor: 'bg-gradient-to-br from-slate-800 to-indigo-600',
          imageUrl: undefined,
          ctaText: 'Browse Menus →',
          ctaAction: 'scroll_to_cafes'
        },
        {
          id: 'gate-delivery',
          title: 'Gate Delivery Ready',
          description: 'Quick pickups at GHS gate with live rider updates.',
          backgroundColor: 'bg-gradient-to-br from-amber-500 to-orange-500',
          imageUrl: undefined,
          ctaText: 'Plan Your Order →',
          ctaAction: 'scroll_to_cafes'
        }
      ];
    }

    return [
      {
        id: 'cook-house-promo',
        title: 'Cook House',
        description: 'Delicious food and great service',
        backgroundColor: 'bg-gradient-to-br from-orange-400 to-yellow-500',
        imageUrl: 'https://ik.imagekit.io/foodclub/Banners/Website/web%20banners%20fc-05.jpg?updatedAt=1761686134713',
        ctaText: 'Order Now →',
        ctaAction: 'menu_48cabbce-6b24-4be6-8be6-f2f01f21752b'
      },
      {
        id: 'pizza-bakers-promo',
        title: 'Pizza Bakers',
        description: 'Buy 2 Get 1 Free on all pizzas',
        backgroundColor: 'bg-gradient-to-br from-yellow-400 to-red-500',
        imageUrl: 'https://ik.imagekit.io/foodclub/Banners/Website/web%20banners%20fc-07.jpg?updatedAt=1761686136765',
        ctaText: 'Order Now →',
        ctaAction: 'menu_9fb950ad-fa96-495a-809f-d112d4933ede'
      },
      {
        id: 'taste-of-india-promo',
        title: 'Taste of India',
        description: 'Authentic Indian cuisine',
        backgroundColor: 'bg-gradient-to-br from-red-400 to-orange-500',
        imageUrl: 'https://ik.imagekit.io/foodclub/Banners/Website/web%20banners%20fc-08.jpg?updatedAt=1761686136098',
        ctaText: 'Order Now →',
        ctaAction: 'menu_tasteofindia'
      }
    ];
  }, [userScope]);

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

    const banner = heroBanners[index];
    if (banner?.cafeId) {
      window.location.href = `/menu/${banner.cafeId}`;
    }
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
    <div className="w-full mb-8">
      {/* Desktop: Side-by-side layout, Mobile: Stacked layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Hero Banner - Left side on desktop */}
      <div 
        className={cn(
            "relative overflow-hidden rounded-xl shadow-lg flex-1 lg:flex-[2] cursor-pointer",
          currentBanner.backgroundColor,
          currentBanner.textColor
        )}
               style={{
                 backgroundImage: currentBanner.imageUrl 
                   ? `url(${currentBanner.imageUrl})`
                   : undefined,
                 backgroundSize: 'contain',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}
          onClick={() => handleBannerClick(currentBannerIndex)}
      >
          {/* Loading skeleton for banner image */}
          {!currentBanner.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          )}
          <div className="relative p-6 lg:p-8 h-full min-h-[400px] lg:min-h-[500px]">
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 w-8 h-8 p-0 z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

            <div className="flex flex-col justify-between h-full">
            {/* Content */}
              <div className="text-center lg:text-left">
              </div>

              {/* Navigation Dots - Bottom */}
              <div className="flex items-center justify-center pb-4 space-x-2">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerClick(index);
                }}
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
      </div>

        {/* Promotional Cards - Right side on desktop, stacked vertically */}
        <div className="flex flex-col gap-4 lg:flex-1">
        {promotionalCards.map((card) => (
          <div
            key={card.id}
            className={cn(
                "rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden",
              card.backgroundColor
            )}
            onClick={() => handleCtaClick(card.ctaAction)}
          >
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-full h-32" />
            )}
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
    </div>
  );
};

export default HeroBannerSection;
