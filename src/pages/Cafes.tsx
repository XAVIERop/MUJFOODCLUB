import React, { useState, useEffect } from 'react';
import { Star, Phone, MessageCircle, MapPin, Clock, Heart, Search, Filter, X } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { CafeRating } from '../components/CafeRating';

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

const Cafes = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCafeForRating, setSelectedCafeForRating] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, getFavoriteCafes } = useFavorites();

  // Available cuisine categories
  const cuisineCategories = [
    'All',
    'North Indian',
    'Chinese',
    'Quick Bytes',
    'Multi-Cuisine',
    'Italian',
    'Pizza',
    'Pasta',
    'Street Food',
    'Multi-Brand',
    'Ice Cream',
    'Desserts',
    'Beverages',
    'Café',
    'Lounge',
    'Waffles',
    'Fast Food',
    'Burgers'
  ];

  useEffect(() => {
    fetchCafes();
    
    // Check URL parameters for favorites
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('favorites') === 'true') {
      setShowFavoritesOnly(true);
    }
  }, []);

  useEffect(() => {
    filterCafes();
  }, [cafes, searchQuery, selectedCategory, showFavoritesOnly]);

  const fetchCafes = async () => {
    try {
      console.log('Fetching cafes for Cafes page...');
      
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
      setCafes(filteredCafes || []);
      
    } catch (error) {
      console.error('Error fetching cafes:', error);
      // Set empty array on error to prevent infinite loading
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCafes = async () => {
    let filtered = [...cafes];

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      const favoriteCafes = await getFavoriteCafes();
      const favoriteIds = favoriteCafes.map(cafe => cafe.id);
      filtered = filtered.filter(cafe => favoriteIds.includes(cafe.id));
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(cafe => 
        cafe.cuisine_categories?.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cafe =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.type.toLowerCase().includes(query) ||
        cafe.description.toLowerCase().includes(query) ||
        cafe.location.toLowerCase().includes(query) ||
        cafe.cuisine_categories?.some(cat => cat.toLowerCase().includes(query))
      );
    }

    setFilteredCafes(filtered);
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
    // Refresh the list to update favorites
    if (showFavoritesOnly) {
      filterCafes();
    }
  };

  const handleViewMenu = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const handleOrderNow = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setShowFavoritesOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cafes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Cafes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and explore all our partner cafes. Filter by cuisine, search by name, or view your favorites.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cafes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {cuisineCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorites Toggle */}
            <div>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="w-full"
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                {showFavoritesOnly ? 'All Cafes' : 'Favorites Only'}
              </Button>
            </div>

            {/* Clear Filters */}
            <div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'All' || showFavoritesOnly) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {showFavoritesOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Favorites Only
                  <button onClick={() => setShowFavoritesOnly(false)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCafes.length} of {cafes.length} cafes
          </p>
        </div>

        {/* Cafes Grid */}
        {filteredCafes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No cafes found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => (
              <div key={cafe.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                {/* Cafe Header with Gradient Background */}
                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                  {/* Favorite Button - Top Right */}
                  <button
                    onClick={() => handleFavoriteToggle(cafe.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
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

                  {/* Cafe Name and Type */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {cafe.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">{cafe.type}</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                  {/* Rating Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
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
                      <span className="text-sm font-medium text-gray-700">
                        {cafe.average_rating ? cafe.average_rating.toFixed(1) : '0.0'}
                      </span>
                      {cafe.total_ratings && (
                        <span className="text-xs text-gray-500">
                          ({cafe.total_ratings})
                        </span>
                      )}
                    </div>
                    
                    {/* Order Status Badge */}
                    <Badge
                      variant={cafe.accepting_orders ? "default" : "destructive"}
                      className="text-xs px-2 py-1"
                    >
                      {cafe.accepting_orders ? "Open" : "Closed"}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {cafe.description}
                  </p>

                  {/* Cuisine Categories */}
                  {cafe.cuisine_categories && cafe.cuisine_categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cafe.cuisine_categories.slice(0, 2).map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
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
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">{cafe.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-indigo-500" />
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
                        className="text-xs font-medium hover:bg-gray-50"
                      >
                        View Menu
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOrderNow(cafe.id)}
                        disabled={!cafe.accepting_orders}
                        className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                        className="text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
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

                    {/* Rate Cafe Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCafeForRating(cafe.id)}
                      className="w-full text-xs font-medium hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300"
                    >
                      ⭐ Rate This Cafe
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {selectedCafeForRating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Rate Cafe</h3>
                  <button
                    onClick={() => setSelectedCafeForRating(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <CafeRating
                  cafeId={selectedCafeForRating}
                  averageRating={cafes.find(c => c.id === selectedCafeForRating)?.average_rating || 0}
                  totalRatings={cafes.find(c => c.id === selectedCafeForRating)?.total_ratings || 0}
                  onRatingChange={() => {
                    setSelectedCafeForRating(null);
                    fetchCafes(); // Refresh to get updated ratings
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cafes;
