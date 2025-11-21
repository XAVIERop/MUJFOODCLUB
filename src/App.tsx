import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LocationProvider } from "@/contexts/LocationContext";
import { CartProvider } from "@/hooks/useCart";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { SecurityProvider, SecurityIndicator } from "@/components/SecurityProvider";
import PWAUpdateManager from "@/components/PWAUpdateManager";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "./components/BottomNavigation";
import ScrollToTop from "./components/ScrollToTop";
import MobileFloatingCart from "./components/MobileFloatingCart";
import { usePerformanceMonitor } from "./components/PerformanceMonitor";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
// import MobileErrorHandler from "./components/MobileErrorHandler";

// Lazy load DEV-only performance components to reduce bundle size
const PerformanceMonitor = lazy(() => 
  import("./components/PerformanceMonitor").then(module => ({ 
    default: module.PerformanceMonitor 
  }))
);
const PerformanceDashboard = lazy(() => import("./components/PerformanceDashboard"));

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const MenuModern = lazy(() => import("./pages/MenuModern"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderAnalyticsPage = lazy(() => import("./pages/OrderAnalyticsPage"));
const Cafes = lazy(() => import("./pages/Cafes"));
const Grocery = lazy(() => import("./pages/Grocery"));
const GroceryCategory = lazy(() => import("./pages/GroceryCategory"));
const QRCodePage = lazy(() => import("./pages/QRCodePage"));
const Profile = lazy(() => import("./pages/Profile"));
const ReferralTest = lazy(() => import("./pages/ReferralTest"));
const DatabaseTest = lazy(() => import("./pages/DatabaseTest"));
const AdminReferrals = lazy(() => import("./pages/AdminReferrals"));
const CafeDashboard = lazy(() => import("./pages/CafeDashboard"));
const CafeManagement = lazy(() => import("./pages/CafeManagement"));
const EnhancedCafeCardDemo = lazy(() => import("./components/EnhancedCafeCardDemo"));
const POSDashboard = lazy(() => import("./pages/POSDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EnvCheck = lazy(() => import("./pages/EnvCheck"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TableOrder = lazy(() => import("./pages/TableOrder"));
const TableQRGenerator = lazy(() => import("./pages/TableQRGenerator"));

// Using optimized query client from lib/queryClient.ts

const App = () => {
  const { isEnabled: performanceMonitorEnabled } = usePerformanceMonitor();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SecurityProvider>
              <LocationProvider>
                <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                  <ScrollToTop>
                    <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
                      <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/menu/:cafeIdentifier" element={<MenuModern />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/order-analytics" element={<OrderAnalyticsPage />} />
                      <Route path="/cafes" element={<Cafes />} />
                      <Route path="/bannaschowki" element={<MenuModern />} />
                      <Route path="/grabit" element={<Grocery />} />
                      <Route path="/grabit/category/:categoryId" element={<GroceryCategory />} />
                      {/* <Route path="/rewards" element={<CafeRewards />} /> */} {/* Disabled for simplified version */}
                      <Route path="/qr-code" element={<QRCodePage />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/referral-test" element={<ReferralTest />} />
                      <Route path="/database-test" element={<DatabaseTest />} />
                      <Route path="/admin/referrals" element={<AdminReferrals />} />

                      <Route path="/cafe-dashboard" element={<CafeDashboard />} />
                      <Route path="/cafe-management" element={<CafeManagement />} />
                      <Route path="/demo-enhanced-card" element={<EnhancedCafeCardDemo />} />
                      <Route path="/pos-dashboard" element={<POSDashboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/env-check" element={<EnvCheck />} />
                      
                      {/* Table QR Order Route */}
                      <Route path="/table-order/:cafeSlug/:tableNumber" element={<TableOrder />} />
                      <Route path="/table-qr-generator" element={<TableQRGenerator />} />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ScrollToTop>
              
              {/* Bottom Navigation - Mobile Only */}
              <BottomNavigation />
              
              {/* Performance Monitor - Development Only (Lazy Loaded) */}
              {import.meta.env.DEV && (
                <Suspense fallback={null}>
                  <PerformanceMonitor />
                  <PerformanceDashboard />
                </Suspense>
              )}
              {/* <SecurityIndicator /> */}
              <PWAUpdateManager />
              <PWAInstallPrompt />
              <PushNotificationPrompt />
              <MobileFloatingCart />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
        </LocationProvider>
        </SecurityProvider>
        </AuthProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        <SpeedInsights />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
