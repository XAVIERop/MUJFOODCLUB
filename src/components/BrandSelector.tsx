import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Brand {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  itemCount?: number;
}

interface BrandSelectorProps {
  selectedBrand: string | null;
  onBrandSelect: (brandId: string | null) => void;
  brandItemCounts: Record<string, number>;
}

const brands: Brand[] = [
  {
    id: 'all',
    name: 'All Brands',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    hoverColor: 'hover:bg-gray-200'
  },
  {
    id: 'gobblers',
    name: 'GOBBLERS',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    hoverColor: 'hover:bg-purple-200'
  },
  {
    id: 'momo-street',
    name: 'MOMO STREET',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-300',
    hoverColor: 'hover:bg-pink-200'
  },
  {
    id: 'krispp',
    name: 'KRISPP',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    hoverColor: 'hover:bg-orange-200'
  },
  {
    id: 'waffles-more',
    name: 'WAFFLES&MORE',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-200'
  },
  {
    id: 'monginis',
    name: 'MONGINIS',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    hoverColor: 'hover:bg-blue-200'
  },
  {
    id: 'tata-bistro',
    name: 'TATA BISTRO',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-200'
  }
];

const BrandSelector: React.FC<BrandSelectorProps> = ({
  selectedBrand,
  onBrandSelect,
  brandItemCounts
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Brand</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand.id;
          const itemCount = brandItemCounts[brand.id] || 0;
          
          return (
            <Button
              key={brand.id}
              onClick={() => onBrandSelect(brand.id === 'all' ? null : brand.id)}
              variant="outline"
              className={`
                flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? `${brand.bgColor} ${brand.textColor} ${brand.borderColor} border-2 shadow-md` 
                  : `bg-white ${brand.textColor} ${brand.borderColor} ${brand.hoverColor}`
                }
                min-w-[120px] justify-between
              `}
            >
              <span className="font-medium text-sm">{brand.name}</span>
              {itemCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`
                    ml-2 text-xs px-2 py-1
                    ${isSelected 
                      ? 'bg-white/20 text-current' 
                      : `${brand.bgColor} ${brand.textColor}`
                    }
                  `}
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BrandSelector;
