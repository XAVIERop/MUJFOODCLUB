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
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "./components/BottomNavigation";
import ScrollToTop from "./components/ScrollToTop";
import MobileFloatingCart from "./components/MobileFloatingCart";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
// import MobileErrorHandler from "./components/MobileErrorHandler";
import PerformanceDashboard from "./components/PerformanceDashboard";

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
const QRCodePage = lazy(() => import("./pages/QRCodePage"));
const Profile = lazy(() => import("./pages/Profile"));
const CafeDashboard = lazy(() => import("./pages/CafeDashboard"));
const CafeManagement = lazy(() => import("./pages/CafeManagement"));
const EnhancedCafeCardDemo = lazy(() => import("./components/EnhancedCafeCardDemo"));
const POSDashboard = lazy(() => import("./pages/POSDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EnvCheck = lazy(() => import("./pages/EnvCheck"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Using optimized query client from lib/queryClient.ts

const App = () => (
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
                      <Route path="/grocery" element={<Grocery />} />
                      {/* <Route path="/rewards" element={<CafeRewards />} /> */} {/* Disabled for simplified version */}
                      <Route path="/qr-code" element={<QRCodePage />} />
                      <Route path="/profile" element={<Profile />} />

                      <Route path="/cafe-dashboard" element={<CafeDashboard />} />
                      <Route path="/cafe-management" element={<CafeManagement />} />
                      <Route path="/demo-enhanced-card" element={<EnhancedCafeCardDemo />} />
                      <Route path="/pos-dashboard" element={<POSDashboard />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/env-check" element={<EnvCheck />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ScrollToTop>
              
              {/* Bottom Navigation - Mobile Only */}
              <BottomNavigation />
              
              {/* Performance Monitor - Development Only */}
              {import.meta.env.DEV && (
                <>
                  <PerformanceMonitor />
                  <PerformanceDashboard />
                </>
              )}
              {/* <SecurityIndicator /> */}
              <PWAUpdateManager />
              <PWAInstallPrompt />
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

export default App;
