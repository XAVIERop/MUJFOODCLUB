import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Utensils, Star, Gift, MapPin, Search, Users, Clock, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/img.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const [cafeCount, setCafeCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState("B1");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<'dishes' | 'cafes'>('dishes');
  const [isMobile, setIsMobile] = useState(false);
  const [cafes, setCafes] = useState<any[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<any[]>([]);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<any[]>([]);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch stats and cafes from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cafe count
        const { count: cafes } = await supabase
          .from('cafes')
          .select('*', { count: 'exact', head: true });

        // Fetch student count
        const { count: students } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'student');

        // Fetch all cafes for search using priority ordering
        const { data: cafesData } = await supabase
          .rpc('get_cafes_ordered');

        // Fetch all menu items for food search
        const { data: menuData } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            price,
            cafe_id,
            cafes!inner(name)
          `)
          .eq('is_available', true)
          .order('name');

        setCafeCount(cafes || 0);
        setStudentCount(students || 0);
        setCafes(cafesData || []);
        setMenuItems(menuData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter cafes and menu items based on search query and mode
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchMode === 'cafes') {
        const filteredCafes = cafes.filter(cafe =>
          cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCafes(filteredCafes);
        setFilteredMenuItems([]);
        setShowCafeDropdown(filteredCafes.length > 0);
        setShowMenuDropdown(false);
      } else {
        const filteredMenu = menuItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMenuItems(filteredMenu);
        setFilteredCafes([]);
        setShowMenuDropdown(filteredMenu.length > 0);
        setShowCafeDropdown(false);
      }
    } else {
      setFilteredCafes([]);
      setFilteredMenuItems([]);
      setShowCafeDropdown(false);
      setShowMenuDropdown(false);
    }
  }, [searchQuery, searchMode, cafes, menuItems]);

  const handleExploreCafes = () => {
    navigate('/cafes');
  };

  const handleViewRewards = () => {
    navigate('/rewards');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (searchMode === 'cafes') {
        navigate(`/cafes?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/cafes?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCafeSelect = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
    setShowCafeDropdown(false);
    setShowMenuDropdown(false);
    setSearchQuery("");
  };

  const handleMenuItemSelect = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
    setShowCafeDropdown(false);
    setShowMenuDropdown(false);
    setSearchQuery("");
  };

  const blocks = [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
                style={{
          backgroundImage: `url(${isMobile ? '/s.png' : heroImage})`
        }}
      >
        <div className={`absolute inset-0 transition-all duration-500 ${
          isMobile 
            ? 'bg-gradient-to-b from-black/70 via-black/50 to-black/30' 
            : 'bg-gradient-to-br from-black/60 via-black/40 to-transparent'
        }`} />
      </div>

      {/* Content - Swiggy Style Layout */}
      <div className="relative z-10 container mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-6xl mx-auto w-full">
          {/* Brand Badge */}
          <Badge className="mb-4 sm:mb-6 animate-fade-in bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 inline-flex items-center justify-center">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            FoodClub
          </Badge>

          {/* MUJ Badge */}
          <Badge className="mb-4 sm:mb-8 animate-fade-in bg-white/10 text-white border-white/20 backdrop-blur-sm text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 inline-flex items-center justify-center">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            MUJ Students Exclusive
          </Badge>

          {/* Main Heading - Mobile Optimized */}
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-8 animate-slide-up leading-tight tracking-tight px-4 sm:px-0 ${
            isMobile ? 'text-shadow-lg' : ''
          }`}>
            Discover Amazing Food at{" "}
            <span className="text-white font-extrabold">
                GHS Hostel
            </span>
          </h1>

          {/* Location + Search in One Row - Mobile Optimized */}
          <div className="flex items-center gap-3 sm:gap-4 max-w-full sm:max-w-2xl mx-auto mb-6 sm:mb-10 animate-fade-in px-4 sm:px-0">
            {/* Location Dropdown - Just Pin Size */}
            <div className="relative">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="h-11 sm:h-12 w-11 sm:w-12 bg-black/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg hover:bg-black/30 transition-all duration-200 p-0 flex items-center justify-center">
                  <MapPin className="w-5 h-5 sm:w-5 sm:h-5" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((block) => (
                    <SelectItem key={block} value={block}>
                      Block {block}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar - Takes Remaining Space */}
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={searchMode === 'dishes' ? "Search for food items..." : "Search for cafes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-11 sm:h-14 bg-black/20 backdrop-blur-sm border-2 border-white/30 text-white text-sm sm:text-lg font-medium rounded-lg hover:bg-black/30 transition-all duration-200 pr-28 sm:pr-32 placeholder:text-white/70"
              />
              
              {/* Search Mode Toggle - positioned inside search input */}
              <div className="absolute right-14 sm:right-16 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={() => {
                    setSearchMode('dishes');
                    setSearchQuery('');
                    setShowCafeDropdown(false);
                    setShowMenuDropdown(false);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
                    searchMode === 'dishes'
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  🍽️
                </button>
                <button
                  onClick={() => {
                    setSearchMode('cafes');
                    setSearchQuery('');
                    setShowCafeDropdown(false);
                    setShowMenuDropdown(false);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
                    searchMode === 'cafes'
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  🏪
                </button>
              </div>
              
              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 bg-black/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-black/30 transition-all duration-200"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Cafe Dropdown */}
              {showCafeDropdown && filteredCafes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-xs sm:text-sm">
                    Cafes
                  </div>
                  {filteredCafes.map((cafe) => (
                    <div
                      key={cafe.id}
                      onClick={() => handleCafeSelect(cafe.id)}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800 text-sm sm:text-base">{cafe.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Food Items Dropdown */}
              {showMenuDropdown && filteredMenuItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  <div className="px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-xs sm:text-sm">
                    Food Items
                  </div>
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMenuItemSelect(item.cafe_id)}
                      className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm sm:text-base">{item.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{item.cafes?.name}</div>
                        </div>
                        <div className="text-orange-400 font-semibold text-sm sm:text-base">
                          ₹{item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Service Cards - Optimized for Mobile */}
          <div className="flex flex-row gap-3 sm:gap-6 justify-center items-stretch animate-fade-in max-w-full sm:max-w-4xl mx-auto px-4 sm:px-0 mb-6 sm:mb-10">
            {/* Food Delivery Card */}
            <div 
              onClick={handleExploreCafes}
              className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-6 w-40 sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  FOOD DELIVERY
                </h3>
                <p className="text-white/80 text-sm sm:text-sm mb-3 sm:mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  FROM CAFES
                </p>
                <p className="text-orange-400 font-semibold text-base sm:text-lg mb-4 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  UPTO 10% OFF
                </p>
                <div className="flex justify-center sm:justify-between items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-white/10 flex items-center justify-center">
                    <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 ml-4 sm:ml-0" />
                </div>
              </div>
            </div>

            {/* View Rewards Card */}
            <div 
              onClick={handleViewRewards}
              className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-6 w-40 sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  VIEW REWARDS
                </h3>
                <p className="text-white/80 text-sm sm:text-sm mb-3 sm:mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  LOYALTY PROGRAM
                </p>
                <p className="text-orange-400 font-semibold text-base sm:text-lg mb-4 sm:mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  EARN POINTS
                </p>
                <div className="flex justify-center sm:justify-between items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-white/10 flex items-center justify-center">
                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 ml-4 sm:ml-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-8 mt-6 sm:mt-8 animate-slide-up max-w-full sm:max-w-md mx-auto px-4 sm:px-0">
            <div className="text-center">
              <div className="text-2xl sm:text-2xl lg:text-3xl font-bold text-white">{cafeCount}</div>
              <div className="text-white/80 text-sm sm:text-sm lg:text-base">Cafes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-2xl lg:text-3xl font-bold text-white">{studentCount}+</div>
              <div className="text-white/80 text-sm sm:text-sm lg:text-base">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-2xl lg:text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80 text-sm sm:text-sm lg:text-base">Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float pointer-events-none">
        <div className="w-20 h-20 rounded-full gradient-success opacity-20 blur-xl" />
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce-soft pointer-events-none">
        <div className="w-16 h-16 rounded-full gradient-warm opacity-20 blur-lg" />
      </div>
    </section>
  );
};

export default HeroSection;