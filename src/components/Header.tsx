import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QrCode, User, LogOut, Trophy, Settings, Menu, Home, Coffee, Gift, Utensils, Bell, Receipt } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent leading-none">
                FoodClub
              </span>
              <span className="text-xs text-muted-foreground -mt-1">MUJ Campus Food</span>
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

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={profile.full_name} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile.full_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                        <Badge variant="secondary" className="text-xs w-fit">
                          Block {profile.block}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      // Scroll to QR code section
                      const qrSection = document.querySelector('#qr-code');
                      if (qrSection) {
                        qrSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}>
                      <QrCode className="mr-2 h-4 w-4" />
                      <span>My QR Code</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
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
                    <Coffee className="w-5 h-5 mr-2 text-primary" />
                    FoodClub
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