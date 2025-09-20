import React, { useState } from 'react';
import { MapPin, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileHeaderProps {
  selectedBlock: string;
  onBlockChange: (block: string) => void;
}

const BLOCKS = [
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'
];

const MobileHeader: React.FC<MobileHeaderProps> = ({ selectedBlock, onBlockChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      {/* Top Row: Location + Profile */}
      <div className="flex items-center justify-between mb-3">
        {/* Location Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 px-2 py-1 h-auto"
            >
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-gray-900">{selectedBlock}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
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

        {/* Profile Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 rounded-full"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <User className="w-4 h-4" />
        </Button>
      </div>

      {/* Logo and Beta Badge */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/fav.png" 
            alt="MUJ Food Club" 
            className="h-8 w-auto"
          />
          <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            BETA
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
