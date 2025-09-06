import React, { useState, memo } from "react";
import StatsSection from "./hero/StatsSection";
import SearchSection from "./hero/SearchSection";
import HeroContent from "./hero/HeroContent";

const HeroSection = memo(() => {
  const [selectedBlock, setSelectedBlock] = useState("B1");

  const handleBlockChange = (block: string) => {
    setSelectedBlock(block);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Stats Section */}
        <StatsSection />
        
        {/* Main Hero Content */}
        <HeroContent />
        
        {/* Search Section */}
        <div className="mt-12">
          <SearchSection 
            selectedBlock={selectedBlock}
            onBlockChange={handleBlockChange}
          />
        </div>
      </div>
      
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 animate-float pointer-events-none">
        <div className="w-20 h-20 rounded-full gradient-success opacity-20 blur-xl" />
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce-soft pointer-events-none">
        <div className="w-16 h-16 rounded-full gradient-warm opacity-20 blur-lg" />
      </div>
    </section>
  );
});

export default HeroSection;