import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, Copy, CheckCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const QRCodeDisplay = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.qr_code) {
      generateQRCode();
    }
  }, [profile?.qr_code]);

  const generateQRCode = async () => {
    if (!profile?.qr_code) return;
    
    setIsGenerating(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(profile.qr_code, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      const link = document.createElement('a');
      link.download = `foodclub-qr-${profile?.full_name || 'user'}.png`;
      link.href = qrCodeDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been saved to your device.",
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Download Error",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyQRCode = async () => {
    if (!profile?.qr_code) return;
    
    try {
      await navigator.clipboard.writeText(profile.qr_code);
      setCopied(true);
      toast({
        title: "QR Code Copied",
        description: "Your QR code has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast({
        title: "Copy Error",
        description: "Failed to copy QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user || !profile) {
    return (
      <Card className="food-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <QrCode className="w-5 h-5 mr-2" />
            Your QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Please sign in to view your QR code</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="food-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <QrCode className="w-5 h-5 mr-2" />
          Your QR Code
        </CardTitle>
        <p className="text-white/70 text-sm">
          Show this QR code at any cafe to earn rewards and track your orders
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt="Your QR Code" 
                className="w-48 h-48 mx-auto rounded-lg border-4 border-white shadow-lg"
              />
              <p className="text-xs text-white/60 mt-2 font-mono">
                {profile.qr_code}
              </p>
            </div>
          ) : (
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-white">{profile.full_name}</h3>
          <Badge variant="secondary" className="text-xs">
            Block {profile.block}
          </Badge>
          <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
            <span>{profile.loyalty_points} points</span>
            <span>•</span>
            <span className="capitalize">{profile.loyalty_tier}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={downloadQRCode}
            disabled={!qrCodeDataUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={copyQRCode}
            disabled={!profile.qr_code}
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">How to use:</h4>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• Show this QR code when ordering at any cafe</li>
            <li>• Staff will scan it to link your order to your account</li>
            <li>• Earn loyalty points with every purchase</li>
            <li>• Track your order history and rewards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
