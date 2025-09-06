import React, { useState, useEffect, memo, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useCafesQuery } from '../hooks/useCafesQuery';
import { Button } from './ui/button';
import { EnhancedCafeCard } from './EnhancedCafeCard';
import LoadingSpinner from './LoadingSpinner';

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

interface CafeGridProps {
  showAll?: boolean;
  maxCafes?: number;
  cafes?: Cafe[]; // Accept cafes as prop
}

export const CafeGrid: React.FC<CafeGridProps> = memo(({ showAll = false, maxCafes = 3, cafes: propCafes }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Use optimized query hook for cafes data
  const { data: cafes = [], isLoading, error } = useCafesQuery({
    enabled: !propCafes || propCafes.length === 0, // Only fetch if no cafes provided via props
  });

  // Use propCafes if provided, otherwise use query data
  const displayCafes = propCafes && propCafes.length > 0 ? propCafes : cafes;
  const loading = propCafes && propCafes.length > 0 ? false : isLoading;

  // Debug logging
  console.log('CafeGrid props received:', { showAll, maxCafes, propCafes: propCafes?.length || 0 });
  if (propCafes && propCafes.length > 0) {
    console.log('First 3 cafes from props:', propCafes.slice(0, 3).map(c => c.name));
  }

  // Handle error state
  if (error) {
    console.error('Error loading cafes:', error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load cafes. Please try again.</p>
      </div>
    );
  }



  if (loading) {
    return <LoadingSpinner size="lg" text="Loading cafes..." />;
  }

  // Limit cafes if not showing all
  const limitedCafes = showAll ? displayCafes : displayCafes.slice(0, maxCafes);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {limitedCafes.map((cafe) => (
          <EnhancedCafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>

      {/* Show More Link */}
      {!showAll && displayCafes.length >= maxCafes && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/cafes')}
            className="px-8 py-3 text-base font-medium hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200"
          >
            Show All Cafes
          </Button>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.showAll === nextProps.showAll &&
    prevProps.maxCafes === nextProps.maxCafes &&
    JSON.stringify(prevProps.cafes) === JSON.stringify(nextProps.cafes)
  );
});