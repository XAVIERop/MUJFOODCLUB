import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  priority: number | null;
}

interface CafeIconGridProps {
  cafes: Cafe[];
}

const CafeIconGrid: React.FC<CafeIconGridProps> = ({ cafes }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCafeClick = (cafe: Cafe) => {
    // Special route for Banna's Chowki
    if (cafe.name.toLowerCase().includes('banna') && cafe.name.toLowerCase().includes('chowki')) {
      navigate('/bannaschowki');
      return;
    }
    const identifier = cafe.slug || cafe.id;
    navigate(`/menu/${identifier}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Get cafe logo image or fallback to emoji
  const getCafeLogo = (cafe: Cafe) => {
    const cafeName = cafe.name.toLowerCase();
    
    // Check if we have a logo for this cafe
    if (cafeName.includes('chatkara')) {
      return {
        type: 'image',
        src: '/chatkara_logo.jpg',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('dialog')) {
      return {
        type: 'image',
        src: '/dialog_logo.JPG',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('cook') && cafeName.includes('house')) {
      return {
        type: 'image',
        src: '/cookhouse_logo.jpg',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('hav') || cafeName.includes('mor')) {
      return {
        type: 'image',
        src: '/havmor_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('food') && cafeName.includes('court')) {
      return {
        type: 'image',
        src: '/foodcourt_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('italian') && cafeName.includes('oven')) {
      return {
        type: 'image',
        src: '/italianoven_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('mini') && cafeName.includes('meals')) {
      return {
        type: 'image',
        src: '/minimeals_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('munch') && cafeName.includes('box')) {
      return {
        type: 'image',
        src: '/munchbox_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('punjabi') && cafeName.includes('tadka')) {
      return {
        type: 'image',
        src: '/punjabitadka_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('star') && cafeName.includes('dom')) {
      return {
        type: 'image',
        src: '/stardom_logo.jpg',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('taste') && cafeName.includes('india')) {
      return {
        type: 'image',
        src: '/tasteofind_logo.jpeg',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('crazy') && cafeName.includes('chef')) {
      return {
        type: 'image',
        src: '/crazychef_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('waffle') && (cafeName.includes('fit') || cafeName.includes('fresh'))) {
      return {
        type: 'image',
        src: '/wafflefit&fresh_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('zaika')) {
      return {
        type: 'image',
        src: '/zaika_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('zero') && cafeName.includes('degree')) {
      return {
        type: 'image',
        src: '/zerodegreecafe_logo.jpg',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('kitchen') && cafeName.includes('curry')) {
      return {
        type: 'image',
        src: '/thekitchencurry_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('dev') && cafeName.includes('sweet')) {
      return {
        type: 'image',
        src: '/dev_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('china') && cafeName.includes('town')) {
      return {
        type: 'image',
        src: '/chinatown_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('tea') && cafeName.includes('tradition')) {
      return {
        type: 'image',
        src: '/teatradition_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    // Handle Let's Go Live - check for various forms including apostrophe
    if ((cafeName.includes('let') && cafeName.includes('go') && cafeName.includes('live')) || 
        cafeName.includes("let's go live") || 
        cafeName.includes('lets go live')) {
      return {
        type: 'image',
        src: '/letsgo_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('soya') && cafeName.includes('chaap')) {
      return {
        type: 'image',
        src: '/soyachaap_logo.png',
        alt: `${cafe.name} Logo`
      };
    }
    
    if (cafeName.includes('pizza') && cafeName.includes('baker')) {
      return {
        type: 'image',
        src: 'https://ik.imagekit.io/foodclub/Cafe/Pizza%20Bakers/pb%20logo.png?updatedAt=1762264154273',
        alt: `${cafe.name} Logo`
      };
    }
    
    // Fallback to emojis for other cafes
    let emoji = '🍽️'; // default
    
    if (cafeName.includes('american')) emoji = '🍔';
    else if (cafeName.includes('fast') || cafeName.includes('food')) emoji = '🍟';
    else if (cafeName.includes('burger')) emoji = '🍔';
    else if (cafeName.includes('pasta') || cafeName.includes('lasagna')) emoji = '🍝';
    else if (cafeName.includes('biryani')) emoji = '🍚';
    else if (cafeName.includes('pizza')) emoji = '🍕';
    else if (cafeName.includes('wrap') || cafeName.includes('shawarma')) emoji = '🌯';
    else if (cafeName.includes('dessert') || cafeName.includes('sweet')) emoji = '🍰';
    else if (cafeName.includes('coffee') || cafeName.includes('cafe')) emoji = '☕';
    else if (cafeName.includes('north') || cafeName.includes('indian')) emoji = '🍛';
    else if (cafeName.includes('chinese')) emoji = '🥢';
    else if (cafeName.includes('quick') || cafeName.includes('bite')) emoji = '🍽️';
    else if (cafeName.includes('multi') || cafeName.includes('cuisine')) emoji = '🌍';
    
    return {
      type: 'emoji',
      emoji: emoji
    };
  };

  return (
    <div>
      {/* Cafe Icons Row - No Slide Buttons */}
      <div className="relative">
        {/* Scrollable Cafe Icons Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 px-4 overflow-x-auto scrollbar-hide scroll-smooth justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cafes.map((cafe) => {
            const logoData = getCafeLogo(cafe);
            
            return (
              <div
                key={cafe.id}
                onClick={() => handleCafeClick(cafe)}
                className="flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105 min-w-[80px]"
              >
                {/* Cafe Logo/Icon - Very Small Size */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center mb-2 group-hover:border-primary transition-colors overflow-hidden">
                  {logoData.type === 'image' ? (
                    <img
                      src={logoData.src}
                      alt={logoData.alt}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback emoji - hidden if image is shown */}
                  <span 
                    className={`text-xl ${logoData.type === 'image' ? 'hidden' : 'block'}`}
                  >
                    {logoData.emoji}
                  </span>
                </div>
                
                {/* Cafe Name - Very Small Text */}
                <div className="text-xs font-medium text-gray-800 text-center leading-tight max-w-[80px]">
                  {cafe.name.length > 10 ? cafe.name.substring(0, 10) + '...' : cafe.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CafeIconGrid;
