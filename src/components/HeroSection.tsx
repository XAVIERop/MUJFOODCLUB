import { Button } from "@/components/ui/button";
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
  const [selectedBlock, setSelectedBlock] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cafes, setCafes] = useState<any[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<any[]>([]);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);

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

        // Fetch all cafes for search
        const { data: cafesData } = await supabase
          .from('cafes')
          .select('id, name')
          .order('name');

        setCafeCount(cafes || 0);
        setStudentCount(students || 0);
        setCafes(cafesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Filter cafes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cafes.filter(cafe =>
        cafe.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      setFilteredCafes(filtered);
      setShowCafeDropdown(true);
    } else {
      setFilteredCafes([]);
      setShowCafeDropdown(false);
    }
  }, [searchQuery, cafes]);

  const handleExploreCafes = () => {
    navigate('/cafes');
  };

  const handleViewRewards = () => {
    navigate('/rewards');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/cafes?search=${encodeURIComponent(searchQuery)}`);
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
    setSearchQuery("");
  };

  const blocks = [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content - Swiggy Style Layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-6xl mx-auto w-full">
          {/* Brand Badge */}
          <Badge className="mb-4 animate-fade-in bg-white/20 text-white border-white/30 backdrop-blur-sm text-lg px-4 py-2 inline-flex items-center justify-center">
            <Utensils className="w-5 h-5 mr-2" />
            FoodClub
          </Badge>

          {/* MUJ Badge */}
          <Badge className="mb-6 animate-fade-in bg-white/10 text-white border-white/20 backdrop-blur-sm text-lg px-4 py-2 inline-flex items-center justify-center">
            <Star className="w-5 h-5 mr-2" />
            MUJ Students Exclusive
          </Badge>

          {/* Main Heading - Clean and Simple */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up leading-tight tracking-tight">
            Discover Amazing Food at{" "}
            <span className="text-white font-extrabold">
              GHS Hostel
            </span>
          </h1>

          {/* Search Bar - Swiggy Style */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8 animate-fade-in">
            {/* Location Input - Emoji Size */}
            <div className="relative w-16">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="h-14 bg-black/20 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-medium rounded-lg hover:bg-black/30 transition-all duration-200">
                  <MapPin className="w-5 h-5" />
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

            {/* Search Input with Cafe Dropdown */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search for cafes, items or more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 bg-black/20 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-medium rounded-lg hover:bg-black/30 transition-all duration-200 pr-12 placeholder:text-white/70"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-black/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-black/30 transition-all duration-200"
              >
                <Search className="w-5 h-5 text-white" />
              </button>

              {/* Cafe Dropdown */}
              {showCafeDropdown && filteredCafes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                  {filteredCafes.map((cafe) => (
                    <div
                      key={cafe.id}
                      onClick={() => handleCafeSelect(cafe.id)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{cafe.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row - Reverted to Previous Format */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 animate-slide-up max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{cafeCount}</div>
              <div className="text-white/80 text-sm sm:text-base">Cafes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{studentCount}+</div>
              <div className="text-white/80 text-sm sm:text-base">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80 text-sm sm:text-base">Delivery</div>
            </div>
          </div>

          {/* Service Cards - Exact Swiggy Style */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in max-w-4xl mx-auto">
            {/* Food Delivery Card */}
            <div 
              onClick={handleExploreCafes}
              className="bg-black/20 backdrop-blur-sm rounded-xl p-6 w-full sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  FOOD DELIVERY
                </h3>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  FROM CAFES
                </p>
                <p className="text-orange-400 font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  UPTO 10% OFF
                </p>
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>

            {/* View Rewards Card */}
            <div 
              onClick={handleViewRewards}
              className="bg-black/20 backdrop-blur-sm rounded-xl p-6 w-full sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                  VIEW REWARDS
                </h3>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  LOYALTY PROGRAM
                </p>
                <p className="text-orange-400 font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  EARN POINTS
                </p>
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-orange-400" />
                </div>
              </div>
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