import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QrCode, User, LogOut, Settings, Menu, Home, Coffee, Utensils, Bell, Receipt, Store, Package, Heart, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSubscriptions } from '@/hooks/useSubscriptionManager';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isCafeOwner, setIsCafeOwner] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBlock, setSelectedBlock } = useLocationContext();

  // Check if we're on the home page (hero section)
  const isHomePage = location.pathname === '/';

  // Check if user is a cafe owner
  useEffect(() => {
    if (!user) {
      setIsCafeOwner(false);
      return;
    }

    const checkCafeOwnership = async () => {
      try {
        // First check profiles table for cafe_owner user_type
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData && profileData.user_type === 'cafe_owner') {
          setIsCafeOwner(true);
          return;
        }

        // If not cafe_owner in profiles, check cafe_staff table
        const { data: staffData, error: staffError } = await supabase
          .from('cafe_staff')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['owner', 'manager'])
          .eq('is_active', true)
          .single();

        if (!staffError && staffData) {
          setIsCafeOwner(true);
        } else {
          setIsCafeOwner(false);
        }
      } catch (error) {
        console.error('Error checking cafe ownership:', error);
        setIsCafeOwner(false);
      }
    };

    checkCafeOwnership();
  }, [user]);

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('order_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadNotifications(count);
        } else if (error) {
          console.warn('Failed to fetch notifications count:', error.message);
          // Don't crash the app, just set to 0
          setUnreadNotifications(0);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
        // Don't crash the app, just set to 0
        setUnreadNotifications(0);
      }
    };

    fetchUnreadCount();
  }, [user]);

  // Set up real-time subscription for notifications using centralized manager
  useNotificationSubscriptions(
    user?.id || null,
    null, // No cafeId for user notifications
    (newNotification) => {
      console.log('Header: New notification received via centralized subscription:', newNotification);
      setUnreadNotifications(prev => prev + 1);
    }
  );

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cafes", label: "Cafes", icon: Coffee },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isHomePage 
        ? 'border-b border-white/20 bg-black/40 backdrop-blur-lg text-white shadow-lg' 
        : 'border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground'
    } m-0`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo and Location */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-1 sm:space-x-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <img 
                src="/foc.png" 
                alt="FoodClub Logo" 
                className="w-24 sm:w-32 md:w-40 h-auto object-contain"
              />
              {/* BETA Badge - Golden, positioned to the right, very small */}
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full shadow-sm border border-yellow-300">
                BETA
              </Badge>
            </Link>

          </div>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center space-x-2 transition-smooth story-link ${
                    isHomePage
                      ? 'text-white/80 hover:text-white'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && profile ? (
              <>
                {/* Cafe-specific rewards - removed unified points display */}

                {/* Notifications - Hidden on mobile to reduce clutter */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative hidden sm:inline-flex ${
                    isHomePage 
                      ? 'text-white/90 hover:text-white hover:bg-black/30' 
                      : ''
                  }`}
                  onClick={() => setIsNotificationOpen(true)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${
                      isHomePage 
                        ? 'text-white/90 hover:text-white hover:bg-black/30' 
                        : ''
                    }`}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/qr-code')}>
                      <QrCode className="mr-2 h-4 w-4" />
                      <span>My QR Code</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/cafes?favorites=true')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>My Favorites</span>
                    </DropdownMenuItem>
                    {isCafeOwner && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/cafe-dashboard')}>
                          <Store className="mr-2 h-4 w-4" />
                          <span>Cafe Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/pos-dashboard')}>
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>POS Dashboard</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant={isHomePage ? "outline" : "hero"} 
                onClick={handleAuthAction}
                className={`${isHomePage ? "border-white/40 text-white hover:bg-black/30 hover:border-white/60 bg-black/20" : ""} text-xs sm:text-sm`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className={`md:hidden ${
                  isHomePage 
                    ? 'text-white/90 hover:text-white hover:bg-black/30' 
                    : ''
                }`}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <Link 
                      to="/" 
                      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <img 
                        src="/foc.png" 
                        alt="FoodClub Logo" 
                        className="w-32 h-auto mr-2"
                      />
                      {/* BETA Badge - Golden, positioned to the right, very small */}
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-yellow-300">
                        BETA
                      </Badge>
                    </Link>
                  </SheetTitle>
                  <SheetDescription>
                    Your campus food companion
                  </SheetDescription>
                </SheetHeader>
                
                {/* Mobile Location Selector */}
                <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Delivery to: {selectedBlock}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Notifications */}
                  {user && (
                    <button
                      onClick={() => {
                        setIsNotificationOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="relative">
                        <Bell className="w-5 h-5" />
                        {unreadNotifications > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                          </Badge>
                        )}
                      </div>
                      <span className="text-base">Notifications</span>
                    </button>
                  )}
                  
                  {/* Navigation Links - Simplified */}
                  <a
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-base">Home</span>
                  </a>
                  
                  <a
                    href="/cafes"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Coffee className="w-5 h-5" />
                    <span className="text-base">Cafes</span>
                  </a>
                  
                  
                  {/* User Actions - Simplified */}
                  {user ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="mt-4"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button variant="hero" onClick={() => {
                      navigate('/auth');
                      setIsMenuOpen(false);
                    }} className="mt-4">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        userType="user"
      />
    </header>
  );
};

export default Header;