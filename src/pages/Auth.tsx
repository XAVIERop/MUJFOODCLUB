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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  EyeOff,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ReferralCodeInput from '@/components/ReferralCodeInput';
import { ReferralValidation } from '@/services/referralService';

// Quick locations for sign-up (same as LocationPicker)
const ALL_LOCATIONS = [
  // Campus Hostels
  { name: 'GHS Boys Hostel', category: 'Campus', lat: 26.8432, lng: 75.5659, address: 'GHS Boys Hostel, Manipal University Jaipur, Dehmi Kalan, Jaipur' },
  { name: 'GHS Girls Hostel', category: 'Campus', lat: 26.8428, lng: 75.5655, address: 'GHS Girls Hostel, Manipal University Jaipur, Dehmi Kalan, Jaipur' },
  { name: 'MUJ Main Gate', category: 'Campus', lat: 26.8445, lng: 75.5670, address: 'Main Gate, Manipal University Jaipur, Jaipur-Ajmer Expressway' },
  { name: 'Academic Block MUJ', category: 'Campus', lat: 26.8425, lng: 75.5665, address: 'Academic Block, Manipal University Jaipur, Dehmi Kalan' },
  
  // Boys Hostels
  { name: 'Harlin Boys Hostel', category: 'Boys Hostel', lat: 26.8472, lng: 75.5698, address: 'Harlin Boys Hostel, Vinayak Marg, Near MUJ, Jaipur' },
  { name: 'ChillOut Hostels Boys', category: 'Boys Hostel', lat: 26.8476, lng: 75.5708, address: 'ChillOut Hostels, Elegance Hostel Rd, Near MUJ, Jaipur' },
  { name: 'Hotel O SS', category: 'Boys Hostel', lat: 26.8470, lng: 75.5705, address: 'Hotel O SS, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Narbada Hostel', category: 'Boys Hostel', lat: 26.8478, lng: 75.5710, address: 'Narbada Hostel, Near MUJ, Dehmi Kalan, Jaipur' },
  { name: 'Pioneer Hostel', category: 'Boys Hostel', lat: 26.8468, lng: 75.5712, address: 'Pioneer Hostel, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Sundarone Hostel', category: 'Boys Hostel', lat: 26.8477, lng: 75.5715, address: 'Sundarone Hostel, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Hostel SS', category: 'Boys Hostel', lat: 26.8475, lng: 75.5707, address: 'Hostel SS, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Stay Well Hostel', category: 'Boys Hostel', lat: 26.8480, lng: 75.5718, address: 'Stay Well Hostel, Manipal University Road, Dehmi Kalan' },
  { name: 'Pankh Hostel', category: 'Boys Hostel', lat: 26.8474, lng: 75.5704, address: 'Pankh Hostel, Sanjharia Vatika Road, Near MUJ' },
  { name: 'Elegance Hostel', category: 'Boys Hostel', lat: 26.8476, lng: 75.5709, address: 'Elegance Hostel, Elegance Hostel Rd, Near MUJ, Jaipur' },
  
  // Girls Hostels & PGs
  { name: 'Manu Shri PG For Girls', category: 'Girls PG', lat: 26.8473, lng: 75.5700, address: 'Manu Shri PG For Girls, Vinayak Marg, Near MUJ' },
  { name: 'ChillOut Hostels Girls', category: 'Girls PG', lat: 26.8476, lng: 75.5708, address: 'ChillOut Hostels Girls, Elegance Hostel Rd, Near MUJ' },
  
  // Mixed/Residential
  { name: 'Narayan Residency Hostel', category: 'Residency', lat: 26.8471, lng: 75.5702, address: 'Narayan Residency Hostel & Flats, Near MUJ, Dehmi Kalan' },
  { name: 'Lakshay Residency', category: 'Residency', lat: 26.8482, lng: 75.5720, address: 'Lakshay Residency & Flats, Near Manipal University Jaipur' },
  { name: 'Samarth Ghar', category: 'Residency', lat: 26.8467, lng: 75.5714, address: 'Samarth Ghar, Near MUJ, Dehmi Kalan, Jaipur' },
  
  // General PG Areas
  { name: 'Dehmi Kalan Main Area', category: 'Area', lat: 26.8475, lng: 75.5705, address: 'Dehmi Kalan Main Area, Near MUJ, Jaipur' },
  { name: 'Kardhani Village', category: 'Area', lat: 26.8380, lng: 75.5620, address: 'Kardhani Village, Near MUJ, Jaipur' },
  { name: 'NH-8 Side Area', category: 'Area', lat: 26.8485, lng: 75.5725, address: 'NH-8, Near Manipal University, Jaipur' },
  { name: 'Sanjharia Vatika Road', category: 'Area', lat: 26.8474, lng: 75.5706, address: 'Sanjharia Vatika Road, Near MUJ, Jaipur' },
  { name: 'Vinayak Marg Area', category: 'Area', lat: 26.8472, lng: 75.5698, address: 'Vinayak Marg, Dehmi Kalan, Near MUJ, Jaipur' },
  { name: 'Elegance Hostel Road Area', category: 'Area', lat: 26.8476, lng: 75.5709, address: 'Elegance Hostel Road, Near MUJ, Jaipur' },
  
  // Key Landmarks
  { name: 'Water Tank, Dehmi Kalan', category: 'Landmark', lat: 26.8478, lng: 75.5708, address: 'Water Tank, Dehmi Kalan, Jaipur' },
  { name: 'Main Market, Dehmi Kalan', category: 'Landmark', lat: 26.8475, lng: 75.5710, address: 'Main Market, Dehmi Kalan, Jaipur' },
  { name: 'Bus Stop, MUJ Gate', category: 'Landmark', lat: 26.8445, lng: 75.5672, address: 'Bus Stop, Near MUJ Gate, Jaipur-Ajmer Expressway' },
  { name: 'Medical Store, Near MUJ', category: 'Landmark', lat: 26.8476, lng: 75.5707, address: 'Medical Store, Near MUJ, Dehmi Kalan' },
  { name: 'Petrol Pump, NH-8', category: 'Landmark', lat: 26.8488, lng: 75.5728, address: 'Petrol Pump, NH-8, Near Manipal University' },
  { name: 'Shree Food Court', category: 'Landmark', lat: 26.8470, lng: 75.5696, address: 'Shree Food Court, Near MUJ, Dehmi Kalan' },
  { name: 'The Bamboo Canopy', category: 'Landmark', lat: 26.8483, lng: 75.5722, address: 'The Bamboo Canopy, Near MUJ, Jaipur' },
  { name: 'Pioneer Cafe', category: 'Landmark', lat: 26.8468, lng: 75.5713, address: 'Pioneer Cafe, Near MUJ, Dehmi Kalan' },
].sort((a, b) => a.name.localeCompare(b.name));

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, sendOTP, verifyOTP, resendConfirmationEmail, resetPassword, updatePassword, user } = useAuth();
  const { toast } = useToast();
  
  // Redirect to home if user is already logged in (but allow password reset flow)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    // Don't redirect if user is on password reset/set password flow
    if (user && mode !== 'reset-password' && mode !== 'set-password') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [signInUserType, setSignInUserType] = useState<'ghs' | 'outside'>('ghs'); // GHS or Outside user
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  
  // Password strength states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
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
    phone: '',
    referralCode: '',
    residencyScope: 'ghs' as 'ghs' | 'off_campus',
    deliveryLocation: '' // For outside users - selected quick location
  });

  // Quick locations state for outside users
  const [showQuickLocations, setShowQuickLocations] = useState(false);
  const [quickLocationSearch, setQuickLocationSearch] = useState('');

  // OTP form
  const [otpForm, setOtpForm] = useState({
    email: ''
  });

  // Referral validation
  const [referralValidation, setReferralValidation] = useState<ReferralValidation | null>(null);


  // Scroll to top hook
  const { scrollToTopOnTabChange } = useScrollToTop();

  // Handle password reset and set password flows
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'reset-password' || mode === 'set-password') {
      // User clicked password reset/set link
      // For Google OAuth users, this allows them to set a password
      // For email/password users, this allows them to reset their password
      toast({
        title: mode === 'set-password' ? "Set Your Password" : "Password Reset",
        description: mode === 'set-password' 
          ? "You can now set a password for your account. You'll be able to sign in with email and password in the future."
          : "You have been signed in successfully. You can now change your password from your profile if needed.",
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
        setIsLoading(false);
    } else {
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in to your account.",
        });
        // Note: signIn() in useAuth.tsx already handles redirect via window.location.href
        // No need to navigate here - the redirect happens automatically
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const isGhsResident = signupForm.residencyScope === 'ghs';
    const blockValue = isGhsResident ? signupForm.block : outsideResidencyBlock;

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

    // Validate email domain (only for GHS residents)
    if (isGhsResident && !signupForm.email.endsWith('@muj.manipal.edu')) {
      toast({
        title: "Invalid Email",
        description: "Please use your MUJ email address (@muj.manipal.edu) for GHS residency.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Enforce: Non-MUJ emails must be off-campus
    if (!isGhsResident && signupForm.email.endsWith('@muj.manipal.edu')) {
      toast({
        title: "Invalid Residency",
        description: "MUJ email addresses must select GHS residency.",
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
        blockValue,
        signupForm.phone,
        signupForm.residencyScope,
        signupForm.referralCode || undefined // Ensure it's undefined if empty
      );
      
      if (error) {
        // Handle specific error cases - check both code and message
        if (error.code === 'user_already_exists' || 
            error.message?.includes('already registered') ||
            error.message?.includes('already exists') ||
            error.message?.includes('User already registered')) {
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
          // Log the error for debugging
          console.error('Signup error:', error);
          
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
          emailRedirectTo: `${window.location.origin}/`,
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

  const outsideResidencyBlock = 'OFF_CAMPUS';

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden pt-16 pb-24 lg:pb-8">
      {/* Header - Same as other pages */}
      <Header />
      
      {/* Mobile: Hero Image Section - Top 35% */}
      <div className="relative h-[35vh] lg:hidden bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 overflow-hidden">
        {/* Food Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='foodGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:0.8' /%3E%3Cstop offset='50%25' style='stop-color:%23dc2626;stop-opacity:0.6' /%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23foodGradient)'/%3E%3C/svg%3E")`
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='300' viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='foodGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:0.8' /%3E%3Cstop offset='50%25' style='stop-color:%23dc2626;stop-opacity:0.6' /%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:0.8' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23foodGradient)'/%3E%3C/svg%3E")`
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
                  {/* User Type Selection - GHS or Outside */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={signInUserType === 'ghs' ? 'default' : 'outline'}
                        onClick={() => setSignInUserType('ghs')}
                        className={`h-12 rounded-xl font-medium transition-all ${
                          signInUserType === 'ghs'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        🏠 GHS User
                      </Button>
                      <Button
                        type="button"
                        variant={signInUserType === 'outside' ? 'default' : 'outline'}
                        onClick={() => setSignInUserType('outside')}
                        className={`h-12 rounded-xl font-medium transition-all ${
                          signInUserType === 'outside'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        🏢 Outside User
                      </Button>
                    </div>
                    {signInUserType === 'ghs' && (
                      <p className="text-xs text-gray-500 text-center">
                        Sign in with your @muj.manipal.edu email
                      </p>
                    )}
                    {signInUserType === 'outside' && (
                      <p className="text-xs text-gray-500 text-center">
                        Sign in with Google (Gmail, Yahoo, or any email)
                      </p>
                    )}
                  </div>

                  {/* GHS User Sign-In Form */}
                  {signInUserType === 'ghs' && (
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
                      type={showSignInPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signinForm.password}
                          onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        >
                          {showSignInPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
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
                  )}

                  {/* Outside User - Google Sign-In */}
                  {signInUserType === 'outside' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900 mb-1">Quick & Easy Sign-In</p>
                            <p className="text-sm text-blue-700">
                              Sign in with your Google account. Perfect for outside users, PG residents, and anyone with a Gmail account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-14 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await signInWithGoogle();
                          if (error) {
                            toast({
                              title: "Google Sign-In Failed",
                              description: error.message || "Please try again.",
                              variant: "destructive"
                            });
                            setIsLoading(false);
                          }
                          // OAuth flow will redirect, so we don't set loading to false here
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-gray-700 font-medium">Connecting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            <span className="text-gray-700 font-semibold text-base">Sign in with Google</span>
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500">
                        Your profile will be created automatically with outside user access
                      </p>
                    </div>
                  )}

                  {/* Forgot Password / Set Password */}
                  <div className="text-center py-4">
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        {signInUserType === 'outside' 
                          ? "Signed up with Google? Set a password to sign in with email/password"
                          : "Forgot your password?"
                        }
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
                                description: error.message || "Failed to send email",
                                variant: "destructive"
                              });
                            } else {
                              toast({
                                title: signInUserType === 'outside' ? "Password Setup Email Sent" : "Password Reset Email Sent",
                                description: signInUserType === 'outside'
                                  ? "Check your email for a link to set your password. After setting a password, you can sign in with email and password."
                                  : "Check your email for instructions to reset your password.",
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
                        {signInUserType === 'outside' ? "Set Password" : "Send Login Link"}
                      </Button>
                    </div>
                  </div>

            </TabsContent>
            
                {/* Sign Up Tab */}
                <TabsContent value="signup" className="space-y-5">
                  <Alert className="mb-5 border-green-200 bg-green-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium text-sm">
                      Choose your residency. GHS residents must sign up with their @muj.manipal.edu email; off-campus students and PG residents can use any email address.
                    </AlertDescription>
                  </Alert>

                  {/* Junk Folder Notice */}
                  <Alert className="mb-5 border-orange-200 bg-orange-50 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-sm">
                      <strong>📧 Important:</strong> Check your <strong>junk/spam folder</strong> for verification email.
                    </AlertDescription>
                  </Alert>

                  {/* Google Sign-Up - For Outside Users (shown at top when residencyScope is off_campus) */}
                  {signupForm.residencyScope === 'off_campus' && (
                    <div className="space-y-3 mb-5">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900 mb-1">Quick & Easy Sign-Up</p>
                            <p className="text-sm text-blue-700">
                              Sign up with your Google account. Perfect for outside users, PG residents, and anyone with a Gmail account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-14 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-md"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await signInWithGoogle();
                          if (error) {
                            toast({
                              title: "Google Sign-Up Failed",
                              description: error.message || "Please try again.",
                              variant: "destructive"
                            });
                            setIsLoading(false);
                          }
                          // OAuth flow will redirect, so we don't set loading to false here
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-gray-700 font-medium">Connecting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            <span className="text-gray-700 font-semibold text-base">Sign up with Google</span>
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500">
                        Your profile will be created automatically with outside user access
                      </p>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                        </div>
                      </div>
                    </div>
                  )}

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Residency Type</Label>
                    <RadioGroup
                      value={signupForm.residencyScope}
                      onValueChange={(value) => {
                        const scope = value as 'ghs' | 'off_campus';
                        setSignupForm((prev) => ({
                          ...prev,
                          residencyScope: scope,
                          block: scope === 'ghs' ? 'B1' : outsideResidencyBlock
                        }));
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          signupForm.residencyScope === 'ghs'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <RadioGroupItem value="ghs" id="res-ghs" className="mt-1" />
                        <div>
                          <Label htmlFor="res-ghs" className="font-medium text-gray-900">
                            I live in GHS Hostel
                          </Label>
                          <p className="text-xs text-gray-500">
                            Full access to all cafés. Requires <strong>@muj.manipal.edu</strong> email.
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          signupForm.residencyScope === 'off_campus'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <RadioGroupItem value="off_campus" id="res-off" className="mt-1" />
                        <div>
                          <Label htmlFor="res-off" className="font-medium text-gray-900">
                            I stay outside GHS / PG
                          </Label>
                          <p className="text-xs text-gray-500">
                            View delivery cafés serving campus and PG. Any email address is accepted.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-500">
                      You can update this later from your profile if you move between GHS and off-campus.
                    </p>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
                        {signupForm.residencyScope === 'ghs' ? 'MUJ Email' : 'Email'}
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                          id="signup-email"
                          type="email"
                          placeholder={
                            signupForm.residencyScope === 'ghs'
                              ? 'your.email@muj.manipal.edu'
                              : 'your.email@example.com'
                          }
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                      {signupForm.residencyScope === 'ghs' && signupForm.email && !signupForm.email.endsWith('@muj.manipal.edu') && (
                        <p className="text-sm text-red-500">Please use your MUJ email address</p>
                      )}
                      {signupForm.residencyScope === 'off_campus' && (
                        <p className="text-xs text-gray-500">
                          Off-campus users can sign up with any valid email address.
                        </p>
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
                  
                    {signupForm.residencyScope === 'ghs' ? (
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
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Delivery Area <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowQuickLocations(!showQuickLocations)}
                            className="w-full h-12 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className={signupForm.deliveryLocation ? 'text-gray-900' : 'text-gray-500'}>
                                {signupForm.deliveryLocation || 'Select your PG/Hostel/Area (optional)'}
                              </span>
                        </div>
                            <span className="text-xs text-gray-400">▼</span>
                          </Button>

                          {/* Quick Locations Dropdown */}
                          {showQuickLocations && (
                            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                              {/* Header */}
                              <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between z-10">
                                <p className="text-sm text-gray-700 font-semibold">📍 {ALL_LOCATIONS.length} Locations Near MUJ</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowQuickLocations(false);
                                    setQuickLocationSearch('');
                                  }}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {/* Search Box */}
                              <div className="sticky top-12 bg-white border-b px-3 py-2 z-10">
                                <Input
                                  type="text"
                                  placeholder="Search by PG name, hostel, or area..."
                                  value={quickLocationSearch}
                                  onChange={(e) => setQuickLocationSearch(e.target.value)}
                                  className="w-full text-sm"
                                  autoFocus
                                />
                              </div>
                              
                              {/* Scrollable Results */}
                              <div className="overflow-y-auto flex-1 p-2">
                                {(() => {
                                  const searchTerm = quickLocationSearch.toLowerCase().trim();
                                  const filtered = searchTerm 
                                    ? ALL_LOCATIONS.filter(loc => 
                                        loc.name.toLowerCase().includes(searchTerm) ||
                                        loc.category.toLowerCase().includes(searchTerm) ||
                                        loc.address.toLowerCase().includes(searchTerm)
                                      )
                                    : ALL_LOCATIONS;
                                  
                                  if (filtered.length === 0) {
                                    return (
                                      <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No locations found for "{quickLocationSearch}"</p>
                                        <p className="text-xs mt-2">Try searching by PG name, hostel, or area</p>
                                      </div>
                                    );
                                  }
                                  
                                  // Group filtered results by category
                                  const groupedFiltered = filtered.reduce((acc, loc) => {
                                    if (!acc[loc.category]) acc[loc.category] = [];
                                    acc[loc.category].push(loc);
                                    return acc;
                                  }, {} as Record<string, typeof ALL_LOCATIONS>);
                                  
                                  return Object.entries(groupedFiltered).map(([category, locations]) => (
                                    <div key={category} className="mb-3">
                                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-1 sticky top-0 bg-white">
                                        {category} ({locations.length})
                                      </p>
                                      <div className="space-y-1">
                                        {locations.map((location) => (
                                          <button
                                            key={location.name}
                                            type="button"
                                            onClick={() => {
                                              setSignupForm({ ...signupForm, deliveryLocation: location.name });
                                              setShowQuickLocations(false);
                                              setQuickLocationSearch('');
                                            }}
                                            className="w-full text-left px-3 py-2.5 hover:bg-orange-50 hover:border-orange-200 border border-transparent rounded-lg text-sm transition-all group"
                                          >
                                            <div className="font-medium text-gray-900 group-hover:text-orange-700">{location.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{location.address}</div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Select your PG/Hostel/Area to speed up checkout. You can also add details during checkout.
                        </p>
                      </div>
                    )}

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

                    {/* Referral Code Input */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-referral" className="text-sm font-medium text-gray-700">
                        Referral Code (Optional)
                      </Label>
                      <ReferralCodeInput
                        value={signupForm.referralCode}
                        onChange={(code) => setSignupForm({ ...signupForm, referralCode: code })}
                        onValidation={setReferralValidation}
                        placeholder="Enter referral code (e.g., TEAM123)"
                        className="w-full"
                      />
                      {referralValidation?.isValid && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Valid code! You'll get ₹10 off your first order
                        </div>
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