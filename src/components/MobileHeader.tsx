import React from 'react';
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

        {/* Profile Icon - Minimal Style */}
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 rounded-full hover:bg-gray-50"
        >
          <User className="w-4 h-4 text-gray-600" />
        </Button>
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
