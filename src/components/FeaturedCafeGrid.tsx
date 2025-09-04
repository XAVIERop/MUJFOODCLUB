import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { Button } from './ui/button';
import { EnhancedCafeCard } from './EnhancedCafeCard';

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

interface FeaturedCafeGridProps {
  showAll?: boolean;
  maxCafes?: number;
  cafes: Cafe[]; // Required prop - no fallback
}

export const FeaturedCafeGrid: React.FC<FeaturedCafeGridProps> = ({ showAll = false, maxCafes = 3, cafes }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Debug logging with unique identifier
  console.log('🎯 FeaturedCafeGrid: Received cafes prop:', cafes.length, 'cafes');
  if (cafes.length > 0) {
    console.log('🎯 FeaturedCafeGrid: First 5 cafes from props:', cafes.slice(0, 5).map(c => `${c.name} (Priority: ${c.priority})`));
  }

  // Limit cafes if not showing all
  const limitedCafes = showAll ? cafes : cafes.slice(0, maxCafes);
  console.log('🎯 FeaturedCafeGrid: Limited cafes for display:', limitedCafes.map(c => `${c.name} (Priority: ${c.priority})`));

  if (cafes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No cafes available</h3>
        <p className="text-muted-foreground">
          Please check back later for available cafes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limitedCafes.map((cafe) => (
          <EnhancedCafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>
      
      {!showAll && cafes.length > maxCafes && (
        <div className="text-center">
          <Button 
            onClick={() => navigate('/cafes')}
            className="px-8 py-3 text-lg"
            variant="outline"
          >
            Show All Cafes
          </Button>
        </div>
      )}
    </div>
  );
};
