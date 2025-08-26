import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CafeGrid from "@/components/CafeGrid";
import QRCodeSection from "@/components/QRCodeSection";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import DebugSection from "@/components/DebugSection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CafeGrid />
      <QRCodeSection />
      <LoyaltyProgram />
      <DebugSection />
    </main>
  );
};

export default Index;