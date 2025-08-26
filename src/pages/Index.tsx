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
      {/* Debug timestamp - remove after testing */}
      <div className="text-center text-xs text-muted-foreground py-2">
        Last updated: {new Date().toLocaleString()}
      </div>
    </main>
  );
};

export default Index;