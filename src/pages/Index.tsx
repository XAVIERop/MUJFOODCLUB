import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import { CafeGrid } from '../components/CafeGrid';
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        {/* Cafe Grid Section */}
        <section id="cafes" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 gradient-success text-white">
                Popular Cafes
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Choose Your Favorite Cafe
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover delicious food from our partner cafes and earn rewards with every order
              </p>
            </div>

            {/* Limited Cafe Grid - Show only 3 cafes */}
            <CafeGrid showAll={false} maxCafes={3} />
          </div>
        </section>
        <LoyaltyProgram />
      </main>
    </div>
  );
};

export default Index;