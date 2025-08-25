import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, Trophy, Home, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const orderNumber = location.state?.orderNumber;
  const order = location.state?.order;
  const pointsEarned = location.state?.pointsEarned || 0;

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
    }
  }, [orderNumber, navigate]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your order has been successfully placed
            </p>
          </div>

          {/* Order Details */}
          <Card className="food-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Number</span>
                <Badge variant="secondary" className="font-mono">
                  {orderNumber}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold text-lg">₹{order?.total_amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{order?.payment_method}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Delivery Block</span>
                <span>Block {order?.delivery_block}</span>
              </div>

              {order?.delivery_notes && (
                <div className="pt-4 border-t border-border">
                  <span className="text-muted-foreground block mb-2">Delivery Notes</span>
                  <p className="text-sm">{order.delivery_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card className="food-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Estimated delivery time: <strong>30-45 minutes</strong></span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>Delivery to: <strong>Block {order?.delivery_block}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points Earned */}
          {pointsEarned > 0 && (
            <Card className="food-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Loyalty Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    +{pointsEarned} pts
                  </div>
                  <p className="text-muted-foreground">
                    You've earned {pointsEarned} loyalty points for this order!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/#cafes')}
              className="flex-1"
              variant="hero"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Again
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>You will receive updates about your order status via email.</p>
            <p className="mt-2">
              Need help? Contact us at <span className="text-primary">support@foodclub.muj</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
