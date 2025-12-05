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
  image_url?: string | null;
}

interface MobileCafeSlideListProps {
  cafes: Cafe[];
}

const MobileCafeSlideList: React.FC<MobileCafeSlideListProps> = ({ cafes }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // First, get the top 10 cafes by priority (regardless of open/closed status)
  const top10Cafes = cafes.sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 10);
  
  // Then reorder within those 10: open cafes first, then closed cafes
  const openCafes = top10Cafes.filter(cafe => cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const closedCafes = top10Cafes.filter(cafe => !cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const featuredCafes = [...openCafes, ...closedCafes];

  if (featuredCafes.length === 0) {
    return null;
  }

  // Use same cafe images as desktop EnhancedCafeCard
  const getCafeImage = (cafe: Cafe): string => {
    // First, try to use the database image_url if available
    if (cafe.image_url) {
      return cafe.image_url;
    }
    
    // Fallback to hardcoded mapping for cafes without database image_url
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
        {featuredCafes.map((cafe) => {
          // Special route for Banna's Chowki
          const menuPath = (cafe.name.toLowerCase().includes('banna') && cafe.name.toLowerCase().includes('chowki'))
            ? '/bannaschowki'
            : `/menu/${cafe.slug || cafe.id}`;
          
          return (
          <Link
            to={menuPath}
            key={cafe.id}
            className="min-w-[240px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Real Cafe Image */}
            <div className="h-32 relative overflow-hidden bg-gray-200">
              <img
                src={getCafeImage(cafe)}
                alt={`${cafe.name} Food`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target && !target.src.includes('placeholder')) {
                    target.src = '/placeholder.svg';
                    target.onerror = null;
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Open/Closed Status Badge */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant={cafe.accepting_orders ? "default" : "destructive"}
                  className={`text-xs px-2 py-1 font-semibold ${
                    cafe.accepting_orders 
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg" 
                      : "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  }`}
                >
                  {cafe.accepting_orders ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>

            {/* Cafe Info */}
            <div className="p-3">
              <div className="mb-2">
                <h4 className="font-bold text-gray-900 text-sm truncate">
                  {cafe.name}
                </h4>
                
                {/* Discount Badges for Mobile Layout */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* Flat 10% Off Badge */}
                  {(cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('taste of india')) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                      Flat 10% Off
                    </span>
                  )}
                  
                  {/* Flat 5% Off Badge */}
                  {(cafe.name.toLowerCase().includes('food court') || cafe.name === 'FOOD COURT') && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
                      Flat 5% Off
                    </span>
                  )}
                  
                  {/* BOGO Offers Badge */}
                  {(cafe.name.toLowerCase().includes('pizza bakers') || cafe.name === 'Pizza Bakers') && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                      🍕 BOGO Offers
                    </span>
                  )}
                  
                  {/* Call Only Badge for Dev Sweets */}
                  {(cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet')) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                      📞 Call Only
                    </span>
                  )}
                </div>
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
                className={`w-full text-xs font-medium ${
                  !cafe.accepting_orders
                    ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed text-white"
                    : "bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-700"
                }`}
                disabled={!cafe.accepting_orders}
              >
                {!cafe.accepting_orders ? "Closed" : "Order Now"}
              </Button>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCafeSlideList;
