import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Utensils, Star, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-food.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleExploreCafes = () => {
    navigate('/cafes');
  };

  const handleViewRewards = () => {
    navigate('/rewards');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Brand Badge */}
          <Badge className="mb-4 animate-fade-in bg-white/20 text-white border-white/30 backdrop-blur-sm text-lg px-4 py-2">
            <Utensils className="w-5 h-5 mr-2" />
            FoodClub
          </Badge>

          {/* MUJ Badge */}
          <Badge className="mb-6 animate-fade-in bg-white/10 text-white border-white/20 backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2" />
            MUJ Students Exclusive
          </Badge>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up leading-tight">
            Discover Amazing Food at{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent relative z-10 drop-shadow-2xl font-extrabold tracking-wide">
                GHS Hostel
              </span>
              {/* Glowing background effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-pink-500/30 blur-2xl rounded-full transform scale-125 animate-pulse"></span>
              {/* Additional glow layers */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-300/20 via-purple-400/20 to-pink-400/20 blur-xl rounded-full transform scale-110 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-600/15 to-pink-600/15 blur-lg rounded-full transform scale-105"></span>
              {/* Subtle text shadow for better readability */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-pink-500/10 blur-sm rounded-full transform scale-150"></span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-white/90 mb-8 animate-fade-in max-w-3xl mx-auto">
            Order from your favorite cafes, earn rewards, and enjoy exclusive student discounts 
            with our QR-based loyalty program.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-8 animate-slide-up">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">3+</div>
              <div className="text-white/80 text-sm sm:text-base">Cafes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">1000+</div>
              <div className="text-white/80 text-sm sm:text-base">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80 text-sm sm:text-base">Ordering</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto hover:scale-105 transition-bounce"
              onClick={handleExploreCafes}
            >
              <Utensils className="w-5 h-5 mr-2" />
              Explore Cafes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 h-auto bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
              onClick={handleViewRewards}
            >
              <Gift className="w-5 h-5 mr-2" />
              View Rewards
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-20 h-20 rounded-full gradient-success opacity-20 blur-xl" />
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce-soft">
        <div className="w-16 h-16 rounded-full gradient-warm opacity-20 blur-lg" />
      </div>
    </section>
  );
};

export default HeroSection;