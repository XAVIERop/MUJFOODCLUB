import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, User, LogOut, Settings, Coffee, Gift, Utensils, Bell, Receipt, Store, Package, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SimpleHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedBlock, setSelectedBlock] = useState("B1");

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Location (Top Left) */}
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{selectedBlock}</span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Delivery to:</span>
                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-12 h-6 text-xs border-none p-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="B3">B3</SelectItem>
                    <SelectItem value="B4">B4</SelectItem>
                    <SelectItem value="B5">B5</SelectItem>
                    <SelectItem value="B6">B6</SelectItem>
                    <SelectItem value="B7">B7</SelectItem>
                    <SelectItem value="B8">B8</SelectItem>
                    <SelectItem value="B9">B9</SelectItem>
                    <SelectItem value="B10">B10</SelectItem>
                    <SelectItem value="B11">B11</SelectItem>
                    <SelectItem value="B12">B12</SelectItem>
                    <SelectItem value="G1">G1</SelectItem>
                    <SelectItem value="G2">G2</SelectItem>
                    <SelectItem value="G3">G3</SelectItem>
                    <SelectItem value="G4">G4</SelectItem>
                    <SelectItem value="G5">G5</SelectItem>
                    <SelectItem value="G6">G6</SelectItem>
                    <SelectItem value="G7">G7</SelectItem>
                    <SelectItem value="G8">G8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* FCC Logo (Center) */}
          <div className="flex items-center justify-center">
            <img 
              src="/fclog.jpeg" 
              alt="MUJ Food Club" 
              className="h-10 w-auto"
            />
          </div>

          {/* Profile (Top Right) */}
          <div className="flex items-center space-x-3">
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
                  <DropdownMenuItem onClick={() => navigate('/rewards')}>
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Rewards</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/pos-dashboard')}>
                    <Store className="mr-2 h-4 w-4" />
                    <span>POS Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cafe-dashboard')}>
                    <Utensils className="mr-2 h-4 w-4" />
                    <span>Cafe Dashboard</span>
                  </DropdownMenuItem>
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
  );
};

export default SimpleHeader;
