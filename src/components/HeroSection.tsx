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

  // Fetch stats from database
  useEffect(() => {
    const fetchStats = async () => {
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

        setCafeCount(cafes || 0);
        setStudentCount(students || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

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

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up leading-tight tracking-tight">
            Discover Amazing Food at{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent relative z-10 drop-shadow-2xl font-extrabold tracking-wide">
                GHS Hostel
              </span>
              {/* Glowing background effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-red-500/30 to-yellow-400/30 blur-2xl rounded-full transform scale-125 animate-pulse"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-300/20 via-red-400/20 to-yellow-300/20 blur-xl rounded-full transform scale-110 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500/15 via-red-600/15 to-yellow-500/15 blur-lg rounded-full transform scale-105"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-red-500/10 to-yellow-400/10 blur-sm rounded-full transform scale-150"></span>
            </span>
          </h1>

          {/* Search Bar - Swiggy Style */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8 animate-fade-in">
            {/* Location Input */}
            <div className="flex-1 relative">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="h-14 bg-white/95 backdrop-blur-sm border-2 border-white/30 text-gray-700 text-lg font-medium rounded-lg hover:bg-white transition-all duration-200">
                  <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                  <SelectValue placeholder="Enter your delivery location" />
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

            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search for cafes, items or more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 bg-white/95 backdrop-blur-sm border-2 border-white/30 text-gray-700 text-lg font-medium rounded-lg hover:bg-white transition-all duration-200 pr-12"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors duration-200"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Stats Row - Swiggy Style */}
          <div className="flex justify-center items-center gap-8 mb-12 animate-slide-up">
            <div className="flex items-center gap-2 text-white">
              <Store className="w-6 h-6" />
              <span className="text-2xl font-bold">{cafeCount}+</span>
              <span className="text-lg">Cafes</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Users className="w-6 h-6" />
              <span className="text-2xl font-bold">{studentCount}+</span>
              <span className="text-lg">Students</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-bold">24/7</span>
              <span className="text-lg">Delivery</span>
            </div>
          </div>

          {/* Service Cards - Swiggy Style */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in max-w-4xl mx-auto">
            {/* Food Delivery Card */}
            <div 
              onClick={handleExploreCafes}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-1">FOOD DELIVERY</h3>
                <p className="text-gray-600 text-sm mb-2">FROM CAFES</p>
                <p className="text-orange-500 font-semibold text-lg mb-4">UPTO 10% OFF</p>
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-gray-600" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>

            {/* View Rewards Card */}
            <div 
              onClick={handleViewRewards}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full sm:w-80 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30"
            >
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-1">VIEW REWARDS</h3>
                <p className="text-gray-600 text-sm mb-2">LOYALTY PROGRAM</p>
                <p className="text-orange-500 font-semibold text-lg mb-4">EARN POINTS</p>
                <div className="flex justify-between items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Gift className="w-8 h-8 text-gray-600" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-orange-500" />
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