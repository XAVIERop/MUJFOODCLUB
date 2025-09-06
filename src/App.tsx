import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import Cafes from "./pages/Cafes";
import QRCodePage from "./pages/QRCodePage";
import Profile from "./pages/Profile";

import CafeDashboard from "./pages/CafeDashboard";
import CafeManagement from "./pages/CafeManagement";
import { EnhancedCafeCardDemo } from "./components/EnhancedCafeCardDemo";
import POSTest from "./pages/POSTest";
import CompactOrdersTest from "./pages/CompactOrdersTest";
import POSDashboard from "./pages/POSDashboard";
import BottomNavigation from "./components/BottomNavigation";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import { PerformanceMonitor } from "./components/PerformanceMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/menu/:cafeId" element={<Menu />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/orders" element={<OrderTracking />} />
              <Route path="/cafes" element={<Cafes />} />
              <Route path="/rewards" element={<div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Rewards System Coming Soon</h1><p className="text-muted-foreground">We're building a new rewards system for you!</p></div></div>} />
              <Route path="/qr-code" element={<QRCodePage />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/cafe-dashboard" element={<CafeDashboard />} />
              <Route path="/cafe-management" element={<CafeManagement />} />
              <Route path="/demo-enhanced-card" element={<EnhancedCafeCardDemo />} />
              <Route path="/pos-test" element={<POSTest />} />
              <Route path="/compact-orders-test" element={<CompactOrdersTest />} />
              <Route path="/pos-dashboard" element={<POSDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ScrollToTop>
          
          {/* Bottom Navigation - Mobile Only */}
          <BottomNavigation />
          
          {/* Performance Monitor - Development Only */}
          <PerformanceMonitor />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
