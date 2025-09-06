import React, { useState, useEffect } from 'react';
import SimpleHeader from "@/components/SimpleHeader";
import SearchBar from "@/components/SearchBar";
import CafeCategories from "@/components/CafeCategories";
import { FeaturedCafeGrid } from '../components/FeaturedCafeGrid';
import CafeIconGrid from '../components/CafeIconGrid';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCafeRewards } from '@/hooks/useCafeRewards';
import { Trophy, Star, Gift, Crown, Coffee, Award, ArrowRight } from "lucide-react";
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

// New Rewards Section Component
const RewardsSection = () => {
  const { user } = useAuth();
  const { cafeRewards, loading } = useCafeRewards();
  const navigate = useNavigate();

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'gourmet':
        return <Award className="h-5 w-5 text-blue-500" />;
      default:
        return <Coffee className="h-5 w-5 text-green-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'gourmet':
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (!user) {
    return (
      <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Earn Rewards at Every Cafe
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our loyalty program and earn points, unlock tiers, and get exclusive discounts at each cafe independently.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-orange-600 hover:bg-orange-700">
              Sign In to Start Earning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Trophy className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Your Cafe Rewards
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your loyalty status and earn points at each cafe independently
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your rewards...</p>
          </div>
        ) : cafeRewards.length === 0 ? (
          <div className="text-center">
            <Coffee className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Earning Rewards</h3>
            <p className="text-muted-foreground mb-6">
              Place your first order to start earning points and unlock tier benefits!
            </p>
            <Button onClick={() => navigate('/cafes')} size="lg" className="bg-orange-600 hover:bg-orange-700">
              Browse Cafes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {cafeRewards.slice(0, 3).map((cafe) => (
              <Card key={cafe.cafe_id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cafe.cafe_name}</CardTitle>
                    <Badge className={getTierColor(cafe.tier)}>
                      {getTierIcon(cafe.tier)}
                      <span className="ml-1 capitalize">{cafe.tier}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium">Points</span>
                    </div>
                    <span className="text-lg font-bold">{cafe.points}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Discount</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {cafe.discount_percentage}%
                    </span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>This Month</span>
                      <span>₹{cafe.monthly_spend.toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {cafeRewards.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              onClick={() => navigate('/rewards')} 
              variant="outline" 
              size="lg"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              View All Rewards
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

const Index = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      console.log('🚀 Index.tsx: Fetching cafes using get_cafes_ordered...', new Date().toISOString());
      
      // Use the priority-based ordering function
      const { data, error } = await supabase
        .rpc('get_cafes_ordered');

      if (error) {
        console.error('❌ Index.tsx: Error fetching cafes:', error);
        console.error('❌ Error details:', error.message, error.details, error.hint);
        return;
      }

      const cafesData = Array.isArray(data) ? data : [];
      console.log('✅ Index.tsx: Cafes fetched successfully:', cafesData.length, 'cafes');
      if (cafesData.length > 0) {
        console.log('✅ Index.tsx: First 5 cafes with priorities:', cafesData.slice(0, 5).map(c => `${c.name} (Priority: ${c.priority}, Rating: ${c.average_rating})`));
      }

      setCafes(cafesData);
    } catch (error) {
      console.error('❌ Index.tsx: Exception fetching cafes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header with Location and Profile */}
      <SimpleHeader />
      
      {/* Search Bar */}
      <SearchBar />
      
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
            <FeaturedCafeGrid showAll={false} maxCafes={6} cafes={cafes} />
          </div>
        </section>
        
        <RewardsSection />
      </main>
    </div>
  );
};

export default Index;