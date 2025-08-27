import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import CafeGrid from "@/components/CafeGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CafeGrid />
        <LoyaltyProgram />
      </main>
    </div>
  );
};

export default Index;