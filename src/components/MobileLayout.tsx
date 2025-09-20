import React, { useState } from 'react';
import MobileHeader from './MobileHeader';
import MobileSearchBar from './MobileSearchBar';
import MobileFoodCategories from './MobileFoodCategories';
import MobilePromotionalBanners from './MobilePromotionalBanners';
import MobileCafeSlideList from './MobileCafeSlideList';
import { FeaturedCafeGrid } from './FeaturedCafeGrid';

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

      {/* Clean Search Bar - Swiggy Style */}
      <MobileSearchBar />

      {/* Food Categories */}
      <MobileFoodCategories />

      {/* Promotional Banners */}
      <MobilePromotionalBanners />

      {/* Featured Cafes Slide List */}
      <MobileCafeSlideList cafes={cafes} />

      {/* Featured Cafes - Same as Desktop */}
      <div className="px-4 py-4">
        <FeaturedCafeGrid 
          cafes={cafes} 
          maxCafes={6} 
          showAll={false}
        />
      </div>

      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileLayout;
