import React, { useState } from 'react';
import MobileHeader from './MobileHeader';
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
      {/* Mobile Header */}
      <MobileHeader 
        selectedBlock={selectedBlock}
        onBlockChange={onBlockChange}
      />

      {/* Search Bar - Same functionality as desktop */}
      <div className="px-4 py-3 bg-white">
        <SearchBar />
      </div>

      {/* What's on your mind? section */}
      <CafeCategories cafes={cafes} />

      {/* Promotional Banners */}
      <MobilePromotionalBanners />

      {/* Featured Cafes Slide List */}
      <MobileCafeSlideList cafes={cafes} />

      {/* Explore all cafes nearby section */}
      <div className="px-4 py-4 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
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

      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileLayout;
