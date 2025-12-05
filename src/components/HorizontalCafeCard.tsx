import React, { memo, useCallback } from 'react';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../hooks/use-toast';
import DirectPdfViewer from './DirectPdfViewer';
import { getCafeScope } from '@/utils/residencyUtils';

interface Cafe {
  id: string;
  name: string;
  slug?: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  cuisine_categories: string[] | null;
  priority: number | null;
  menu_pdf_url?: string | null;
  image_url?: string | null;
  location_scope?: 'ghs' | 'off_campus';
}

interface HorizontalCafeCardProps {
  cafe: Cafe;
  showAll?: boolean;
}

export const HorizontalCafeCard: React.FC<HorizontalCafeCardProps> = memo(({ cafe, showAll = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  const cafeScope = getCafeScope(cafe);
  const scopeLabel = cafeScope === 'off_campus' ? 'Outside Delivery' : 'GHS Only';
  const scopeBadgeClasses = cafeScope === 'off_campus'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-purple-100 text-purple-700 border border-purple-200';

  const getCafeImage = () => {
    // First, try to use the database image_url if available
    if (cafe.image_url) {
      return cafe.image_url;
    }
    
    // Map cafe names to their respective card images (preferred) or logo images
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
      'Pizza Bakers': '/pizz.png',
      'Havmor': '/havmor_card.jpg',
      'Stardom': 'https://ik.imagekit.io/foodclub/Cafe/Stardom/img.avif?updatedAt=1764240326100',
      'STARDOM Café & Lounge': 'https://ik.imagekit.io/foodclub/Cafe/Stardom/img.avif?updatedAt=1764240326100',
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
      'Soya Chaap Corner': '/chatkara_logo.jpg', // Fallback for now
      'Tea Tradition': '/teatradition_card.jpeg',
      'China Town': '/china_card.png',
      'Let\'s Go Live': '/letsgolive_card.jpg',
      'LETS GO LIVE': '/letsgolive_card.jpg',
      'BG The Food Cart': 'https://ik.imagekit.io/foodclub/Cafe/Food%20Cart/Food%20Cart.jpg?updatedAt=1763167203799',
      'Banna\'s Chowki': 'https://ik.imagekit.io/foodclub/Cafe/Banna\'s%20Chowki/PHOTO-2025-11-23-19-46-23.jpg',
      'Koko\'ro': 'https://ik.imagekit.io/foodclub/Cafe/Koko\'ro/Koko\'ro.jpeg?updatedAt=1763167147690'
    };

    // Try to find exact match first
    if (cafeImages[cafe.name]) {
      return cafeImages[cafe.name];
    }

    // Try partial matches for variations in naming
    const cafeNameLower = cafe.name.toLowerCase();
    for (const [cafeKey, imagePath] of Object.entries(cafeImages)) {
      if (cafeNameLower.includes(cafeKey.toLowerCase()) || cafeKey.toLowerCase().includes(cafeNameLower)) {
        return imagePath;
      }
    }

    // Fallback to chatkara logo if no match found
    return '/chatkara_logo.jpg';
  };

  const handleViewMenu = (cafeId: string) => {
    // Special route for Banna's Chowki
    if (cafe.name.toLowerCase().includes('banna') && cafe.name.toLowerCase().includes('chowki')) {
      navigate('/bannaschowki');
      return;
    }
    const identifier = cafe.slug || cafeId;
    navigate(`/menu/${identifier}`);
  };

  const handleOrderNow = (cafeId: string) => {
    // Allow orders for cafes that are accepting orders
    if (cafe.accepting_orders) {
      // Special route for Banna's Chowki
      if (cafe.name.toLowerCase().includes('banna') && cafe.name.toLowerCase().includes('chowki')) {
        navigate('/bannaschowki');
        return;
      }
      const identifier = cafe.slug || cafeId;
      navigate(`/menu/${identifier}`);
    } else {
      // Show coming soon message for cafes not accepting orders
      toast({
        title: "Coming Soon!",
        description: `${cafe.name} will be available for ordering soon.`,
        variant: "default",
      });
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent, cafeId: string) => {
    e.stopPropagation();
    toggleFavorite(cafeId);
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 ${
        !cafe.accepting_orders ? 'opacity-75 grayscale' : ''
      }`}
      onClick={() => handleViewMenu(cafe.id)}
    >
      <div className="absolute top-2 right-2 z-10">
        <Badge className={`${scopeBadgeClasses} text-[10px] font-semibold px-2.5 py-0.5`}>
          {scopeLabel}
        </Badge>
      </div>

      {/* Horizontal Card Layout */}
      <div className="flex">
        {/* Image Section - Left Side */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={getCafeImage()}
            alt={`${cafe.name} Food`}
            className="w-full h-full object-cover"
            onLoad={() => console.log(`✅ Image loaded successfully for ${cafe.name}:`, getCafeImage())}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target && !target.src.includes('placeholder')) {
                target.src = '/placeholder.svg';
                target.onerror = null;
              }
              console.error(`❌ Image failed to load for ${cafe.name}:`, getCafeImage());
              console.error('Error details:', e);
            }}
          />
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          {/* Top Row - Name and Bookmark */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-bold text-gray-900 truncate pr-2">
              {cafe.name}
            </h3>
            <button
              onClick={(e) => handleFavoriteToggle(e, cafe.id)}
              className={`p-1 rounded transition-all duration-200 ${
                isFavorite(cafe.id)
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite(cafe.id) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>

          {/* Middle Row - Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">{cafe.location}</span>
          </div>

          {/* Bottom Row - Rating - Temporarily Hidden */}
          {/* <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-800">
              {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
            </span>
            {cafe.total_ratings && cafe.total_ratings > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({cafe.total_ratings})
              </span>
            )}
          </div> */}
        </div>
      </div>

      {/* Closed Cafe Overlay */}
      {!cafe.accepting_orders && (
        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.showAll === nextProps.showAll &&
    prevProps.cafe.id === nextProps.cafe.id &&
    prevProps.cafe.name === nextProps.cafe.name &&
    prevProps.cafe.average_rating === nextProps.cafe.average_rating &&
    prevProps.cafe.accepting_orders === nextProps.cafe.accepting_orders
  );
});

