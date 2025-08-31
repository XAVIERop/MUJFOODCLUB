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
      console.log('Total cafes found:', data?.length || 0);
      
      // Log each cafe name to see what's available
      if (data) {
        data.forEach((cafe: any, index) => {
          console.log(`Cafe ${index + 1}:`, {
            name: cafe.name,
            accepting_orders: cafe.accepting_orders,
            average_rating: cafe.average_rating,
            total_ratings: cafe.total_ratings,
            cuisine_categories: cafe.cuisine_categories
          });
        });
      }

      // Filter cafes that are accepting orders (if the column exists)
      let filteredCafes = data || [];
      
      // Check if accepting_orders column exists and filter accordingly
      if (data && data.length > 0 && 'accepting_orders' in data[0]) {
        console.log('accepting_orders column exists, filtering...');
        filteredCafes = data.filter((cafe: any) => cafe.accepting_orders !== false);
        console.log('After accepting_orders filter:', filteredCafes.length, 'cafes');
      } else {
        console.log('accepting_orders column does not exist, skipping filter');
      }

      // Sort by rating if available, otherwise by name
      if (filteredCafes.length > 0 && 'average_rating' in filteredCafes[0]) {
        console.log('average_rating column exists, sorting by rating...');
        filteredCafes.sort((a: any, b: any) => {
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          if (ratingA !== ratingB) {
            return ratingB - ratingA; // Descending order
          }
          return a.name.localeCompare(b.name); // Alphabetical fallback
        });
      } else {
        console.log('average_rating column does not exist, sorting by name...');
        filteredCafes.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }

      console.log('Filtered and sorted cafes:', filteredCafes);
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
          <div key={cafe.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
            {/* Cafe Header with Original Theme */}
            <div className="relative h-24 bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
              {/* Favorite Button and Rating - Top Right */}
              <div className="flex items-center gap-2 justify-end mb-2">
                {/* Overall Rating Display */}
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-1 shadow-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-800">
                    {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
                  </span>
                  {cafe.total_ratings && cafe.total_ratings > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({cafe.total_ratings})
                    </span>
                  )}
                </div>
                
                {/* Favorite Button */}
                <button
                  onClick={() => handleFavoriteToggle(cafe.id)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isFavorite(cafe.id)
                      ? 'bg-red-500 text-white shadow-lg scale-110'
                      : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-500 hover:scale-110'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite(cafe.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Open/Close Status - Below Favorite Button */}
              <div className="flex justify-end mb-2">
                <Badge
                  variant={cafe.accepting_orders ? "default" : "destructive"}
                  className="text-xs px-2 py-1"
                >
                  {cafe.accepting_orders ? "Open" : "Closed"}
                </Badge>
              </div>

              {/* Cafe Name and Type - Bottom Left */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                  {cafe.name}
                </h3>
                <p className="text-sm text-gray-600 font-medium">{cafe.type}</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {cafe.description}
              </p>

              {/* Cuisine Categories */}
              {cafe.cuisine_categories && cafe.cuisine_categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {cafe.cuisine_categories.slice(0, 2).map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                      {category}
                    </Badge>
                  ))}
                  {cafe.cuisine_categories.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                      +{cafe.cuisine_categories.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Location and Hours - Compact */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="truncate">{cafe.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{cafe.hours}</span>
                </div>
              </div>

              {/* Action Buttons - Clean Grid */}
              <div className="space-y-3">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMenu(cafe.id)}
                    className="text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary transition-all duration-200"
                  >
                    View Menu
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOrderNow(cafe.id)}
                    disabled={!cafe.accepting_orders}
                    className="text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                    className="text-xs text-gray-600 hover:text-primary hover:bg-primary/10"
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