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
      console.log('🔍 Environment check:', {
        SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        supabase: supabase ? 'Initialized' : 'Not initialized',
        rpcMethod: typeof supabase?.rpc === 'function' ? 'Available' : 'Missing'
      });
      
      // Use the same working pattern as Cafes page
      let { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.error('❌ Error fetching cafes:', error);
        throw error;
      }

      // Ensure data is an array
      const cafesData = Array.isArray(data) ? data : [];
      
      if (cafesData.length > 0) {
        console.log('✅ Successfully fetched cafes:', cafesData.length);
        console.log('✅ First few cafes:', cafesData.slice(0, 3).map(c => c.name));
        setCafes(cafesData);
      } else {
        console.log('⚠️ No cafes found in database');
        setCafes([]);
      }
      
    } catch (error) {
      console.error('❌ Cafe fetching failed:', error);
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