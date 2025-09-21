import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PhoneOTPVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: (verifiedPhone: string) => void;
  onBack: () => void;
}

const PhoneOTPVerification: React.FC<PhoneOTPVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onBack
}) => {
  const { sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Auto-send OTP when component mounts
  useEffect(() => {
    if (phoneNumber && !isOTPSent) {
      handleSendOTP();
    }
  }, [phoneNumber]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await sendPhoneOTP(phoneNumber);
      
      if (error) {
        setError(error.message || 'Failed to send OTP');
        toast({
          title: "OTP Send Failed",
          description: error.message || 'Failed to send OTP. Please try again.',
          variant: "destructive"
        });
      } else {
        setIsOTPSent(true);
        setResendTimer(30); // 30 seconds cooldown
        setCanResend(false);
        toast({
          title: "OTP Sent Successfully",
          description: `OTP sent to +91${phoneNumber}`,
        });
      }
    } catch (err) {
      setError('Failed to send OTP');
      toast({
        title: "OTP Send Failed",
        description: 'Failed to send OTP. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await verifyPhoneOTP(phoneNumber, otp);
      
      if (error) {
        setError(error.message || 'Invalid OTP');
        toast({
          title: "OTP Verification Failed",
          description: error.message || 'Invalid OTP. Please try again.',
          variant: "destructive"
        });
      } else {
        setIsVerified(true);
        toast({
          title: "Phone Verified Successfully",
          description: "Your phone number has been verified!",
        });
        
        // Call success callback after a short delay
        setTimeout(() => {
          onVerificationSuccess(phoneNumber);
        }, 1000);
      }
    } catch (err) {
      setError('Failed to verify OTP');
      toast({
        title: "OTP Verification Failed",
        description: 'Failed to verify OTP. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    await handleSendOTP();
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle>Verify Your Phone Number</CardTitle>
          <p className="text-sm text-muted-foreground">
            We need to verify your phone number to ensure delivery success
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Phone Number Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Sending OTP to:</p>
            <p className="font-semibold text-lg">+91 {phoneNumber}</p>
          </div>

          {/* Success State */}
          {isVerified && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Phone Verified!</h3>
                <p className="text-sm text-green-600">Your phone number has been verified successfully</p>
              </div>
            </div>
          )}

          {/* OTP Input */}
          {!isVerified && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOTPChange}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full"
                size="lg"
                variant="hero"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the OTP?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-orange-600 hover:text-orange-700"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-full"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneOTPVerification;
