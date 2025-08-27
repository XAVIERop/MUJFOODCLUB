import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, QrCode, User, MapPin, Trophy, Star } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  block: string;
  phone?: string;
  qr_code: string;
  loyalty_points: number;
  loyalty_tier: string;
  total_orders: number;
  total_spent: number;
}

interface QRCodeDisplayProps {
  profile: Profile;
}

const QRCodeDisplay = ({ profile }: QRCodeDisplayProps) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [profile.qr_code]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(profile.qr_code, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQRCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.qr_code);
      toast({
        title: "Copied!",
        description: "QR code copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast({
        title: "Error",
        description: "Failed to copy QR code",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = async () => {
    try {
      const link = document.createElement('a');
      link.download = `${profile.full_name}_QR_${profile.qr_code}.png`;
      link.href = qrCodeDataUrl;
      link.click();
      toast({
        title: "Downloaded!",
        description: "QR code saved to your device",
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return 'bg-purple-500 text-white';
      case 'gourmet':
        return 'bg-blue-500 text-white';
      case 'foodie':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'connoisseur':
        return '👑';
      case 'gourmet':
        return '⭐';
      case 'foodie':
        return '🍽️';
      default:
        return '🍽️';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="w-6 h-6 text-primary" />
          <span>Your QR Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Generating QR Code...</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto border-2 border-border rounded-lg"
              />
              <p className="text-lg font-mono font-bold text-primary mt-2">
                {profile.qr_code}
              </p>
            </div>
          )}
        </div>

        {/* Student Information */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold text-center flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Student Information</span>
          </h3>
          
          <div className="space-y-3">
            {/* Name and Email */}
            <div className="text-center">
              <p className="font-semibold text-lg">{profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>

            {/* Block */}
            <div className="flex items-center justify-center space-x-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Block: {profile.block}</span>
            </div>

            {/* Phone (if available) */}
            {profile.phone && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm">📞 {profile.phone}</span>
              </div>
            )}

            {/* Loyalty Tier */}
            <div className="flex items-center justify-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <Badge className={getTierColor(profile.loyalty_tier)}>
                {getTierIcon(profile.loyalty_tier)} {profile.loyalty_tier.charAt(0).toUpperCase() + profile.loyalty_tier.slice(1)}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 bg-background rounded">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="font-bold text-primary">{profile.loyalty_points}</p>
              </div>
              <div className="p-2 bg-background rounded">
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="font-bold text-primary">{profile.total_orders}</p>
              </div>
            </div>

            {/* Total Spent */}
            <div className="text-center p-2 bg-background rounded">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="font-bold text-green-600">₹{profile.total_spent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={copyQRCode}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadQRCode}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Show this QR code to cafe staff for:</p>
          <ul className="mt-1 space-y-1">
            <li>• Automatic tier-based discounts</li>
            <li>• Quick order processing</li>
            <li>• Loyalty points tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
