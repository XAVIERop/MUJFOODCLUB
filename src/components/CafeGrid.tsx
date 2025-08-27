import React, { useState, useEffect } from 'react';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
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

interface CafeGridProps {
  showAll?: boolean;
  maxCafes?: number;
}

export const CafeGrid: React.FC<CafeGridProps> = ({ showAll = false, maxCafes = 3 }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      console.log('Fetching cafes...');
      
      // First, try to get all cafes without filtering to see what's available
      let { data, error } = await supabase
        .from('cafes')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching cafes:', error);
        throw error;
      }

      console.log('Raw cafes data:', data);

      // Filter cafes that are accepting orders (if the column exists)
      let filteredCafes = data || [];
      
      // Check if accepting_orders column exists and filter accordingly
      if (data && data.length > 0 && 'accepting_orders' in data[0]) {
        filteredCafes = data.filter((cafe: any) => cafe.accepting_orders !== false);
      }

      // Sort by rating if available, otherwise by name
      if (filteredCafes.length > 0 && 'average_rating' in filteredCafes[0]) {
        filteredCafes.sort((a: any, b: any) => {
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          if (ratingA !== ratingB) {
            return ratingB - ratingA; // Descending order
          }
          return a.name.localeCompare(b.name); // Alphabetical fallback
        });
      } else {
        filteredCafes.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }

      console.log('Filtered and sorted cafes:', filteredCafes);

      // Limit cafes if not showing all
      const limitedCafes = showAll ? filteredCafes : filteredCafes.slice(0, maxCafes);
      setCafes(limitedCafes || []);
      
    } catch (error) {
      console.error('Error fetching cafes:', error);
      // Set empty array on error to prevent infinite loading
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const handleWhatsApp = (phone: string, cafeName: string) => {
    const message = `Hi! I'm interested in ordering from ${cafeName}. Can you tell me more about your menu?`;
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFavoriteToggle = async (cafeId: string) => {
    await toggleFavorite(cafeId);
  };

  const handleViewMenu = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const handleOrderNow = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
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
          <div key={cafe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Cafe Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{cafe.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{cafe.type}</p>
                </div>
                <button
                  onClick={() => handleFavoriteToggle(cafe.id)}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite(cafe.id)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(cafe.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (cafe.average_rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
                  {cafe.total_ratings && ` (${cafe.total_ratings})`}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                {cafe.description}
              </p>

              {/* Cuisine Categories */}
              {cafe.cuisine_categories && cafe.cuisine_categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {cafe.cuisine_categories.slice(0, 3).map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Location and Hours */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{cafe.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{cafe.hours}</span>
                </div>
              </div>

              {/* Order Status */}
              <div className="mb-4">
                <Badge
                  variant={cafe.accepting_orders ? "default" : "destructive"}
                  className="text-xs"
                >
                  {cafe.accepting_orders ? "Accepting Orders" : "Not Accepting Orders"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-2 mb-3">
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
                  onClick={() => handleOrderNow(cafe.id)}
                  disabled={!cafe.accepting_orders}
                  className="text-xs"
                >
                  Order Now
                </Button>
              </div>

              {/* Contact Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCall(cafe.phone)}
                  className="text-xs flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWhatsApp(cafe.phone, cafe.name)}
                  className="text-xs flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Link */}
      {!showAll && cafes.length >= maxCafes && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/cafes')}
            className="px-8"
          >
            Show All Cafes
          </Button>
        </div>
      )}
    </div>
  );
};