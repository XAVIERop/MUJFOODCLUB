import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Smartphone, Gift, Zap, Shield, Crown } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import qrFeature from "@/assets/qr-feature.jpg";
import QRCodeDisplay from "./QRCodeDisplay";

const QRCodeSection = () => {
  const { user, profile } = useAuth();

  return (
    <section id="qr-code" className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 gradient-primary text-white">
                <QrCode className="w-4 h-4 mr-2" />
                Smart QR System
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Your Personal Food{" "}
                <span className="gradient-primary bg-clip-text text-transparent">
                  Loyalty ID
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Get your unique QR code after logging in with your MUJ email. 
                Scan it at any cafe to earn rewards and unlock exclusive discounts!
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full gradient-success flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Instant Access</h4>
                  <p className="text-muted-foreground text-sm">
                    Login with @muj.manipal.edu and get your QR instantly
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Fast Scanning</h4>
                  <p className="text-muted-foreground text-sm">
                    Quick scan at checkout for instant rewards
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Secure & Private</h4>
                  <p className="text-muted-foreground text-sm">
                    Your data is encrypted and only used for rewards
                  </p>
                </div>
              </div>
            </div>

            {!user ? (
              <Button variant="hero" size="lg" className="animate-pulse-glow">
                <QrCode className="w-5 h-5 mr-2" />
                Generate My QR Code
              </Button>
            ) : (
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  ✅ You're logged in! Your QR code is ready below.
                </p>
              </div>
            )}
          </div>

          {/* Right Content - Show QR Code if logged in, otherwise show image */}
          <div className="relative">
            {user && profile ? (
              <QRCodeDisplay />
            ) : (
              <>
                <div className="relative rounded-2xl overflow-hidden shadow-card animate-float">
                  <img 
                    src={qrFeature} 
                    alt="QR Code Feature" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Floating Cards */}
                <Card className="absolute -top-4 -left-4 w-32 animate-bounce-soft shadow-glow border-0">
                  <CardContent className="p-4 text-center">
                    <Gift className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-xs font-semibold">Instant Rewards</p>
                  </CardContent>
                </Card>

                <Card className="absolute -bottom-4 -right-4 w-32 animate-float shadow-glow border-0">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold">VIP Status</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QRCodeSection;