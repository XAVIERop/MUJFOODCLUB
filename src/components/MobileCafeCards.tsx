import React from 'react';
import { Star, MapPin, Clock, Heart, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Cafe {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  priority: number | null;
}

interface MobileCafeCardsProps {
  cafes: Cafe[];
}

const MobileCafeCards: React.FC<MobileCafeCardsProps> = ({ cafes }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  const handleViewMenu = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const handleOrderNow = (cafeId: string, cafeName: string, acceptingOrders: boolean) => {
    if (acceptingOrders) {
      navigate(`/menu/${cafeId}`);
    } else {
      toast({
        title: "Coming Soon!",
        description: `${cafeName} will be available for ordering soon.`,
        variant: "default",
      });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
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
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">All Cafes</h3>
        <Badge variant="outline" className="text-gray-600">
          {cafes.length} Total
        </Badge>
      </div>

      <div className="space-y-4">
        {cafes.map((cafe) => (
          <div
            key={cafe.id}
            className={`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${
              !cafe.accepting_orders ? 'opacity-75' : ''
            }`}
          >
            {/* Cafe Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                {/* Real Cafe Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={getCafeImage(cafe.name)}
                    alt={`${cafe.name} Food`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Cafe Info */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{cafe.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {cafe.average_rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600">
                          {cafe.average_rating.toFixed(1)}
                        </span>
                        {cafe.total_ratings && (
                          <span className="text-xs text-gray-400">
                            ({cafe.total_ratings})
                          </span>
                        )}
                      </div>
                    )}
                    <Badge
                      variant={cafe.accepting_orders ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {cafe.accepting_orders ? "Open" : "Coming Soon"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={(e) => handleFavoriteToggle(e, cafe.id)}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite(cafe.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </Button>
            </div>

            {/* Cafe Details */}
            <div className="p-4 space-y-3">
              {/* Location and Hours */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{cafe.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{cafe.hours}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewMenu(cafe.id)}
                  className="text-xs"
                >
                  View Menu
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOrderNow(cafe.id, cafe.name, cafe.accepting_orders)}
                  disabled={!cafe.accepting_orders}
                  className={`text-xs ${
                    cafe.accepting_orders 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {cafe.accepting_orders ? 'Order Now' : 'Coming Soon'}
                </Button>
              </div>

              {/* Contact Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCall(cafe.phone)}
                  className="flex-1 text-xs text-gray-600 hover:text-orange-600"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWhatsApp(cafe.phone, cafe.name)}
                  className="flex-1 text-xs text-gray-600 hover:text-green-600"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileCafeCards;
