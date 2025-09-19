import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowRight, Star, Gift, TrendingUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const QRCodeSection = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <section id="qr-code" className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Your Personal QR Code
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your unique QR code to earn rewards, track orders, and enjoy exclusive discounts at all partner cafes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Feature 1 */}
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Quick & Easy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Simply show your QR code to cafe staff for instant order linking and automatic rewards
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-xl">Track Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your order status and delivery progress in real-time
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your order history, loyalty tier progress, and total savings in real-time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          {user && profile ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{profile.full_name}</span>!
              </p>
              <div className="flex items-center justify-center space-x-6">
                <Button 
                  onClick={() => navigate('/orders')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Package className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/qr-code')}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  My QR Code
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Join thousands of students already earning rewards
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QRCodeSection;