import React, { memo, useCallback } from 'react';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '../hooks/use-toast';
import DirectPdfViewer from './DirectPdfViewer';

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
}

interface EnhancedCafeCardProps {
  cafe: Cafe;
  showAll?: boolean;
}

export const EnhancedCafeCard: React.FC<EnhancedCafeCardProps> = memo(({ cafe, showAll = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  // Check if this cafe is exclusive (Top 6 cafes by priority)
  const isExclusive = cafe.name.toLowerCase().includes('chatkara') || 
                     cafe.name.toLowerCase().includes('food court') ||
                     cafe.name.toLowerCase().includes('mini meals') ||
                     cafe.name.toLowerCase().includes('punjabi tadka') ||
                     cafe.name.toLowerCase().includes('munch box') ||
                     cafe.name.toLowerCase().includes('cook house') ||
                     cafe.name.toLowerCase().includes('pizza bakers') ||
                     cafe.name.toLowerCase().includes('taste of india') ||
                     cafe.name.toLowerCase().includes('havmor') ||
                     cafe.name.toLowerCase().includes('china town');

  const getCafeImage = () => {
    
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
      'Pizza Bakers': '/pizz.png',
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
      'Italian Oven': '/italianoven_logo.png',
      'Munch Box': '/munchbox_card.png',
      'Punjabi Tadka': '/punjabitadka_card.jpg',
      'The Waffle Co': '/thewaffleco.png',
      'Soya Chaap Corner': '/chatkara_logo.jpg', // Fallback for now
      'Tea Tradition': '/teatradition_card.jpeg',
      'China Town': '/china_card.png',
      'Let\'s Go Live': '/letsgolive_card.jpg',
      'LETS GO LIVE': '/letsgolive_card.jpg'
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
    const identifier = cafe.slug || cafeId;
    navigate(`/menu/${identifier}`);
  };

  const handleModernMenu = (cafeId: string) => {
    const identifier = cafe.slug || cafeId;
    navigate(`/menu-modern/${identifier}`);
  };

  const handleOrderNow = (cafeId: string) => {
    // Allow orders for cafes that are accepting orders
    if (cafe.accepting_orders) {
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

  const handleCall = (phone: string) => {
    // Show confirmation popup before calling
    if (window.confirm(`Do you want to call ${cafe.name} at ${phone}?`)) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  const handleWhatsApp = (phone: string, cafeName: string) => {
    const message = `Hi! I'd like to place an order from ${cafeName}. Can you help me?`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFavoriteToggle = (e: React.MouseEvent, cafeId: string) => {
    e.stopPropagation();
    toggleFavorite(cafeId);
  };

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
        isExclusive 
          ? 'shadow-yellow-200/50 hover:shadow-yellow-300/70' 
          : 'border border-gray-100'
      } ${
        !cafe.accepting_orders ? 'opacity-75 grayscale' : ''
      }`}
      onClick={() => handleViewMenu(cafe.id)}
      style={isExclusive ? {
        background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 20%, #ffffff 80%, #fef3c7 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '12px'
      } : {}}
    >
      {/* Exclusive Badge */}
      {isExclusive && (
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 font-bold text-xs px-3 py-1 shadow-lg border border-yellow-300">
            ⭐ EXCLUSIVE
          </Badge>
        </div>
      )}

      {/* Closed Cafe Overlay */}
      {!cafe.accepting_orders && (
        <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" />
      )}

      {/* Image Section with Dark Overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getCafeImage()}
          alt={`${cafe.name} Food`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => console.log(`✅ Image loaded successfully for ${cafe.name}:`, getCafeImage())}
          onError={(e) => {
            console.error(`❌ Image failed to load for ${cafe.name}:`, getCafeImage());
            console.error('Error details:', e);
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Favorite Button - Top Right */}
        <button
          onClick={(e) => handleFavoriteToggle(e, cafe.id)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-20 ${
            isFavorite(cafe.id)
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite(cafe.id) ? 'fill-current' : ''
            }`}
          />
        </button>
        
        {/* Cafe Name and Rating - Bottom Left */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className={`text-xl font-bold text-white mb-1 transition-colors ${
            isExclusive 
              ? 'group-hover:text-yellow-300 drop-shadow-lg' 
              : 'group-hover:text-orange-300'
          }`}>
            {cafe.name}
          </h3>
          <div className="flex items-center gap-2">
            
            {/* Discount Badge for Chatkara, Cook House, Mini Meals, Taste of India, and Food Court */}
            {(cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('taste of india')) && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xs px-2 py-1 shadow-lg border border-green-400 hover:shadow-green-400/60 hover:scale-110 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700">
                Flat 10% Off
              </Badge>
            )}
            {(cafe.name.toLowerCase().includes('food court') || cafe.name === 'FOOD COURT') && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xs px-2 py-1 shadow-lg border border-green-400 hover:shadow-green-400/60 hover:scale-110 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700">
                Flat 5% Off
              </Badge>
            )}
            {/* BOGO Offers Badge for Pizza Bakers */}
            {(cafe.name.toLowerCase().includes('pizza bakers') || cafe.name === 'Pizza Bakers') && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs px-2 py-1 shadow-lg border border-orange-400 hover:shadow-orange-400/60 hover:scale-110 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600">
                🍕 BOGO Offers
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="p-3">
        {/* Location, Timing, and Open Status - All in One Row */}
        <div className="flex justify-between items-center mb-3">
          {/* Left Side - Location and Timing */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{cafe.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>{cafe.hours}</span>
            </div>
          </div>
          
          {/* Right Side - Open Status */}
          <div className="text-right">
            <Badge
              variant={cafe.accepting_orders ? "default" : "destructive"}
              className="text-xs px-3 py-1"
            >
              {cafe.accepting_orders ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>

        {/* Action Buttons - Swiggy Style */}
        <div className="space-y-3">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            {(cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('havmor')) ? (
              <DirectPdfViewer 
                cafeName={cafe.name} 
                menuPdfUrl={
                  cafe.name.toLowerCase().includes('chatkara') ? "/chatkaramenu.pdf" : 
                  cafe.name.toLowerCase().includes('cook house') ? "/cookhousemenu.pdf" :
                  cafe.name.toLowerCase().includes('havmor') ? "/havmormenu.pdf" : ""
                }
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200"
                >
                  View Menu
                </Button>
              </DirectPdfViewer>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewMenu(cafe.id)}
                className="text-xs font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200"
              >
                View Menu
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => handleOrderNow(cafe.id)}
              disabled={!cafe.accepting_orders}
              className={`text-xs font-medium ${
                !cafe.accepting_orders
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-gray-600"
                  : cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('food court') || cafe.name.toLowerCase().includes('punjabi tadka') || cafe.name.toLowerCase().includes('munch box') || cafe.name.toLowerCase().includes('pizza bakers') || cafe.name.toLowerCase().includes('taste of india')
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
              } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-gray-600`}
            >
              {!cafe.accepting_orders
                ? "Closed"
                : cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('mini meals') || cafe.name.toLowerCase().includes('food court') || cafe.name.toLowerCase().includes('punjabi tadka') || cafe.name.toLowerCase().includes('munch box') || cafe.name.toLowerCase().includes('pizza bakers') || cafe.name.toLowerCase().includes('taste of india')
                  ? "Order Now"
                  : "Coming Soon"
              }
            </Button>
          </div>

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCall(cafe.phone)}
              className="text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>
            {cafe.name.toLowerCase().includes('havmor') ? (
              <DirectPdfViewer 
                cafeName={cafe.name} 
                menuPdfUrl="/havmormenu.pdf"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  View Menu
                </Button>
              </DirectPdfViewer>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleWhatsApp(cafe.phone, cafe.name)}
                className="text-xs text-gray-600 hover:text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
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

