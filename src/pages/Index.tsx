import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import { CafeGrid } from '../components/CafeGrid';
import CafeIconGrid from '../components/CafeIconGrid';
import { Badge } from "@/components/ui/badge";
import { supabase } from '../integrations/supabase/client';

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
}

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching cafes:', error);
        return;
      }

      setCafes(data || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="m-0 p-0">
        <HeroSection />
        
        {/* Cafe Icon Grid Section - NEW BETA 1.1 FEATURE */}
        {!loading && cafes.length > 0 && (
          <CafeIconGrid cafes={cafes} />
        )}

        {/* Cafe Grid Section - EXISTING */}
        <section id="cafes" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 gradient-success text-white">
                Popular Cafes
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Choose Your Favorite Cafe
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover delicious food from our partner cafes and earn rewards with every order
              </p>
            </div>

            {/* Limited Cafe Grid - Show only 3 cafes */}
            <CafeGrid showAll={false} maxCafes={3} />
          </div>
        </section>
        
        <LoyaltyProgram />
      </main>
    </div>
  );
};

export default Index;