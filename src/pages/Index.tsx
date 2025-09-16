import React, { useState, useEffect } from 'react';
import SimpleHeader from "@/components/SimpleHeader";
import SearchBar from "@/components/SearchBar";
import HeroBannerSection from "@/components/HeroBannerSection";
import CafeCategories from "@/components/CafeCategories";
import { FeaturedCafeGrid } from '../components/FeaturedCafeGrid';
import CafeIconGrid from '../components/CafeIconGrid';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '../integrations/supabase/client';
// import { useAuth } from '@/hooks/useAuth'; // Not needed for this component
// import { useCafeRewards } from '@/hooks/useCafeRewards'; // Disabled for simplified version
import { Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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
}

// Rewards Section removed for simplified version

const Index = () => {
  console.log('🎬 Index component rendering...');
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Index: useEffect triggered, calling fetchCafes...');
    fetchCafes();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('⏰ Index: Timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

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
          console.log('🏪 Index: Cafe updated via real-time:', payload.new);
          
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
      .subscribe((status) => {
        console.log('📡 Index: Cafe subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCafes = async () => {
    try {
      console.log('🔍 Index: Starting cafe fetch...');
      setLoading(true);
      
      // Try RPC function first
      let data = null;
      let error = null;
      
      try {
        console.log('🔍 Index: Trying RPC function get_cafes_ordered...');
        const rpcResult = await supabase.rpc('get_cafes_ordered');
        data = rpcResult.data;
        error = rpcResult.error;
        
        if (error) {
          console.warn('⚠️ Index: RPC function failed, trying direct query:', error.message);
        } else {
          console.log('✅ Index: RPC function successful, got', data?.length || 0, 'cafes');
          console.log('✅ Index: RPC data sample:', data?.slice(0, 2));
        }
      } catch (rpcError) {
        console.warn('⚠️ Index: RPC function exception, trying direct query:', rpcError);
        error = rpcError;
      }
      
      // Fallback to direct query if RPC fails
      if (error || !data || data.length === 0) {
        console.log('🔄 Index: Trying direct table query...');
        
        const directResult = await supabase
        .from('cafes')
          .select('id, name, type, description, location, slug, priority, accepting_orders, is_active, average_rating, total_ratings, image_url, phone, hours, cuisine_categories')
          .eq('accepting_orders', true)
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .limit(20);
        
        if (directResult.error) {
          console.error('❌ Index: Direct query also failed:', directResult.error);
          // Don't throw error, just use empty array
          data = [];
        } else {
          data = directResult.data;
          console.log('✅ Index: Direct query successful, got', data?.length || 0, 'cafes');
        }
      }
      
      if (data && data.length > 0) {
        console.log('✅ Index: Successfully fetched cafes:', data.length);
        console.log('✅ Index: First few cafes:', data.slice(0, 3).map(c => c.name));
        setCafes(data);
      } else {
        console.log('⚠️ Index: No cafes found in database');
        setCafes([]);
      }
      
    } catch (error) {
      console.error('❌ Index: All cafe fetching methods failed:', error);
      setCafes([]);
    } finally {
      console.log('🏁 Index: Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header with Location and Profile */}
      <SimpleHeader />
      
      {/* Search Bar */}
      <SearchBar />
      
      {/* Hero Banner Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HeroBannerSection />
      </div>
      
      {/* Cafe Categories */}
      {!loading && cafes.length > 0 && (
        <CafeCategories cafes={cafes} />
      )}
      
      <main className="m-0 p-0">
        {/* Unified Cafe Section - Merged Icon Grid + Cafe Cards */}
        <section id="cafes" className="pt-4 pb-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Single Section Header */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Explore all cafes nearby!
              </h2>
            </div>

            {/* Cafe Icon Grid with Slide Buttons */}
            {!loading && cafes.length > 0 && (
              <div className="mb-12">
                <CafeIconGrid cafes={cafes} />
              </div>
            )}

            {/* Limited Cafe Grid - Show 6 cafes */}
            {!loading && cafes.length > 0 && (
              <div className="cafe-grid">
            <FeaturedCafeGrid showAll={false} maxCafes={6} cafes={cafes} />
              </div>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Loading cafes...</h3>
                <p className="text-muted-foreground">
                  Please wait while we fetch the latest cafes.
                </p>
                <button 
                  onClick={() => {
                    console.log('🔄 Manual fetch triggered');
                    setLoading(true);
                    fetchCafes();
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry Fetch
                </button>
              </div>
            )}
            
            {/* No Cafes State */}
            {!loading && cafes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No cafes available</h3>
                <p className="text-muted-foreground">
                  Please check back later for available cafes.
                </p>
              </div>
            )}
          </div>
        </section>
        
        {/* Rewards Section removed for simplified version */}
      </main>
    </div>
  );
};

export default Index;