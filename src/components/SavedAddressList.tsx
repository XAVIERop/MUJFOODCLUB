import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { savedAddressService, SavedAddress } from '@/services/savedAddressService';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Home, Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { AddressMapModal, SavedAddressData } from './AddressMapModal';

interface SavedAddressListProps {
  onSelectAddress: (address: SavedAddress) => void;
  selectedAddressId?: string | null;
}

export const SavedAddressList = ({ onSelectAddress, selectedAddressId }: SavedAddressListProps) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'gps' | 'map' | 'quick'>('gps');
  const { toast } = useToast();

  // Load saved addresses
  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await savedAddressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: 'Error loading addresses',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Handle save new address
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
        is_default: addresses.length === 0, // First address is default
      });

      if (newAddress) {
        toast({
          title: 'Address saved!',
          description: 'Your delivery address has been saved successfully.',
        });
        await loadAddresses();
        setShowAddModal(false);
        
        // Auto-select the newly added address
        onSelectAddress(newAddress);
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

  // Handle delete address
  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await savedAddressService.deleteAddress(id);
      toast({
        title: 'Address deleted',
        description: 'Your address has been removed.',
      });
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error deleting address',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  // Get icon for address type
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {addresses.map((address) => (
        <Card 
          key={address.id}
          className={`cursor-pointer transition-all ${
            selectedAddressId === address.id 
              ? 'border-2 border-orange-500 shadow-md' 
              : 'hover:border-gray-300'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <div className="bg-orange-100 p-2 rounded-full">
                  {getAddressIcon(address.address_type)}
                </div>
              </div>

              {/* Address Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {address.label}
                  </span>
                  {address.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {savedAddressService.formatAddress(address)}
                </p>

                {/* Estimated delivery time - TODO: Calculate based on distance */}
                <p className="text-xs text-gray-500 mt-2">
                  📍 {(address.latitude).toFixed(4)}, {(address.longitude).toFixed(4)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onSelectAddress(address)}
                  className={`${
                    selectedAddressId === address.id
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white font-semibold`}
                  size="sm"
                >
                  {selectedAddressId === address.id ? '✓ SELECTED' : 'DELIVER HERE'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteAddress(address.id, e)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Address Card */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 cursor-pointer transition-all">
        <CardContent className="p-4">
          <button
            onClick={() => {
              setModalMode('gps');
              setShowAddModal(true);
            }}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="bg-orange-100 p-2 rounded-full">
              <Plus className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Add New Address</p>
              <p className="text-sm text-gray-500">
                Use GPS, map, or quick locations
              </p>
            </div>
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              size="sm"
            >
              ADD NEW
            </Button>
          </button>
        </CardContent>
      </Card>

      {/* Add Address Modal */}
      <AddressMapModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveAddress}
        mode={modalMode}
      />
    </div>
  );
};

