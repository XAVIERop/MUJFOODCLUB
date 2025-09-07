import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "./components/BottomNavigation";
import ScrollToTop from "./components/ScrollToTop";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceDashboard from "./components/PerformanceDashboard";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Menu = lazy(() => import("./pages/Menu"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderAnalyticsPage = lazy(() => import("./pages/OrderAnalyticsPage"));
const Cafes = lazy(() => import("./pages/Cafes"));
const QRCodePage = lazy(() => import("./pages/QRCodePage"));
const Profile = lazy(() => import("./pages/Profile"));
const CafeRewards = lazy(() => import("./pages/CafeRewards"));
const CafeDashboard = lazy(() => import("./pages/CafeDashboard"));
const CafeManagement = lazy(() => import("./pages/CafeManagement"));
const EnhancedCafeCardDemo = lazy(() => import("./components/EnhancedCafeCardDemo"));
const POSTest = lazy(() => import("./pages/POSTest"));
const CompactOrdersTest = lazy(() => import("./pages/CompactOrdersTest"));
const POSDashboard = lazy(() => import("./pages/POSDashboard"));
const WhatsAppTest = lazy(() => import("./pages/WhatsAppTest"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect (we have real-time subscriptions)
      refetchOnReconnect: false,
      // Background refetch every 30 seconds for critical data
      refetchInterval: 30 * 1000,
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop>
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/menu/:cafeId" element={<Menu />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/order-analytics" element={<OrderAnalyticsPage />} />
                  <Route path="/cafes" element={<Cafes />} />
                  <Route path="/rewards" element={<CafeRewards />} />
                  <Route path="/qr-code" element={<QRCodePage />} />
                  <Route path="/profile" element={<Profile />} />

                  <Route path="/cafe-dashboard" element={<CafeDashboard />} />
                  <Route path="/cafe-management" element={<CafeManagement />} />
                  <Route path="/demo-enhanced-card" element={<EnhancedCafeCardDemo />} />
                  <Route path="/pos-test" element={<POSTest />} />
                  <Route path="/compact-orders-test" element={<CompactOrdersTest />} />
                  <Route path="/pos-dashboard" element={<POSDashboard />} />
                  <Route path="/whatsapp-test" element={<WhatsAppTest />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ScrollToTop>
            
            {/* Bottom Navigation - Mobile Only */}
            <BottomNavigation />
            
            {/* Performance Monitor - Development Only */}
            <PerformanceMonitor />
            
            {/* Performance Dashboard - Development Only */}
            <PerformanceDashboard />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
