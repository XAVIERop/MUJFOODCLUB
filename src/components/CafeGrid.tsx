import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
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

interface CafeGridProps {
  showAll?: boolean;
  maxCafes?: number;
  cafes?: Cafe[]; // Accept cafes as prop
}

export const CafeGrid: React.FC<CafeGridProps> = ({ showAll = false, maxCafes = 3, cafes: propCafes }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Debug logging
  console.log('CafeGrid props received:', { showAll, maxCafes, propCafes: propCafes?.length || 0 });
  if (propCafes && propCafes.length > 0) {
    console.log('First 3 cafes from props:', propCafes.slice(0, 3).map(c => c.name));
  }

  useEffect(() => {
    if (propCafes && propCafes.length > 0) {
      // Use cafes passed from parent
      console.log('Using cafes from props:', propCafes.map(c => c.name));
      setCafes(propCafes);
      setLoading(false);
    } else {
      // No cafes provided, show empty state
      console.log('No cafes provided via props');
      setCafes([]);
      setLoading(false);
    }
  }, [propCafes]);

  const fetchCafes = async () => {
    try {
      console.log('Fetching cafes...');
      
      // Use the priority-based ordering function
      let { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.error('Error fetching cafes:', error);
        throw error;
      }

      // Ensure data is an array
      const cafesData = Array.isArray(data) ? data : [];
      
      console.log('Raw cafes data:', cafesData);
      console.log('Total cafes found:', cafesData.length);
      
      // Log each cafe name to see what's available
      cafesData.forEach((cafe: any, index) => {
        console.log(`Cafe ${index + 1}:`, {
          name: cafe.name,
          priority: cafe.priority,
          accepting_orders: cafe.accepting_orders,
          average_rating: cafe.average_rating,
          total_ratings: cafe.total_ratings,
          cuisine_categories: cafe.cuisine_categories
        });
      });

      // Filter cafes that are accepting orders (if the column exists)
      let filteredCafes = cafesData;
      
      // Check if accepting_orders column exists and filter accordingly
      if (cafesData.length > 0 && 'accepting_orders' in cafesData[0]) {
        console.log('accepting_orders column exists, showing all cafes...');
        filteredCafes = cafesData; // Show all cafes, don't filter out closed ones
        console.log('Showing all cafes:', filteredCafes.length, 'cafes');
      } else {
        console.log('accepting_orders column does not exist, skipping filter');
        filteredCafes = cafesData;
      }

      // Cafes are already ordered by priority, rating, and name from the database function
      console.log('Filtered cafes (already ordered by priority):', filteredCafes);
      console.log('Final cafe names:', filteredCafes.map(c => c.name));

      // Limit cafes if not showing all
      const limitedCafes = showAll ? filteredCafes : filteredCafes.slice(0, maxCafes);
      console.log('Limited cafes for display:', limitedCafes.map(c => c.name));
      
      setCafes(limitedCafes || []);
      
    } catch (error) {
      console.error('Error fetching cafes:', error);
      // Set empty array on error to prevent infinite loading
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(maxCafes)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cafes.map((cafe) => (
          <EnhancedCafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>

      {/* Show More Link */}
      {!showAll && cafes.length >= maxCafes && (
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
};