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
}

interface CafeIconGridProps {
  cafes: Cafe[];
}

const CafeIconGrid: React.FC<CafeIconGridProps> = ({ cafes }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCafeClick = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
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

  // Placeholder for cafe logos - you'll replace these with actual images
  const getCafeLogo = (name: string) => {
    // For now, using colored circles as placeholders
    // You'll replace these with actual cafe logo images
    const cafeName = name.toLowerCase();
    
    if (cafeName.includes('mini') || cafeName.includes('meals')) return '🍱';
    if (cafeName.includes('chat') || cafeName.includes('kara')) return '🍛';
    if (cafeName.includes('dialog')) return '☕';
    if (cafeName.includes('zero') || cafeName.includes('degree')) return '🍦';
    if (cafeName.includes('star') || cafeName.includes('dom')) return '⭐';
    if (cafeName.includes('hav') || cafeName.includes('mor')) return '🍦';
    if (cafeName.includes('cook') || cafeName.includes('house')) return '🏠';
    if (cafeName.includes('waffle') || cafeName.includes('fit')) return '🧇';
    if (cafeName.includes('food') || cafeName.includes('court')) return '🏢';
    if (cafeName.includes('kitchen') || cafeName.includes('curry')) return '🍛';
    if (cafeName.includes('crazy') || cafeName.includes('chef')) return '👨‍🍳';
    if (cafeName.includes('zaika')) return '🍽️';
    if (cafeName.includes('italian') || cafeName.includes('oven')) return '🍕';
    if (cafeName.includes('american')) return '🍔';
    if (cafeName.includes('fast') || cafeName.includes('food')) return '🍟';
    if (cafeName.includes('burger')) return '🍔';
    if (cafeName.includes('pasta') || cafeName.includes('lasagna')) return '🍝';
    if (cafeName.includes('biryani')) return '🍚';
    if (cafeName.includes('pizza')) return '🍕';
    if (cafeName.includes('wrap') || cafeName.includes('shawarma')) return '🌯';
    if (cafeName.includes('dessert') || cafeName.includes('sweet')) return '🍰';
    if (cafeName.includes('coffee') || cafeName.includes('cafe')) return '☕';
    if (cafeName.includes('north') || cafeName.includes('indian')) return '🍛';
    if (cafeName.includes('chinese')) return '🥢';
    if (cafeName.includes('quick') || cafeName.includes('bite')) return '🍽️';
    if (cafeName.includes('multi') || cafeName.includes('cuisine')) return '🌍';
    
    return '🍽️';
  };

  return (
    <div>
      {/* Cafe Icons Row with Slide Buttons */}
      <div className="relative">
        {/* Left Slide Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Right Slide Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* Scrollable Cafe Icons Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 px-8 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cafes.map((cafe) => (
            <div
              key={cafe.id}
              onClick={() => handleCafeClick(cafe.id)}
              className="flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105 min-w-[80px]"
            >
              {/* Cafe Logo/Icon - Very Small Size */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center mb-2 group-hover:border-primary transition-colors">
                <span className="text-xl">
                  {getCafeLogo(cafe.name)}
                </span>
              </div>
              
              {/* Cafe Name - Very Small Text */}
              <div className="text-xs font-medium text-gray-800 text-center leading-tight max-w-[80px]">
                {cafe.name.length > 10 ? cafe.name.substring(0, 10) + '...' : cafe.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CafeIconGrid;
