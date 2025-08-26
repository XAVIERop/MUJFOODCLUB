import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Clock, MapPin, Phone, ShoppingCart, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  rating: number;
  total_reviews: number;
}

const Cafes = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setCafes(data || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
      toast({
        title: "Error",
        description: "Failed to load cafes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMenu = (cafeId: string) => {
    navigate(`/menu/${cafeId}`);
  };

  const handleOrderNow = (cafeId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to place orders",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    navigate(`/menu/${cafeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cafes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Explore Cafes
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover delicious food from our partner cafes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cafes Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe, index) => (
            <Card 
              key={cafe.id}
              className="group food-card animate-fade-in border-0 overflow-hidden hover:shadow-glow transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image Section */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary/30">{cafe.name}</div>
                </div>
                
                {/* Status Badge */}
                <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                  Open
                </Badge>

                {/* Rating Badge */}
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {cafe.rating}
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{cafe.name}</h3>
                  <Badge variant="secondary">{cafe.type}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground">{cafe.description}</p>

                {/* Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    {cafe.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    {cafe.hours}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    {cafe.phone}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(cafe.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({cafe.total_reviews} reviews)
                  </span>
                </div>

                {/* Delivery Time */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    Delivery: 15-20 min
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewMenu(cafe.id)}
                  >
                    View Menu
                  </Button>
                  <Button 
                    variant="order" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOrderNow(cafe.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cafes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Cafes Available</h3>
            <p className="text-muted-foreground">Check back later for new cafes!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cafes;
