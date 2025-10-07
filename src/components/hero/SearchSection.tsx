import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchSectionProps {
  selectedBlock: string;
  onBlockChange: (block: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ selectedBlock, onBlockChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<'dishes' | 'cafes'>('dishes');
  const [cafes, setCafes] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // Fetch cafes and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cafes
        const { data: cafesData, error: cafesError } = await supabase
          .from('cafes')
          .select('id, name, description, image_url, average_rating')
          .order('priority', { ascending: true });

        if (!cafesError && cafesData) {
          // Show only first 10 cafes
          const limitedCafes = cafesData.slice(0, 10);
          setCafes(limitedCafes);
        }

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, cafe_id, cafes(name)')
          .order('name', { ascending: true });

        if (!menuError && menuData) {
          setMenuItems(menuData);
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };

    fetchData();
  }, []);

  // Memoized filtered results for better performance
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        filteredCafes: [],
        filteredMenuItems: [],
        showCafeDropdown: false,
        showMenuDropdown: false
      };
    }

    if (searchMode === 'cafes') {
      const filteredCafes = cafes.filter(cafe =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        filteredCafes,
        filteredMenuItems: [],
        showCafeDropdown: filteredCafes.length > 0,
        showMenuDropdown: false
      };
    } else {
      const filteredMenu = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        filteredCafes: [],
        filteredMenuItems: filteredMenu,
        showCafeDropdown: false,
        showMenuDropdown: filteredMenu.length > 0
      };
    }
  }, [searchQuery, searchMode, cafes, menuItems]);

  const handleCafeClick = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
    setSearchQuery("");
    setShowCafeDropdown(false);
  };

  const handleMenuItemClick = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
    setSearchQuery("");
    setShowMenuDropdown(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={`Search ${searchMode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-primary rounded-xl"
            />
          </div>
        </div>
        
        <Select value={searchMode} onValueChange={(value: 'dishes' | 'cafes') => setSearchMode(value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dishes">Dishes</SelectItem>
            <SelectItem value="cafes">Cafes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Block Selection */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Delivery to:</span>
        <Select value={selectedBlock} onValueChange={onBlockChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="B1">B1</SelectItem>
            <SelectItem value="B2">B2</SelectItem>
            <SelectItem value="B3">B3</SelectItem>
            <SelectItem value="B4">B4</SelectItem>
            <SelectItem value="B5">B5</SelectItem>
            <SelectItem value="B6">B6</SelectItem>
            <SelectItem value="B7">B7</SelectItem>
            <SelectItem value="B8">B8</SelectItem>
            <SelectItem value="B9">B9</SelectItem>
            <SelectItem value="B10">B10</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search Results Dropdown */}
      {showCafeDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredResults.filteredCafes.map((cafe) => (
            <div
              key={cafe.id}
              onClick={() => handleCafeClick(cafe.id)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{cafe.name}</div>
              <div className="text-sm text-gray-500">{cafe.description}</div>
            </div>
          ))}
        </div>
      )}

      {showMenuDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredResults.filteredMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuItemClick(item.cafe_id)}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500">₹{item.price} • {item.cafes?.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSection;
