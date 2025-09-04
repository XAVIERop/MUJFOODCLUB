import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Heart } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

import { useFavorites } from '../hooks/useFavorites';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import Header from '../components/Header';
import { EnhancedCafeCard } from '../components/EnhancedCafeCard';


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

const Cafes = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);


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
    
    // Check URL parameters for favorites and search
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('favorites') === 'true') {
      setShowFavoritesOnly(true);
    }
    if (urlParams.get('search')) {
      setSearchQuery(urlParams.get('search') || '');
    }
  }, []);

  useEffect(() => {
    filterCafes();
  }, [cafes, searchQuery, selectedCategory, showFavoritesOnly]);

  const fetchCafes = async () => {
    try {
      console.log('Cafes page: Fetching cafes...');
      
      // Use the priority-based ordering function
      let { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.error('Cafes page: Error fetching cafes:', error);
        throw error;
      }

      // Ensure data is an array
      const cafesData = Array.isArray(data) ? data : [];
      
      console.log('Cafes page: Raw cafes data:', cafesData);
      console.log('Cafes page: Total cafes found:', cafesData.length);
      
      // Log each cafe name to see what's available
      cafesData.forEach((cafe: any, index) => {
        console.log(`Cafes page: Cafe ${index + 1}:`, {
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
        console.log('Cafes page: accepting_orders column exists, showing all cafes...');
        filteredCafes = cafesData; // Show all cafes, don't filter out closed ones
        console.log('Cafes page: Showing all cafes:', filteredCafes.length, 'cafes');
      } else {
        console.log('Cafes page: accepting_orders column does not exist, skipping filter');
        filteredCafes = cafesData;
      }

      // Cafes are already ordered by priority, rating, and name from the database function
      console.log('Cafes page: Cafes already ordered by priority:', filteredCafes);
      console.log('Cafes page: Final cafe names:', filteredCafes.map(c => c.name));
      
      setCafes(filteredCafes || []);
      
    } catch (error) {
      console.error('Cafes page: Error fetching cafes:', error);
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



  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setShowFavoritesOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-4">
        <Header />
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
    <div className="min-h-screen bg-muted/30 pt-4">
      <Header />
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
              <EnhancedCafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        )}


      </div>
    </div>
  );
};

export default Cafes;
