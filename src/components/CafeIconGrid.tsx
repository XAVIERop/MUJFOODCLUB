import React from 'react';
import { MapPin, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

  const handleCafeClick = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const handleExploreAll = () => {
    navigate('/cafes');
  };

  // Generate cafe icon based on name
  const getCafeIcon = (name: string) => {
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
    
    // Default icons for other cafes
    return '🍽️';
  };

  // Get cafe color based on name
  const getCafeColor = (name: string) => {
    const cafeName = name.toLowerCase();
    
    if (cafeName.includes('mini') || cafeName.includes('meals')) return 'bg-orange-100 border-orange-300';
    if (cafeName.includes('chat') || cafeName.includes('kara')) return 'bg-red-100 border-red-300';
    if (cafeName.includes('dialog')) return 'bg-blue-100 border-blue-300';
    if (cafeName.includes('zero') || cafeName.includes('degree')) return 'bg-cyan-100 border-cyan-300';
    if (cafeName.includes('star') || cafeName.includes('dom')) return 'bg-yellow-100 border-yellow-300';
    if (cafeName.includes('hav') || cafeName.includes('mor')) return 'bg-green-100 border-green-300';
    if (cafeName.includes('cook') || cafeName.includes('house')) return 'bg-purple-100 border-purple-300';
    if (cafeName.includes('waffle') || cafeName.includes('fit')) return 'bg-pink-100 border-pink-300';
    if (cafeName.includes('food') || cafeName.includes('court')) return 'bg-indigo-100 border-indigo-300';
    if (cafeName.includes('kitchen') || cafeName.includes('curry')) return 'bg-amber-100 border-amber-300';
    if (cafeName.includes('crazy') || cafeName.includes('chef')) return 'bg-rose-100 border-rose-300';
    if (cafeName.includes('zaika')) return 'bg-emerald-100 border-emerald-300';
    if (cafeName.includes('italian') || cafeName.includes('oven')) return 'bg-red-100 border-red-300';
    if (cafeName.includes('american')) return 'bg-blue-100 border-blue-300';
    if (cafeName.includes('fast') || cafeName.includes('food')) return 'bg-yellow-100 border-yellow-300';
    if (cafeName.includes('burger')) return 'bg-orange-100 border-orange-300';
    if (cafeName.includes('pasta') || cafeName.includes('lasagna')) return 'bg-purple-100 border-purple-300';
    if (cafeName.includes('biryani')) return 'bg-amber-100 border-amber-300';
    if (cafeName.includes('pizza')) return 'bg-red-100 border-red-300';
    if (cafeName.includes('wrap') || cafeName.includes('shawarma')) return 'bg-green-100 border-green-300';
    if (cafeName.includes('dessert') || cafeName.includes('sweet')) return 'bg-pink-100 border-pink-300';
    if (cafeName.includes('coffee') || cafeName.includes('cafe')) return 'bg-brown-100 border-brown-300';
    if (cafeName.includes('north') || cafeName.includes('indian')) return 'bg-orange-100 border-orange-300';
    if (cafeName.includes('chinese')) return 'bg-red-100 border-red-300';
    if (cafeName.includes('quick') || cafeName.includes('bite')) return 'bg-blue-100 border-blue-300';
    if (cafeName.includes('multi') || cafeName.includes('cuisine')) return 'bg-indigo-100 border-indigo-300';
    
    // Default color
    return 'bg-gray-100 border-gray-300';
  };

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Choose From Trusted Cafes in One Single Order
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and order from all our partner cafes with just one click
          </p>
        </div>

        {/* Cafe Icons Grid */}
        <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-4 mb-8">
          {cafes.map((cafe) => (
            <div
              key={cafe.id}
              onClick={() => handleCafeClick(cafe.id)}
              className={`
                group cursor-pointer transition-all duration-200 hover:scale-105
                ${getCafeColor(cafe.name)}
                rounded-lg p-3 text-center border-2 hover:shadow-lg
              `}
            >
              {/* Cafe Icon */}
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {getCafeIcon(cafe.name)}
              </div>
              
              {/* Cafe Name */}
              <div className="text-xs font-medium text-gray-800 leading-tight">
                {cafe.name.length > 12 ? cafe.name.substring(0, 12) + '...' : cafe.name}
              </div>
              
              {/* Status Badge */}
              <div className="mt-2">
                <Badge 
                  variant={cafe.accepting_orders ? "default" : "secondary"}
                  className="text-xs px-2 py-1"
                >
                  {cafe.accepting_orders ? "Open" : "Closed"}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Cafes Button */}
        <div className="text-center">
          <Button
            onClick={handleExploreAll}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Explore All Cafes →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CafeIconGrid;
