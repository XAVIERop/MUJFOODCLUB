import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, sendOTP, verifyOTP, resendConfirmationEmail } = useAuth();
  const { toast } = useToast();

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  // Signin form
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: ''
  });

  // Signup form
  const [signupForm, setSignupForm] = useState({
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: '', 
    block: 'B1'
  });

  // OTP form
  const [otpForm, setOtpForm] = useState({
    email: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signinForm.email, signinForm.password);
    
    if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive"
        });
    } else {
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in to your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password match
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
        setIsLoading(false);
        return;
      }

    // Validate email domain
    if (!signupForm.email.endsWith('@muj.manipal.edu')) {
      toast({
        title: "Invalid Email",
        description: "Please use your MUJ email address (@muj.manipal.edu).",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(
        signupForm.email,
        signupForm.password,
        signupForm.fullName,
        signupForm.block
      );
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message || "Please try again with different credentials.",
          variant: "destructive"
        });
    } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account before signing in.",
        });
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email domain
    if (!otpForm.email.endsWith('@muj.manipal.edu')) {
      toast({
        title: "Invalid Email",
        description: "Please use your MUJ email address (@muj.manipal.edu).",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      // Use magic link for passwordless sign-in
      const { error } = await supabase.auth.signInWithOtp({
        email: otpForm.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: true
        }
      });
    
    if (error) {
        toast({
          title: "Magic Link Failed",
          description: error.message || "Please try again.",
          variant: "destructive"
        });
    } else {
        setOtpEmail(otpForm.email);
        setShowOTP(true);
        toast({
          title: "Magic Link Sent!",
          description: "Please check your email and click the sign-in link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await verifyOTP(otpEmail, otpValue);
      
      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message || "Please check the code and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Verified!",
          description: "Your account has been successfully verified.",
        });
        setShowOTP(false);
        setOtpValue('');
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
    setIsLoading(false);
    }
  };

  const blockOptions = [
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Back to Home */}
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Auth Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
          </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome to Food Club
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Sign in to your account or create a new one
              </p>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                          placeholder="your.email@muj.manipal.edu"
                          value={signinForm.email}
                          onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                          className="pl-10"
                      required
                    />
                  </div>
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type="password"
                          placeholder="Enter your password"
                          value={signinForm.password}
                          onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                          className="pl-10"
                      required
                    />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Resend Confirmation Email */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Didn't receive confirmation email?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (signinForm.email) {
                          setIsLoading(true);
                          const { error } = await resendConfirmationEmail(signinForm.email);
                          if (error) {
                            toast({
                              title: "Error",
                              description: error.message || "Failed to resend email",
                              variant: "destructive"
                            });
                          } else {
                            toast({
                              title: "Email Sent",
                              description: "Confirmation email has been resent. Check your inbox.",
                            });
                          }
                          setIsLoading(false);
                        }
                      }}
                      disabled={!signinForm.email || isLoading}
                      className="text-xs"
                    >
                      Resend Confirmation Email
                    </Button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  
                  <Button 
                     variant="outline"
                     onClick={() => setActiveTab('otp')}
                    className="w-full" 
                  >
                     <Mail className="w-4 h-4 mr-2" />
                     Quick Email Verification
                  </Button>
            </TabsContent>
            
                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-4">
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Only MUJ students with @muj.manipal.edu emails can sign up.
                    </AlertDescription>
                  </Alert>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="signup-email">MUJ Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@muj.manipal.edu"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-10"
                      required
                    />
                  </div>
                      {signupForm.email && !signupForm.email.endsWith('@muj.manipal.edu') && (
                        <p className="text-sm text-red-500">Please use your MUJ email address</p>
                      )}
                    </div>

                  <div className="space-y-2">
                      <Label htmlFor="signup-fullname">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                          id="signup-fullname"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                          className="pl-10"
                      required
                    />
                  </div>
                  </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="signup-block">Hostel Block</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <select
                          id="signup-block"
                          value={signupForm.block}
                          onChange={(e) => setSignupForm({ ...signupForm, block: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        >
                          {blockOptions.map((block) => (
                            <option key={block} value={block}>
                              Block {block}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                          placeholder="Create a strong password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="pl-10"
                      required
                    />
                  </div>
                      {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                        <p className="text-sm text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Email Verification Tab */}
                <TabsContent value="otp" className="space-y-4">
                  {!showOTP ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <Alert className="mb-4">
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                          Enter your MUJ email to receive a verification link.
                        </AlertDescription>
                    </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="otp-email">MUJ Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="otp-email"
                            type="email"
                            placeholder="your.email@muj.manipal.edu"
                            value={otpForm.email}
                            onChange={(e) => setOtpForm({ email: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Verification...
                          </>
                        ) : (
                          'Send Verification Email'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <Alert className="mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          We've sent a verification email to {otpEmail}
                        </AlertDescription>
                      </Alert>

                                             <div className="text-center space-y-4">
                         <div className="p-4 bg-blue-50 rounded-lg">
                           <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                           <ol className="text-sm text-blue-800 space-y-1 text-left">
                             <li>1. Check your email inbox</li>
                             <li>2. Click the magic link in the email</li>
                             <li>3. You'll be automatically signed in</li>
                             <li>4. Your account will be created automatically</li>
                           </ol>
                         </div>

                        <div className="text-sm text-gray-600">
                          <p>Didn't receive the email? Check your spam folder or try again.</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowOTP(false);
                              setOtpValue('');
                            }}
                            className="flex-1"
                          >
                            Try Again
                          </Button>
                  <Button 
                            variant="outline"
                            onClick={() => setActiveTab('signin')}
                          >
                            Back to Sign In
                  </Button>
                        </div>
                      </div>
                    </div>
                  )}
            </TabsContent>
          </Tabs>
            </CardContent>
        </Card>
        
          {/* Features */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Why Sign Up?
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Order from all campus cafes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Earn loyalty points & rewards</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Track orders in real-time</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Exclusive student discounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;