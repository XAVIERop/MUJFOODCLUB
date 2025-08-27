import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from './QRCodeDisplay';

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

        <div className="flex justify-center">
          {user && profile ? (
            <QRCodeDisplay profile={profile} variant="simple" />
          ) : (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <QrCode className="w-6 h-6 text-primary" />
                  <span>Get Your QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-48 h-48 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Sign in to get your personalized QR code and start earning rewards
                  </p>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Generate My QR Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default QRCodeSection;