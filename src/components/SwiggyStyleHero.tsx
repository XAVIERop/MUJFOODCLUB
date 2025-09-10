import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Clock, Phone, MessageCircle, MapPin, FileText, Images } from 'lucide-react';
import DirectPdfViewer from './DirectPdfViewer';

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
}

interface SwiggyStyleHeroProps {
  cafe: Cafe;
  onBackClick: () => void;
  onMenuClick: () => void;
}

const SwiggyStyleHero: React.FC<SwiggyStyleHeroProps> = ({ 
  cafe, 
  onBackClick, 
  onMenuClick 
}) => {
  // Get cafe background image
  const getCafeImage = () => {
    const cafeImages: { [key: string]: string } = {
      'COOK HOUSE': '/cookhouse_card.png',
      'CHATKARA': '/chatkara_card.png',
      'FOOD COURT': '/foodcourt_card.jpg',
      'STARDOM': '/stardom_card.webp',
      'HAVMOR': '/havmor_card.jpg',
      'MINI MEALS': '/minimeals_card.png',
      'MUNCH BOX': '/munchbox_card.png',
      'PUNJABI TADKA': '/punjabitadka_card.jpg',
      'CHINA TOWN': '/china_card.png',
    };

    // Try exact match first
    if (cafeImages[cafe.name.toUpperCase()]) {
      return cafeImages[cafe.name.toUpperCase()];
    }

    // Try partial matches
    const cafeNameUpper = cafe.name.toUpperCase();
    for (const [cafeKey, imagePath] of Object.entries(cafeImages)) {
      if (cafeNameUpper.includes(cafeKey) || cafeKey.includes(cafeNameUpper)) {
        return imagePath;
      }
    }

    // Fallback to menu hero
    return '/menu_hero.png';
  };

  const handleCall = () => {
    window.open(`tel:${cafe.phone}`, '_blank');
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'd like to place an order from ${cafe.name}. Can you help me?`;
    const whatsappUrl = `https://wa.me/${cafe.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShowImages = () => {
    // TODO: Implement image gallery modal
    console.log('Show all images clicked');
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked for:', cafe.name);
    if (cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house')) {
      console.log('Should open PDF for:', cafe.name);
    } else {
      console.log('Should open regular menu');
      onMenuClick();
    }
  };

  return (
    <div className="relative text-white py-12 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${getCafeImage()}")`
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="text-white hover:bg-white/20 mb-4"
        >
          ← Back to Cafes
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Cafe Info */}
          <div>
            <Badge className="bg-white/20 text-white mb-4">{cafe.type}</Badge>
            <h1 className="text-4xl font-bold mb-4">{cafe.name}</h1>
            <p className="text-white/90 text-lg mb-6">
              {cafe.description}
            </p>
            
            {/* Show All Images Button - Bottom Left */}
            <Button
              onClick={handleShowImages}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white text-gray-800 border-white/20"
            >
              <Images className="w-4 h-4 mr-2" />
              Show all images
            </Button>
          </div>
          
          {/* Right Side - Swiggy Style Info Card */}
          <div className="lg:ml-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-md shadow-xl">
              {/* Rating */}
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                <span className="text-lg font-semibold text-gray-800">
                  {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  • {cafe.total_ratings || 0}+ reviews
                </span>
              </div>
              
              {/* Cost Estimate */}
              <div className="flex items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">₹200 for two</span>
              </div>
              
              {/* Cuisine Type */}
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600">{cafe.type}</span>
              </div>
              
              {/* Location */}
              <div className="flex items-start mb-4">
                <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{cafe.location}</span>
              </div>
              
              {/* Hours */}
              <div className="flex items-center mb-6">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {cafe.accepting_orders ? 'Open now' : 'Closed'} • {cafe.hours}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCall}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                
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
                      type="button"
                      onClick={handleMenuClick}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Menu
                    </Button>
                  </DirectPdfViewer>
                ) : (
                  <Button
                    onClick={onMenuClick}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Menu
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwiggyStyleHero;
