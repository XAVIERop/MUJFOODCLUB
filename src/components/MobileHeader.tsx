import React from 'react';
import { MapPin, ChevronDown, User, LogOut, Settings, Receipt, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  selectedBlock: string;
  onBlockChange: (block: string) => void;
}

const BLOCKS = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'
];

const MobileHeader: React.FC<MobileHeaderProps> = ({ selectedBlock, onBlockChange }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      // User is logged in, could open profile menu or navigate to profile
      navigate('/profile');
    } else {
      // User is not logged in, navigate to auth page
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 px-4 pt-6 pb-3">
      {/* Row 1: Location + Profile - Swiggy Style */}
      <div className="flex items-start justify-between mb-3">
        {/* Location Dropdown - Clean Swiggy Style */}
        <div className="flex flex-col">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-1 px-0 py-0 h-auto text-gray-900 hover:text-gray-900 hover:bg-transparent"
              >
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-base">{selectedBlock}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {BLOCKS.map((block) => (
                <DropdownMenuItem
                  key={block}
                  onClick={() => onBlockChange(block)}
                  className={selectedBlock === block ? 'bg-orange-50 text-orange-600' : ''}
                >
                  Block {block}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Address */}
          <p className="text-xs text-gray-500 font-normal ml-5 mt-0.5">
            Block {selectedBlock}, MUJ Hostel
          </p>
        </div>

        {/* Profile Icon - Auth Integration */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-gray-50 relative">
                <Avatar className="w-8 h-8 ring-2 ring-orange-200 ring-offset-2 shadow-sm">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                <Receipt className="mr-2 h-4 w-4" />
                My Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/favorites')}>
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 rounded-full hover:bg-gray-50 relative"
            onClick={handleAuthAction}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-gray-200 ring-offset-2 shadow-sm">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </Button>
        )}
      </div>

      {/* Row 2: Search Bar + Category Dropdown + Mic - Swiggy Style */}
      <div className="flex items-center space-x-2">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search dishes..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:bg-white"
          />
        </div>
        
        {/* Category Dropdown */}
        <Button variant="outline" size="sm" className="px-3 py-2.5 bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
          <span className="text-sm">Dishes</span>
          <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
        </Button>
        
        {/* Mic Icon */}
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default MobileHeader;
