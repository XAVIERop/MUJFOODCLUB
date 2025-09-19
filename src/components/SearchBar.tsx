import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'dishes' | 'cafes'>('dishes');
  const [cafes, setCafes] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const navigate = useNavigate();

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
          setCafes(cafesData);
        }

        // Fetch menu items with cafe priority
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, cafe_id, cafes(name, priority)');

        if (!menuError && menuData) {
          console.log('Menu items loaded:', menuData.length);
          setMenuItems(menuData);
        } else {
          console.error('Menu error:', menuError);
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
      const filteredMenu = menuItems
        .filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          // Sort by cafe priority first, then by menu item name
          const priorityA = a.cafes?.priority || 999;
          const priorityB = b.cafes?.priority || 999;
          
          if (priorityA !== priorityB) {
            return priorityA - priorityB; // Lower priority number = higher priority
          }
          
          // If same priority, sort alphabetically by dish name
          return a.name.localeCompare(b.name);
        });
      
      console.log('Search query:', searchQuery);
      console.log('Filtered menu items:', filteredMenu.length);
      console.log('Menu items total:', menuItems.length);
      
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or cafes page with search query
      navigate(`/cafes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        // Visual feedback - you could add a loading state here
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice recognition result:', transcript);
        setSearchQuery(transcript);
        // Trigger search after voice input
        setTimeout(() => {
          if (transcript.trim()) {
            if (searchMode === 'cafes') {
              const filteredCafes = cafes.filter(cafe =>
                cafe.name.toLowerCase().includes(transcript.toLowerCase())
              );
              if (filteredCafes.length > 0) {
                setShowCafeDropdown(true);
              }
            } else {
              const filteredMenu = menuItems
                .filter(item =>
                  item.name.toLowerCase().includes(transcript.toLowerCase())
                )
                .sort((a, b) => {
                  // Sort by cafe priority first, then by menu item name
                  const priorityA = a.cafes?.priority || 999;
                  const priorityB = b.cafes?.priority || 999;
                  
                  if (priorityA !== priorityB) {
                    return priorityA - priorityB; // Lower priority number = higher priority
                  }
                  
                  // If same priority, sort alphabetically by dish name
                  return a.name.localeCompare(b.name);
                });
              if (filteredMenu.length > 0) {
                setShowMenuDropdown(true);
              }
            }
          }
        }, 100);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        // Handle different error types
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert('Voice recognition failed. Please try again.');
        }
      };
      
      recognition.onend = () => {
        console.log('Voice recognition ended');
      };
      
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
        alert('Voice recognition is not available. Please type your search instead.');
      }
    } else {
      console.log('Speech recognition not supported');
      alert('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  };

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100 relative">
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={`Search ${searchMode}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200"
          />
        </div>
        <Select value={searchMode} onValueChange={(value: 'dishes' | 'cafes') => setSearchMode(value)}>
          <SelectTrigger className="w-20 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dishes">Dishes</SelectItem>
            <SelectItem value="cafes">Cafes</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Search Results Dropdown */}
      {filteredResults.showCafeDropdown && (
        <div className="absolute top-full left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
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

      {filteredResults.showMenuDropdown && (
        <div className="absolute top-full left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
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

export default SearchBar;
