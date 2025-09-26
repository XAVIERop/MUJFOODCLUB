import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserOrdersQuery } from '@/hooks/useOrdersQuery';
import OrderAnalytics from '@/components/OrderAnalytics';

const OrderAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    data: orders = [], 
    isLoading, 
    error 
  } = useUserOrdersQuery(user?.id || null, {
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-6">You need to sign in to view your order analytics.</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Error Loading Analytics</h1>
            <p className="text-muted-foreground mb-6">Failed to load your order analytics. Please try again.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order Analytics</h1>
              <p className="text-muted-foreground">
                Insights and statistics about your ordering habits
              </p>
            </div>
          </div>

          {/* Analytics Component */}
          <OrderAnalytics orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default OrderAnalyticsPage;
