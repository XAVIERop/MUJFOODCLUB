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
    <div className="bg-white px-4 py-3">
      {/* Top Row: Location + Profile - Swiggy Style */}
      <div className="flex items-center justify-between mb-1">
        {/* Location Dropdown - Clean Swiggy Style */}
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

        {/* Profile Icon - Auth Integration */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full hover:bg-gray-50">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
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
            className="w-8 h-8 p-0 rounded-full hover:bg-gray-50"
            onClick={handleAuthAction}
          >
            <User className="w-4 h-4 text-gray-600" />
          </Button>
        )}
      </div>

      {/* Location Details - Subtle Swiggy Style */}
      <div className="text-left -mt-2">
        <p className="text-xs text-gray-500 font-normal">
          Block {selectedBlock}, MUJ Hostel
        </p>
      </div>
    </div>
  );
};

export default MobileHeader;
