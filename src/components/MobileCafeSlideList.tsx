import React, { useRef } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

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
}

interface MobileCafeSlideListProps {
  cafes: Cafe[];
}

const MobileCafeSlideList: React.FC<MobileCafeSlideListProps> = ({ cafes }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get first 10 cafes (the ones accepting orders) for the slide list
  const featuredCafes = cafes
    .filter(cafe => cafe.accepting_orders)
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, 10);

  if (featuredCafes.length === 0) {
    return null;
  }

  // Use same cafe images as desktop EnhancedCafeCard
  const getCafeImage = (cafeName: string): string => {
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
      'LETS GO LIVE': '/letsgolive_card.jpg'
    };

    // Try to find exact match first
    if (cafeImages[cafeName]) {
      return cafeImages[cafeName];
    }

    // Try partial matches for variations in naming
    const cafeNameLower = cafeName.toLowerCase();
    for (const [cafeKey, imagePath] of Object.entries(cafeImages)) {
      if (cafeNameLower.includes(cafeKey.toLowerCase()) || cafeKey.toLowerCase().includes(cafeNameLower)) {
        return imagePath;
      }
    }

    // Fallback to chatkara logo if no match found
    return '/chatkara_logo.jpg';
  };

  return (
    <div className="bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Featured Cafes</h3>
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          {featuredCafes.length} Available
        </Badge>
      </div>

      {/* Cafes Scroll Container - Simple scroll like food categories */}
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredCafes.map((cafe) => (
          <Link
            to={`/menu/${cafe.slug || cafe.id}`}
            key={cafe.id}
            className="min-w-[240px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Real Cafe Image */}
            <div className="h-32 relative overflow-hidden">
              <img
                src={getCafeImage(cafe.name)}
                alt={`${cafe.name} Food`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Cafe Info */}
            <div className="p-3">
              <div className="mb-2">
                <h4 className="font-bold text-gray-900 text-sm truncate">
                  {cafe.name}
                </h4>
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
                className={`w-full text-white text-xs font-medium ${
                  cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('food court')
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('food court')
                  ? "Order Now"
                  : "Coming Soon"
                }
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileCafeSlideList;
