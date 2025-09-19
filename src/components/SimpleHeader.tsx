import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Coffee, Utensils, Bell, Receipt, Store, Package, Heart, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationSubscriptions } from '@/hooks/useSubscriptionManager';
import NotificationCenter from './NotificationCenter';

const SimpleHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const { selectedBlock } = useLocation();
  const [isCafeOwner, setIsCafeOwner] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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

        if (!profileError && profileData && (profileData as any).user_type === 'cafe_owner') {
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    const fetchUnreadNotifications = async () => {
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
        console.error('Error fetching notifications:', error);
        // Don't crash the app, just set to 0
        setUnreadNotifications(0);
      }
    };

    fetchUnreadNotifications();
  }, [user]);

  // Navigation items
  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Cafes', href: '/cafes', icon: Coffee }
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo + Location (Left) */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src="/fav.png" 
                  alt="MUJ Food Club" 
                  className="h-16 w-auto"
                />
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  BETA
                </div>
              </div>
            </div>

            {/* Navigation Links (Center) */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`flex items-center space-x-2 transition-colors ${
                      isActive
                        ? 'text-orange-600 font-medium'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Mobile Navigation (Hidden on desktop) */}
            <div className="md:hidden flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>

            {/* Notifications + Profile (Right) */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              {user && (
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
              )}

              {/* Profile */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback>
                          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
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
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </DropdownMenuItem>
                    {isCafeOwner && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/pos-dashboard')}>
                          <Store className="mr-2 h-4 w-4" />
                          <span>POS Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/cafe-dashboard')}>
                          <Utensils className="mr-2 h-4 w-4" />
                          <span>Cafe Dashboard</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={handleProfileClick}
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      {user && (
        <NotificationCenter
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </>
  );
};

export default SimpleHeader;