import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, X, Heart, Store } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

import { useFavorites } from '../hooks/useFavorites';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import Header from '../components/Header';
import { HorizontalCafeCard } from '../components/HorizontalCafeCard';
import { EnhancedCafeCard } from '../components/EnhancedCafeCard';
import CafeIconGrid from '../components/CafeIconGrid';
import CafeCategories from '../components/CafeCategories';
import MobileLayoutWrapper from '../components/MobileLayoutWrapper';


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
  menu_pdf_url?: string | null;
}

const Cafes = () => {
  const location = useLocation();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("B1");


  const { toggleFavorite, isFavorite, getFavoriteCafes } = useFavorites();

  // Available cuisine categories (matching the database cuisine_categories)
  const cuisineCategories = [
    'All',
    'Pizza',
    'North Indian',
    'Chinese',
    'Desserts',
    'Chaap',
    'Multi-Cuisine',
    'Waffles',
    'Ice Cream',
    'Beverages',
    'Fast Food'
  ];

  useEffect(() => {
    fetchCafes();
    
    // Check URL parameters for favorites, search, and category
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('favorites') === 'true') {
      setShowFavoritesOnly(true);
    }
    if (urlParams.get('search')) {
      setSearchQuery(urlParams.get('search') || '');
    }
    if (urlParams.get('category')) {
      setSelectedCategory(urlParams.get('category') || 'All');
    }
  }, []);

  // Listen to URL parameter changes (when user clicks different categories)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
    
    const favoritesParam = urlParams.get('favorites');
    if (favoritesParam === 'true' && !showFavoritesOnly) {
      setShowFavoritesOnly(true);
    } else if (favoritesParam !== 'true' && showFavoritesOnly) {
      setShowFavoritesOnly(false);
    }
    
    const searchParam = urlParams.get('search');
    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || '');
    }
  }, [location.search]); // This will trigger when URL changes

  // Real-time subscription for cafe updates (ratings, etc.)
  useEffect(() => {
    const channel = supabase
      .channel('cafes-page-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'cafes'
        }, 
        (payload) => {
          // Update the specific cafe in the state
          setCafes(prevCafes => 
            prevCafes.map(cafe => 
              cafe.id === payload.new.id 
                ? { ...cafe, ...payload.new }
                : cafe
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterCafes();
  }, [cafes, searchQuery, selectedCategory, showFavoritesOnly]);

  const fetchCafes = async () => {
    try {
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
      
      // Show only first 10 cafes
      const limitedCafes = filteredCafes.slice(0, 10);
      console.log('Cafes page: Limited to first 10 cafes:', limitedCafes.map(c => c.name));
      
      setCafes(limitedCafes || []);
      
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
    <div className="block">
      <MobileLayoutWrapper
        selectedBlock={selectedBlock}
        onBlockChange={setSelectedBlock}
        mobileChildren={
        <div className="min-h-screen bg-white pb-32">
          <div className="container mx-auto px-4 pt-4">
        {/* Search Bar with Favorites Button */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cafes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
            {/* Favorites Button - Icon Only */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="h-10 w-10 p-0"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-6">
          <CafeCategories cafes={cafes} />
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory !== 'All' || showFavoritesOnly) && (
          <div className="mb-4 flex flex-wrap gap-2">
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

        {/* Cafe Icon Grid - Hidden on Mobile */}
        <div className="mb-6 hidden">
          <CafeIconGrid cafes={cafes} />
        </div>

        {/* Clear Filters - Removed */}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
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
              <React.Fragment key={cafe.id}>
                {/* Mobile: Horizontal Card */}
                <div className="block lg:hidden">
                  <HorizontalCafeCard cafe={cafe} />
                </div>
                {/* Desktop: Vertical Card */}
                <div className="hidden lg:block">
                  <EnhancedCafeCard cafe={cafe} />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-white pt-4">
        <Header />
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cafes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <CafeCategories cafes={cafes} />
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'All' || showFavoritesOnly) && (
            <div className="mb-4 flex flex-wrap gap-2">
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

          {/* Cafe Icon Grid */}
          <div className="mb-6">
            <CafeIconGrid cafes={cafes} />
          </div>

          {/* Favorites & Clear Filters */}
          <div className="flex flex-row gap-4 mb-4">
            {/* Favorites Toggle */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="flex-1 h-12 font-medium"
            >
              <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              {showFavoritesOnly ? 'All Cafes' : 'Favorites Only'}
            </Button>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 h-12 font-medium border-gray-200 hover:border-primary hover:text-primary"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
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
                <React.Fragment key={cafe.id}>
                  {/* Mobile: Horizontal Card */}
                  <div className="block lg:hidden">
                    <HorizontalCafeCard cafe={cafe} />
                  </div>
                  {/* Desktop: Vertical Card */}
                  <div className="hidden lg:block">
                    <EnhancedCafeCard cafe={cafe} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayoutWrapper>
    </div>
  );
};

export default Cafes;
