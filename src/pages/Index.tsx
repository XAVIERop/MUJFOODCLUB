import React, { useState, useEffect } from 'react';
import SimpleHeader from "@/components/SimpleHeader";
import SearchBar from "@/components/SearchBar";
import HeroBannerSection from "@/components/HeroBannerSection";
import CafeCategories from "@/components/CafeCategories";
import { FeaturedCafeGrid } from '../components/FeaturedCafeGrid';
import CafeIconGrid from '../components/CafeIconGrid';
import MobileLayoutWrapper from '../components/MobileLayoutWrapper';
import MobileLayout from '../components/MobileLayout';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState("B1");

  useEffect(() => {
    fetchCafes();
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
      console.log('🔍 Fetching cafes...');
      
      // Try RPC function first
      let data = null;
      let error = null;
      
      try {
        const rpcResult = await supabase.rpc('get_cafes_ordered');
        data = rpcResult.data;
        error = rpcResult.error;
        
        if (error) {
          console.warn('⚠️ RPC function failed, trying direct query:', error.message);
        }
      } catch (rpcError) {
        console.warn('⚠️ RPC function exception, trying direct query:', rpcError);
        error = rpcError;
      }
      
      // Fallback to direct query if RPC fails
      if (error || !data || data.length === 0) {
        console.log('🔄 Trying direct table query...');
        
        const directResult = await supabase
          .from('cafes')
          .select('id, name, type, description, location, slug, priority, accepting_orders, average_rating, total_ratings, image_url')
          .eq('is_active', true)
          .order('priority', { ascending: true })
          .limit(20);
        
        if (directResult.error) {
          console.error('❌ Direct query also failed:', directResult.error);
          throw directResult.error;
        }
        
        data = directResult.data;
        console.log('✅ Direct query successful');
      }
      
      if (data && data.length > 0) {
        console.log('✅ Successfully fetched cafes:', data.length);
        console.log('✅ First few cafes:', data.slice(0, 3).map(c => c.name));
        setCafes(data);
      } else {
        console.log('⚠️ No cafes found in database');
        setCafes([]);
      }
      
    } catch (error) {
      console.error('❌ All cafe fetching methods failed:', error);
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
        />
      }
    >
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
              <div className="cafe-grid">
                <FeaturedCafeGrid showAll={false} maxCafes={6} cafes={cafes} />
              </div>
            </div>
          </section>
          
          {/* Rewards Section removed for simplified version */}
        </main>
      </div>
    </MobileLayoutWrapper>
  );
};

export default Index;