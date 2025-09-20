import React, { useState } from 'react';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

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

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="bg-white px-4 py-4">
      {/* Top Row: Location + Profile - Swiggy Style */}
      <div className="flex items-center justify-between mb-4">
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

        {/* Profile/Auth Button - Using Existing Auth System */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {getInitials(profile?.full_name)}
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
                <span>My Orders</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAuthAction}>
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAuthAction}
            className="w-8 h-8 p-0 rounded-full hover:bg-gray-50"
          >
            <User className="w-4 h-4 text-gray-600" />
          </Button>
        )}
      </div>


      {/* Location Details - Swiggy Style */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Block {selectedBlock}, MUJ Hostel
        </p>
      </div>
    </div>
  );
};

export default MobileHeader;
