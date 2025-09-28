import { useState, useEffect } from 'react';
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
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, sendOTP, verifyOTP, resendConfirmationEmail, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  
  // Password strength states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

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
    block: 'B1',
    phone: ''
  });

  // OTP form
  const [otpForm, setOtpForm] = useState({
    email: ''
  });


  // Scroll to top hook
  const { scrollToTopOnTabChange } = useScrollToTop();

  // Handle password reset flow - simplified approach
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'reset-password') {
      // User clicked password reset link - they're already signed in via email
      toast({
        title: "Password Reset Complete!",
        description: "You have been signed in successfully. You can now change your password from your profile if needed.",
        variant: "default"
      });
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Password strength validation function
  const validatePasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let feedback = '';
    if (score === 0) feedback = 'Very Weak';
    else if (score === 1) feedback = 'Weak';
    else if (score === 2) feedback = 'Fair';
    else if (score === 3) feedback = 'Good';
    else if (score === 4) feedback = 'Strong';
    else if (score === 5) feedback = 'Very Strong';

    setPasswordStrength({
      score,
      feedback,
      requirements
    });

    return score >= 4; // Require at least 4 out of 5 requirements
  };

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

    // Validate phone number
    if (!signupForm.phone || signupForm.phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePasswordStrength(signupForm.password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
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
        signupForm.block,
        signupForm.phone
      );
      
      if (error) {
        // Handle specific error cases
        if (error.code === 'user_already_exists') {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Please try signing in instead.",
            variant: "destructive"
          });
          
          // Switch to sign-in tab and pre-fill email
          setActiveTab('signin');
          setSigninForm({ ...signinForm, email: signupForm.email });
          
          // Show additional guidance after a delay
          setTimeout(() => {
            toast({
              title: "💡 Need Help?",
              description: "If you forgot your password, you can reset it from the sign-in page.",
              variant: "default"
            });
          }, 2000);
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Please try again with different credentials.",
            variant: "destructive"
          });
        }
    } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account before signing in.",
        });
        
        // Show additional notice about junk folder
        setTimeout(() => {
          toast({
            title: "📧 Check Your Junk/Spam Folder!",
            description: "If you don't see the verification email, please check your junk/spam folder. We're working on improving email deliverability.",
            variant: "default"
          });
        }, 1000);
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(signinForm.email);
      
      if (error) {
        if (error.code === 'email_not_found') {
          toast({
            title: "Email Not Found",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Reset Failed",
            description: error.message || "Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Reset Email Sent!",
          description: "Check your email for a confirmation link. Click it to sign in automatically.",
        });
        
        // Clear the email field
        setSigninForm({ ...signinForm, email: '' });
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
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12',
    'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden pb-24 lg:pb-0">
      {/* Mobile: Hero Image Section - Top 35% */}
      <div className="relative h-[35vh] lg:hidden bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 overflow-hidden">
        {/* Food Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='foodGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:0.8' /%3E%3Cstop offset='50%25' style='stop-color:%23dc2626;stop-opacity:0.6' /%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23foodGradient)'/%3E%3Crect x='50' y='80' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.9'/%3E%3Crect x='150' y='70' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.8'/%3E%3Crect x='250' y='75' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.7'/%3E%3Crect x='100' y='160' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.6'/%3E%3Crect x='200' y='150' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.5'/%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Back Button - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-white/80 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Logo/Brand - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg mb-4 border border-white/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Food Club
            </h1>
            <p className="text-white/90 text-lg">
              Experience campus dining at its finest
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Side-by-Side Layout */}
      <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
        {/* Desktop: Hero Section - Left Side */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-orange-500 lg:via-red-500 lg:to-orange-600 lg:relative lg:overflow-hidden">
          {/* Desktop Food Image Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='foodGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:0.8' /%3E%3Cstop offset='50%25' style='stop-color:%23dc2626;stop-opacity:0.6' /%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23foodGradient)'/%3E%3Crect x='50' y='80' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.9'/%3E%3Crect x='150' y='70' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.8'/%3E%3Crect x='250' y='75' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.7'/%3E%3Crect x='100' y='160' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.6'/%3E%3Crect x='200' y='150' width='80' height='60' rx='8' fill='%23ffffff' opacity='0.5'/%3E%3C/svg%3E")`
            }}
          ></div>
          
          {/* Desktop Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          {/* Desktop Back Button - Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:text-white/80 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Desktop Logo/Brand - Center */}
          <div className="relative z-10 text-center px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl shadow-lg mb-6 border border-white/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Welcome to Food Club
            </h1>
            <p className="text-white/90 text-xl lg:text-2xl mb-8">
              Experience campus dining at its finest
            </p>
            
            {/* Desktop Features */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-white font-medium text-sm">Order from all cafes</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-white font-medium text-sm">Loyalty rewards</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-white font-medium text-sm">Real-time tracking</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-white font-medium text-sm">Student discounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Section - Right Side (Desktop) / Bottom (Mobile) */}
        <div className="relative -mt-8 lg:mt-0">
          {/* Mobile: Curved Top Border */}
          <div className="h-8 lg:hidden bg-white rounded-t-3xl"></div>
          
          {/* Main Card Content */}
          <div className="bg-white min-h-[65vh] lg:min-h-screen lg:rounded-none rounded-t-3xl shadow-2xl lg:shadow-none lg:flex lg:items-center">
            <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:w-full overflow-y-auto max-h-[calc(100vh-35vh)] lg:max-h-none">
              <div className="max-w-md mx-auto lg:max-w-lg">

              {/* Auth Form */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Started
                </h2>
                <p className="text-gray-600">
                  Sign in or create your account
                </p>
              </div>

              <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              scrollToTopOnTabChange(value);
            }} 
            className="w-full"
          >
                <TabsList className="grid w-full mb-6 bg-gray-100 p-1 rounded-xl grid-cols-2">
                  <TabsTrigger 
                    value="signin" 
                    className="rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-2"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm py-2"
                  >
                    Sign Up
                  </TabsTrigger>
            </TabsList>
            
                {/* Sign In Tab */}
                <TabsContent value="signin" className="space-y-5">
                  <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                          placeholder="your.email@muj.manipal.edu"
                          value={signinForm.email}
                          onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                    </div>

                  <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signin-password"
                      type="password"
                          placeholder="Enter your password"
                          value={signinForm.password}
                          onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password */}
                  <div className="text-center py-4">
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Forgot your password?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (signinForm.email) {
                            setIsLoading(true);
                            const { error } = await resetPassword(signinForm.email);
                            if (error) {
                              toast({
                                title: "Error",
                                description: error.message || "Failed to send password reset email",
                                variant: "destructive"
                              });
                            } else {
                              toast({
                                title: "Password Reset Email Sent",
                                description: "Check your email for instructions to reset your password.",
                              });
                            }
                            setIsLoading(false);
                          } else {
                            toast({
                              title: "Email Required",
                              description: "Please enter your email address first.",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={!signinForm.email || isLoading}
                        className="text-sm h-10 rounded-lg border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>

            </TabsContent>
            
                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-5">
                  <Alert className="mb-5 border-green-200 bg-green-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium text-sm">
                      Only MUJ students with @muj.manipal.edu emails can sign up.
                    </AlertDescription>
                  </Alert>

                  {/* Junk Folder Notice */}
                  <Alert className="mb-5 border-orange-200 bg-orange-50 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm">
                      <strong>📧 Important:</strong> Check your <strong>junk/spam folder</strong> for verification email.
                    </AlertDescription>
                  </Alert>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">MUJ Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@muj.manipal.edu"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                      {signupForm.email && !signupForm.email.endsWith('@muj.manipal.edu') && (
                        <p className="text-sm text-red-500">Please use your MUJ email address</p>
                      )}
                    </div>

                  <div className="space-y-2">
                      <Label htmlFor="signup-fullname" className="text-sm font-medium text-gray-700">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                          id="signup-fullname"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.fullName}
                          onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                  </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="signup-block" className="text-sm font-medium text-gray-700">Hostel Block</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          id="signup-block"
                          value={signupForm.block}
                          onChange={(e) => setSignupForm({ ...signupForm, block: e.target.value })}
                          className="w-full pl-12 pr-3 py-3 h-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
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
                      <Label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          value={signupForm.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            if (value.length <= 10) {
                              setSignupForm({ ...signupForm, phone: value });
                            }
                          }}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                          required
                        />
                      </div>
                      {signupForm.phone && signupForm.phone.length !== 10 && (
                        <p className="text-sm text-red-500">Phone number must be exactly 10 digits</p>
                      )}
                    </div>

                  <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupForm.password}
                          onChange={(e) => {
                            setSignupForm({ ...signupForm, password: e.target.value });
                            validatePasswordStrength(e.target.value);
                          }}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signupForm.password && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Password Strength:</span>
                            <span className={`text-sm font-medium ${
                              passwordStrength.score >= 4 ? 'text-green-600' : 
                              passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {passwordStrength.feedback}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.score >= 4 ? 'bg-green-500' : 
                                passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          
                          {/* Password Requirements */}
                          <div className="space-y-1 text-xs">
                            <div className={`flex items-center gap-2 ${passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className="h-3 w-3" />
                              <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center gap-2 ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className="h-3 w-3" />
                              <span>One uppercase letter (A-Z)</span>
                            </div>
                            <div className={`flex items-center gap-2 ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className="h-3 w-3" />
                              <span>One lowercase letter (a-z)</span>
                            </div>
                            <div className={`flex items-center gap-2 ${passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className="h-3 w-3" />
                              <span>One number (0-9)</span>
                            </div>
                            <div className={`flex items-center gap-2 ${passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className="h-3 w-3" />
                              <span>One special character (!@#$%^&*)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                        <p className="text-sm text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>

                  {/* Resend Confirmation Email */}
                  <div className="text-center py-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Didn't receive confirmation email?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (signupForm.email) {
                            setIsLoading(true);
                            const { error } = await resendConfirmationEmail(signupForm.email);
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
                        disabled={!signupForm.email || isLoading}
                        className="text-sm h-10 rounded-lg border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                      >
                        Resend Confirmation Email
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Email Verification Tab */}
                <TabsContent value="otp" className="space-y-5">
                  {!showOTP ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                      <Alert className="mb-5 border-blue-200 bg-blue-50 rounded-xl">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800 font-medium text-sm">
                          Enter your MUJ email to receive a verification link.
                        </AlertDescription>
                      </Alert>

                      {/* Junk Folder Notice */}
                      <Alert className="mb-5 border-orange-200 bg-orange-50 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-sm">
                          <strong>📧 Important:</strong> Check your <strong>junk/spam folder</strong> if you don't receive the email.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="otp-email" className="text-sm font-medium text-gray-700">MUJ Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="otp-email"
                            type="email"
                            placeholder="your.email@muj.manipal.edu"
                            value={otpForm.email}
                            onChange={(e) => setOtpForm({ email: e.target.value })}
                            className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Verification Email'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <Alert className="mb-5 border-green-200 bg-green-50 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium text-sm">
                          We've sent a verification email to {otpEmail}
                        </AlertDescription>
                      </Alert>

                      <div className="text-center space-y-5">
                        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-4 text-base">Next Steps:</h4>
                          <ol className="text-sm text-blue-800 space-y-3 text-left">
                            <li className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                              Check your email inbox
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                              Click the magic link in the email
                            </li>
                            <li className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                              You'll be automatically signed in
                            </li>
                           </ol>
                         </div>

                        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-xl">
                          <p><strong>📧 Didn't receive the email?</strong> Check your <strong>junk/spam folder</strong> first.</p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => {
                              setShowOTP(false);
                              setOtpValue('');
                            }}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                          >
                            Try Again
                          </Button>
                  <Button 
                            variant="outline"
                            onClick={() => setActiveTab('signin')}
                            className="flex-1 h-12 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                          >
                            Back to Sign In
                  </Button>
                        </div>
                      </div>
                    </div>
                  )}
            </TabsContent>

          </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;