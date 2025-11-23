import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Plus, Home, Briefcase } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { getUserResidency } from '@/utils/residencyUtils';
import { savedAddressService, SavedAddress } from '@/services/savedAddressService';
import { useToast } from '@/hooks/use-toast';
import { AddressMapModal, SavedAddressData } from './AddressMapModal';
import { Badge } from '@/components/ui/badge';

// Available hostel blocks
const HOSTEL_BLOCKS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];

interface LocationSelectorProps {
  selectedBlock: string;
  onBlockChange: (block: string) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  selectedBlock, 
  onBlockChange,
  className = ''
}) => {
  const { user, profile } = useAuth();
  const { scope: userScope } = getUserResidency(profile);
  const { toast } = useToast();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);

  // Load saved addresses for outside users
  useEffect(() => {
    if (user && userScope === 'off_campus') {
      loadAddresses();
    }
  }, [user, userScope]);

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const addresses = await savedAddressService.getUserAddresses();
      setSavedAddresses(addresses);
      
      // Auto-select default address if available and no address is currently selected
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress && !selectedAddress) {
        setSelectedAddress(defaultAddress);
        // Update the block/address context
        onBlockChange('OFF_CAMPUS');
      } else if (addresses.length > 0 && !selectedAddress) {
        // If no default, select the first address
        setSelectedAddress(addresses[0]);
        onBlockChange('OFF_CAMPUS');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddress(address);
    onBlockChange('OFF_CAMPUS');
    toast({
      title: 'Location selected',
      description: savedAddressService.formatAddress(address),
    });
  };

  const handleSaveAddress = async (addressData: SavedAddressData) => {
    try {
      const newAddress = await savedAddressService.createAddress({
        label: addressData.label,
        address_type: addressData.address_type,
        latitude: addressData.latitude,
        longitude: addressData.longitude,
        flat_number: addressData.flat_number,
        building_name: addressData.building_name,
        landmark: addressData.landmark,
        complete_address: addressData.complete_address,
        is_default: savedAddresses.length === 0,
      });

      if (newAddress) {
        await loadAddresses();
        setShowAddModal(false);
        handleSelectAddress(newAddress);
        toast({
          title: 'Address saved!',
          description: 'Your delivery address has been saved.',
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error saving address',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // For guests - show nothing or a simple message
  if (!user) {
    return null;
  }

  // For outside users - show saved addresses dropdown
  if (userScope === 'off_campus') {
    const getAddressLabel = (address: SavedAddress) => {
      const label = address.label === 'Other' ? address.custom_label : address.label;
      return label || 'Address';
    };

    const getAddressIcon = (label: string) => {
      if (label === 'Home' || label === 'home') return <Home className="w-4 h-4" />;
      if (label === 'Work' || label === 'work') return <Briefcase className="w-4 h-4" />;
      return <MapPin className="w-4 h-4" />;
    };

    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={`w-auto h-auto p-0 bg-transparent border-none shadow-none hover:bg-transparent ${className}`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <div className="flex flex-col items-start">
                  <span className="text-base font-bold text-gray-900">
                    {selectedAddress ? getAddressLabel(selectedAddress) : 'Select Location'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {selectedAddress 
                      ? savedAddressService.formatAddress(selectedAddress).substring(0, 30) + '...'
                      : 'Choose delivery address'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Saved Addresses</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="h-8 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add New
                </Button>
              </div>
              
              {isLoadingAddresses ? (
                <div className="text-center py-4 text-sm text-gray-500">Loading addresses...</div>
              ) : savedAddresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">No saved addresses</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => handleSelectAddress(address)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          <div className="mt-0.5">
                            {getAddressIcon(address.label)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {getAddressLabel(address)}
                              </span>
                              {address.is_default && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {savedAddressService.formatAddress(address)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {showAddModal && (
          <AddressMapModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveAddress}
            mode="gps"
          />
        )}
      </>
    );
  }

  // For GHS users - show block selector
  return (
    <Select value={selectedBlock || 'B1'} onValueChange={onBlockChange}>
      <SelectTrigger className={`w-auto h-auto p-0 bg-transparent border-none shadow-none [&>svg]:hidden ${className}`}>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <div className="flex flex-col items-start">
            <span className="text-base font-bold text-gray-900">
              {selectedBlock || 'Select Block'}
            </span>
            <span className="text-xs text-gray-600">
              {selectedBlock ? `Block ${selectedBlock}, MUJ Hostel` : 'Choose your block'}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {HOSTEL_BLOCKS.map((block) => (
          <SelectItem key={block} value={block}>
            {block}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

