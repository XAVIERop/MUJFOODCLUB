import React from 'react';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useFavorites } from '../hooks/useFavorites';

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  cuisine_categories: string[] | null;
}

interface EnhancedCafeCardProps {
  cafe: Cafe;
  showAll?: boolean;
}

export const EnhancedCafeCard: React.FC<EnhancedCafeCardProps> = ({ cafe, showAll = false }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const getCafeImage = () => {
    // Map cafe names to their respective card images (preferred) or logo images
    const cafeImages: { [key: string]: string } = {
      'Dialog': '/dialog_card.jpg',
      'Chatkara': '/chatkara_card.png',
      'Mini Meals': '/minimeals_card.png',
      'Cook House': '/cookhouse_card.png',
      'Dev Sweets & Snacks': '/devsweets_card.png',
      'Taste of India': '/tasteofind_logo.jpeg',
      'Food Court': '/foodcourt_logo.png',
      'The Kitchen Curry': '/thekitchencurry_logo.png',
      'Havmor': '/havmor_logo.png',
      'Stardom': '/stardom_logo.jpg',
      'Waffle Fit & Fresh': '/wafflefit&fresh_logo.png',
      'The Crazy Chef': '/crazychef_logo.png',
      'Zero Degree Cafe': '/zerodegreecafe_logo.jpg',
      'Zaika Restaurant': '/zaika_logo.png',
      'Italian Oven': '/italianoven_logo.png',
      'Munch Box': '/munchbox_logo.png',
      'Punjabi Tadka': '/punjabitadka_logo.png',
      'The Waffle Co': '/thewaffleco.png'
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
    navigate(`/menu/${cafeId}`);
  };

  const handleOrderNow = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
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

  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer ${
        !cafe.accepting_orders ? 'opacity-75 grayscale' : ''
      }`}
      onClick={() => handleViewMenu(cafe.id)}
    >
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
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
            {cafe.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-800">
                {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
              </span>
              {cafe.total_ratings && cafe.total_ratings > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  ({cafe.total_ratings})
                </span>
              )}
            </div>
            
            {/* Cuisine Categories */}
            {cafe.cuisine_categories && cafe.cuisine_categories.length > 0 && (
              <div className="flex gap-1">
                {cafe.cuisine_categories.slice(0, 2).map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-white/90 text-gray-700">
                    {category}
                  </Badge>
                ))}
              </div>
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
              <span>GHS Hostel</span>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewMenu(cafe.id)}
              className="text-xs font-medium hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all duration-200"
            >
              View Menu
            </Button>
            <Button
              size="sm"
              onClick={() => handleOrderNow(cafe.id)}
              disabled={!cafe.accepting_orders}
              className="text-xs font-medium bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Order Now
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleWhatsApp(cafe.phone, cafe.name)}
              className="text-xs text-gray-600 hover:text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
