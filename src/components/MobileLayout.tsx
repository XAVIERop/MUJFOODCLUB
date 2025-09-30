import React, { useState } from 'react';
import SearchBar from './SearchBar';
import MobilePromotionalBanners from './MobilePromotionalBanners';
import MobileCafeSlideList from './MobileCafeSlideList';
import { FeaturedCafeGrid } from './FeaturedCafeGrid';
import CafeIconGrid from './CafeIconGrid';
import CafeCategories from './CafeCategories';

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
}

interface MobileLayoutProps {
  cafes: Cafe[];
  onBlockChange: (block: string) => void;
  selectedBlock: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  cafes, 
  onBlockChange, 
  selectedBlock 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Search Bar - Same functionality as desktop */}
      <SearchBar />

      {/* What's on your mind? section */}
      <CafeCategories cafes={cafes} />

      {/* Promotional Banners */}
      <MobilePromotionalBanners />

      {/* Featured Cafes Slide List */}
      <MobileCafeSlideList cafes={cafes} />

      {/* Explore all cafes nearby section */}
      <div className="px-4 py-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Explore all cafes nearby!
        </h2>
        {cafes.length > 0 && (
          <CafeIconGrid cafes={cafes} />
        )}
      </div>

      {/* Featured Cafe Grid - Top 6 cafes with Show All button */}
      <div className="px-4 py-4">
        <FeaturedCafeGrid cafes={cafes} />
      </div>

      {/* Bottom Spacing - Increased for proper mobile scrolling and navigation */}
      <div className="h-32 pb-safe"></div>
    </div>
  );
};

export default MobileLayout;
