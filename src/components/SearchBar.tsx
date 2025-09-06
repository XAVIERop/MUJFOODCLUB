import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mic } from 'lucide-react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or cafes page with search query
      navigate(`/cafes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    // Placeholder for voice search functionality
    console.log('Voice search clicked');
  };

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for 'Biryani'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleVoiceSearch}
          className="h-10 w-10 p-0 hover:bg-gray-100"
        >
          <Mic className="h-4 w-4 text-gray-500" />
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
