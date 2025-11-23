import React, { useState } from 'react';
import SearchBar from './SearchBar';
import MobilePromotionalBanners from './MobilePromotionalBanners';
import MobileCafeSlideList from './MobileCafeSlideList';
import MobileFeaturedCafeCarousel from './MobileFeaturedCafeCarousel';
import { FeaturedCafeGrid } from './FeaturedCafeGrid';
import CafeIconGrid from './CafeIconGrid';
import CafeCategories from './CafeCategories';
import { Button } from './ui/button';

interface Cafe {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  priority: number | null;
  location_scope?: 'ghs' | 'off_campus';
  slug?: string;
  image_url?: string | null;
}

interface MobileLayoutProps {
  cafes: Cafe[];
  onBlockChange: (block: string) => void;
  selectedBlock: string;
  cafeFilter: 'all' | 'ghs' | 'outside';
  onCafeFilterChange: (filter: 'all' | 'ghs' | 'outside') => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  cafes, 
  onBlockChange, 
  selectedBlock,
  cafeFilter,
  onCafeFilterChange
}) => {
  // Filter cafes based on selected filter
  const filteredCafes = (() => {
    if (cafeFilter === 'all') {
      return cafes;
    } else if (cafeFilter === 'ghs') {
      return cafes.filter(cafe => !cafe.location_scope || cafe.location_scope === 'ghs');
    } else if (cafeFilter === 'outside') {
      return cafes.filter(cafe => cafe.location_scope === 'off_campus');
    }
    return cafes;
  })();
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">

      {/* Search Bar - Same functionality as desktop */}
      <SearchBar />

      {/* What's on your mind? section */}
      <CafeCategories cafes={cafes} />

      {/* Promotional Banners */}
      <MobilePromotionalBanners />

      {/* Featured Cafes Slide List */}
      <MobileCafeSlideList cafes={filteredCafes} />

      {/* Explore all cafes nearby section */}
      <div className="px-4 py-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Explore all cafes nearby!
        </h2>
        
        {/* Cafe Filter Selector - Mobile */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={cafeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCafeFilterChange('all')}
            className={`${
              cafeFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            } transition-all text-xs`}
          >
            All
          </Button>
          <Button
            variant={cafeFilter === 'ghs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCafeFilterChange('ghs')}
            className={`${
              cafeFilter === 'ghs'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            } transition-all text-xs`}
          >
            GHS
          </Button>
          <Button
            variant={cafeFilter === 'outside' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCafeFilterChange('outside')}
            className={`${
              cafeFilter === 'outside'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            } transition-all text-xs`}
          >
            Outside
          </Button>
        </div>
        
        {filteredCafes.length > 0 && (
          <CafeIconGrid cafes={filteredCafes} />
        )}
      </div>

      {/* Featured Cafe Grid - Top 6 cafes with Show All button */}
      <div className="px-4 py-4">
        <FeaturedCafeGrid cafes={filteredCafes} />
      </div>

      {/* Featured Cafe Carousel - Below Show All Cafes button */}
      <div className="py-4">
        <MobileFeaturedCafeCarousel cafes={filteredCafes} title="Featured this week" />
      </div>

      {/* Bottom Spacing - Increased for proper mobile scrolling and navigation */}
      <div className="h-32 pb-safe"></div>
    </div>
  );
};

export default MobileLayout;
