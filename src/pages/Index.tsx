import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import HeroBannerSection from "@/components/HeroBannerSection";
import CafeCategories from "@/components/CafeCategories";
import { FeaturedCafeGrid } from '../components/FeaturedCafeGrid';
import CafeIconGrid from '../components/CafeIconGrid';
import MobileLayoutWrapper from '../components/MobileLayoutWrapper';
import MobileLayout from '../components/MobileLayout';
import ActiveOrderStatusBar from '../components/ActiveOrderStatusBar';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveOrder } from '@/hooks/useActiveOrder';
import { Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { shouldUserSeeCafe, getUserResidency } from '@/utils/residencyUtils';

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
  cuisine_categories: string[] | null;
  priority: number | null;
  slug?: string;
  location_scope?: 'ghs' | 'off_campus';
}

// Rewards Section removed for simplified version

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { scope: userScope } = getUserResidency(profile);
  
  // Initialize selectedBlock based on user type
  const getInitialBlock = (): string => {
    if (!profile) return ''; // Guest - no default location
    if (userScope === 'off_campus') return 'OFF_CAMPUS'; // Outside user
    return profile.block || ''; // GHS user - use their block or empty
  };
  
  const [selectedBlock, setSelectedBlock] = useState<string>(getInitialBlock());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cafeFilter, setCafeFilter] = useState<'all' | 'ghs' | 'outside'>('all');
  
  // Update block when profile changes
  useEffect(() => {
    const newBlock = getInitialBlock();
    if (newBlock !== selectedBlock) {
      setSelectedBlock(newBlock);
    }
  }, [profile, userScope]);
  
  // Active order status
  const { activeOrders } = useActiveOrder();

  useEffect(() => {
    fetchCafes();
}, [profile]);

  // Real-time subscription for cafe updates (ratings, etc.)
  useEffect(() => {
    const channel = supabase
      .channel('cafe-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'cafes'
        }, 
        (payload) => {
          // Update the specific cafe in the state
          setCafes(prevCafes => 
            prevCafes.map(cafe => 
              cafe.id === payload.new.id 
                ? { ...cafe, ...payload.new }
                : cafe
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCafes = async () => {
    try {
      // Cache for 5 minutes to prevent unnecessary re-fetching
      const now = Date.now();
      const cacheTime = 5 * 60 * 1000; // 5 minutes
      
      if (cafes.length > 0 && (now - lastFetchTime) < cacheTime) {
        setLoading(false);
        return;
      }

      console.log('🔄 Homepage: Fetching cafes...');
      
      // Try RPC function first, fallback to direct query if it fails
      let { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.warn('⚠️ RPC function failed, trying direct query:', error);
        
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('cafes')
          .select('id, name, type, description, location, phone, hours, image_url, rating, total_reviews, is_active, created_at, updated_at, average_rating, total_ratings, cuisine_categories, accepting_orders, priority, slug, location_scope')
          .eq('is_active', true)
          .order('priority', { ascending: true, nullsLast: true })
          .order('average_rating', { ascending: false, nullsLast: true })
          .order('name', { ascending: true });

        if (directError) {
          console.error('❌ Direct query also failed:', directError);
          throw directError;
        }
        
        data = directData;
        console.log('✅ Homepage: Direct query successful, got', data?.length || 0, 'cafes');
      } else {
        console.log('✅ Homepage: RPC function successful, got', data?.length || 0, 'cafes');
      }

      // Ensure data is an array
      const cafesData = Array.isArray(data) ? data : [];
      
      if (cafesData.length > 0) {
        console.log('🔍 Index: Profile state:', profile ? {
          email: profile.email,
          residency_scope: profile.residency_scope,
          id: profile.id
        } : 'null');
        
        // Get user residency for debugging
        const userResidency = getUserResidency(profile);
        console.log('🔍 Index: User residency:', userResidency);
        
        console.log('🔍 Index: Total cafes from DB:', cafesData.length);
        const offCampusCafes = cafesData.filter(c => c.location_scope === 'off_campus');
        const ghsCafes = cafesData.filter(c => !c.location_scope || c.location_scope === 'ghs');
        console.log('🔍 Index: Off-campus cafes:', offCampusCafes.length, offCampusCafes.map(c => c.name));
        console.log('🔍 Index: GHS cafes:', ghsCafes.length);
        console.log('🔍 Index: Sample cafes:', cafesData.slice(0, 5).map(c => ({
          name: c.name,
          location_scope: c.location_scope || 'ghs (default)'
        })));
        
        const scopedCafes = cafesData.filter((cafe: any) => {
          const shouldSee = shouldUserSeeCafe(profile, cafe);
          if (!shouldSee && profile && userResidency.scope === 'off_campus') {
            console.log(`🚫 Filtered out (off-campus user): ${cafe.name} (location_scope: ${cafe.location_scope || 'ghs (default)'})`);
          }
          return shouldSee;
        });
        
        console.log('🔍 Index: After filtering:', scopedCafes.length, 'cafes visible');
        if (scopedCafes.length === 0 && profile) {
          console.warn('⚠️ Index: All cafes filtered out for user:', {
            email: profile.email,
            residency_scope: profile.residency_scope,
            userResidencyScope: userResidency.scope,
            totalCafes: cafesData.length,
            offCampusCafes: offCampusCafes.length,
            ghsCafes: ghsCafes.length
          });
        }

        if (scopedCafes.length === 0) {
          setCafes([]);
          setLastFetchTime(now);
          setLoading(false);
          return;
        }

        // First, get the top 20 cafes by priority (regardless of open/closed status)
        const top20Cafes = [...scopedCafes].sort((a: Cafe, b: Cafe) => (a.priority || 99) - (b.priority || 99)).slice(0, 20);
        
        // Then reorder within those 15: open cafes first, then closed cafes
        const openCafes = top20Cafes.filter(cafe => cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
        const closedCafes = top20Cafes.filter(cafe => !cafe.accepting_orders).sort((a, b) => (a.priority || 99) - (b.priority || 99));
        
        // Combine: open cafes first, then closed cafes (all within the top 15)
        const reorderedCafes = [...openCafes, ...closedCafes];
        
        setCafes(reorderedCafes);
        setLastFetchTime(now);
        console.log('✅ Homepage: Set cafes (top 20 by priority, reordered: open first, closed last):', reorderedCafes.map(c => `${c.name} (${c.accepting_orders ? 'OPEN' : 'CLOSED'})`));
      } else {
        console.warn('⚠️ Homepage: No cafes found');
        setCafes([]);
      }
      
    } catch (error) {
      console.error('❌ Homepage: Cafe fetching failed:', error);
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayoutWrapper
      mobileChildren={
        <MobileLayout 
          cafes={cafes}
          selectedBlock={selectedBlock}
          onBlockChange={setSelectedBlock}
          cafeFilter={cafeFilter}
          onCafeFilterChange={setCafeFilter}
        />
      }
    >
      <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
        {/* Header with Location and Profile */}
        <Header selectedBlock={selectedBlock} onBlockChange={setSelectedBlock} />
        
        {/* Search Bar */}
        <div>
          <SearchBar />
        </div>
        
        {/* Hero Banner Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HeroBannerSection />
        </div>
        
        {/* Cafe Categories - HIDDEN */}
        {/* {!loading && cafes.length > 0 && (
          <CafeCategories cafes={cafes} />
        )} */}
        
        <main className="m-0 p-0">
          {/* Unified Cafe Section - Merged Icon Grid + Cafe Cards */}
          <section id="cafes" className="pt-4 pb-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Single Section Header */}
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Explore all cafes nearby!
                </h2>
                
                {/* Cafe Filter Selector */}
                <div className="flex justify-center gap-2 mb-6">
                  <Button
                    variant={cafeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCafeFilter('all')}
                    className={`${
                      cafeFilter === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    } transition-all`}
                  >
                    All
                  </Button>
                  <Button
                    variant={cafeFilter === 'ghs' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCafeFilter('ghs')}
                    className={`${
                      cafeFilter === 'ghs'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    } transition-all`}
                  >
                    GHS
                  </Button>
                  <Button
                    variant={cafeFilter === 'outside' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCafeFilter('outside')}
                    className={`${
                      cafeFilter === 'outside'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    } transition-all`}
                  >
                    Outside
                  </Button>
                </div>
              </div>

              {/* Cafe Icon Grid with Slide Buttons - HIDDEN */}
              {/* {!loading && cafes.length > 0 && (
                <div className="mb-12">
                  <CafeIconGrid cafes={cafes} />
                </div>
              )} */}

              {/* Limited Cafe Grid - Show filtered cafes */}
              <div className="cafe-grid">
                <FeaturedCafeGrid 
                  showAll={false} 
                  maxCafes={15} 
                  cafes={(() => {
                    // Filter cafes based on selected filter
                    if (cafeFilter === 'all') {
                      return cafes;
                    } else if (cafeFilter === 'ghs') {
                      return cafes.filter(cafe => !cafe.location_scope || cafe.location_scope === 'ghs');
                    } else if (cafeFilter === 'outside') {
                      return cafes.filter(cafe => cafe.location_scope === 'off_campus');
                    }
                    return cafes;
                  })()} 
                  loading={loading} 
                />
              </div>
            </div>
          </section>
          
          {/* Rewards Section removed for simplified version */}
        </main>
      </div>
      
      {/* Active Order Status Bar - Only show if user has active orders */}
      <ActiveOrderStatusBar activeOrders={activeOrders} />
      
      {/* Footer - Desktop only (mobile has bottom nav) */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </MobileLayoutWrapper>
  );
};

export default Index;