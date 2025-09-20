import React, { useState } from 'react';
import { Search, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MobileSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="px-4 py-3 bg-white">
      {/* Clean Search Bar - Swiggy Style */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        
        <Input
          type="text"
          placeholder="Search dishes, cafes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-12 py-3 text-base bg-gray-50 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20"
        />
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
        >
          <Mic className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
};

export default MobileSearchBar;
