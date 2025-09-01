import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QrCode, User, LogOut, Trophy, Settings, Menu, Home, Coffee, Gift, Utensils, Bell, Receipt, Store, Package, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isCafeOwner, setIsCafeOwner] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel(`header-notifications-${user.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'order_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          setUnreadNotifications(prev => prev + 1);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'order_notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.new.is_read) {
            setUnreadNotifications(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/cafes", label: "Cafes", icon: Coffee },
    { href: "/rewards", label: "Rewards", icon: Gift },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 m-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
            <div className="relative">
              <img 
                src="/foc.png" 
                alt="FoodClub Logo" 
                className="w-48 h-auto object-contain"
              />
              {/* BETA Badge */}
              <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                BETA
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth story-link"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <>
                {/* Loyalty Points */}
                <Badge className="hidden sm:flex items-center gradient-warm text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  {profile.loyalty_points} pts
                </Badge>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
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
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                    <DropdownMenuItem onClick={() => navigate('/rewards')}>
                      <Gift className="mr-2 h-4 w-4" />
                      <span>Rewards</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/cafes?favorites=true')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>My Favorites</span>
                    </DropdownMenuItem>
                    {isCafeOwner && (
                      <DropdownMenuItem onClick={() => navigate('/cafe-dashboard')}>
                        <Store className="mr-2 h-4 w-4" />
                        <span>Cafe Dashboard</span>
                      </DropdownMenuItem>
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
              <Button variant="hero" onClick={handleAuthAction}>
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <div className="relative">
                      <img 
                        src="/foc.png" 
                        alt="FoodClub Logo" 
                        className="w-32 h-auto mr-2"
                      />
                      {/* BETA Badge */}
                      <Badge className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        BETA
                      </Badge>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Your campus food companion
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-base">{item.label}</span>
                      </a>
                    );
                  })}
                  
                  {user ? (
                    <>
                      {/* Cafe Dashboard for cafe owners */}
                      {isCafeOwner && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            navigate('/cafe-dashboard');
                            setIsMenuOpen(false);
                          }}
                          className="mt-4"
                        >
                          <Store className="w-4 h-4 mr-2" />
                          Cafe Dashboard
                        </Button>
                      )}
                      
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
                    </>
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