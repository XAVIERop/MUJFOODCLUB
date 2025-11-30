import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Navigation, Home, Briefcase, X } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: SavedAddressData) => void;
  initialCoords?: { lat: number; lng: number } | null;
  mode: 'gps' | 'map' | 'quick';
}

export interface SavedAddressData {
  latitude: number;
  longitude: number;
  complete_address: string;
  flat_number: string;
  building_name: string;
  landmark: string;
  label: string;
  address_type: 'home' | 'work' | 'other';
}

const MUJ_CENTER = { lat: 26.8432, lng: 75.5659 };
const MAX_DELIVERY_RADIUS_KM = 3;

export const AddressMapModal = ({
  isOpen,
  onClose,
  onSave,
  initialCoords,
  mode,
}: AddressMapModalProps) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialCoords || MUJ_CENTER);
  const [address, setAddress] = useState('Detecting address...');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('other');
  const [customLabel, setCustomLabel] = useState('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const { toast } = useToast();

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Google Maps API key not found in environment variables.');
      console.error('Please add VITE_GOOGLE_MAPS_API_KEY to your .env.local file');
      toast({
        title: 'Map unavailable',
        description: 'Google Maps API key not configured. Please check your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    // Log API key status (first 10 chars only for security)
    console.log('🗺️ Google Maps API Key found:', apiKey.substring(0, 10) + '...');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔑 API Key length:', apiKey.length);
    
    // Set up global error handler for Google Maps auth failures
    (window as any).gm_authFailure = () => {
      console.error('❌ Google Maps authentication failed');
      console.error('This usually means:');
      console.error('1. API key is invalid or expired');
      console.error('2. API key restrictions are blocking this domain');
      console.error('3. Required APIs are not enabled');
      console.error('4. Billing is not enabled');
      console.error('Current domain:', window.location.hostname);
      toast({
        title: 'Google Maps authentication failed',
        description: 'Check API key restrictions and enabled APIs in Google Cloud Console.',
        variant: 'destructive',
      });
    };

    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsGoogleMapsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      // Wait a bit for Google Maps to fully initialize
      setTimeout(() => {
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps script loaded successfully');
          setIsGoogleMapsLoaded(true);
        } else {
          console.error('⚠️ Script loaded but window.google.maps is not available');
          toast({
            title: 'Map initialization failed',
            description: 'Google Maps script loaded but initialization failed. Check console for details.',
            variant: 'destructive',
          });
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps script');
      console.error('Error details:', error);
      console.error('Script URL attempted:', script.src.substring(0, 50) + '...');
      console.error('API Key present:', !!apiKey);
      console.error('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND');
      console.error('Current URL:', window.location.href);
      console.error('Possible causes:');
      console.error('1. API key is invalid or restricted');
      console.error('2. Billing not enabled in Google Cloud Console');
      console.error('3. Required APIs not enabled (Maps JavaScript API, Places API, Geocoding API)');
      console.error('4. API key restrictions blocking mujfoodclub.in domain');
      console.error('5. Environment variable not set in Vercel (check Vercel dashboard)');
      toast({
        title: 'Map loading failed',
        description: 'Check browser console for details. Verify API key is set in Vercel and domain is allowed.',
        variant: 'destructive',
      });
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount as it might be used by other components
    };
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Validate if location is within delivery radius
  const validateDistance = (lat: number, lng: number): { isValid: boolean; distance: number } => {
    const distance = calculateDistance(MUJ_CENTER.lat, MUJ_CENTER.lng, lat, lng);
    return {
      isValid: distance <= MAX_DELIVERY_RADIUS_KM,
      distance
    };
  };

  // Reverse geocode to get address from coordinates
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        setIsLoadingAddress(false);
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    } else {
      setIsLoadingAddress(false);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current) {
      console.error('❌ Map container ref not available');
      return;
    }
    
    if (!window.google || !window.google.maps) {
      console.error('❌ Google Maps not available');
      console.error('window.google:', !!window.google);
      console.error('window.google.maps:', window.google ? !!window.google.maps : 'N/A');
      toast({
        title: 'Map initialization failed',
        description: 'Google Maps library not loaded. Check API key and restrictions.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log('🗺️ Initializing Google Map...');
      
      const map = new window.google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 17,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      },
      gestureHandling: 'greedy',
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    // Draw delivery radius circle
    new window.google.maps.Circle({
      map,
      center: MUJ_CENTER,
      radius: MAX_DELIVERY_RADIUS_KM * 1000,
      fillColor: '#FF6B35',
      fillOpacity: 0.1,
      strokeColor: '#FF6B35',
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });

    // Update address when map is dragged
    map.addListener('center_changed', () => {
      const center = map.getCenter();
      if (center) {
        const newLat = center.lat();
        const newLng = center.lng();
        setCoords({ lat: newLat, lng: newLng });
      }
    });

      // Get address when dragging stops
      map.addListener('idle', () => {
        const center = map.getCenter();
        if (center) {
          const newLat = center.lat();
          const newLng = center.lng();
          getAddressFromCoords(newLat, newLng);
        }
      });
      
      console.log('✅ Google Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Map:', error);
      toast({
        title: 'Map initialization error',
        description: error instanceof Error ? error.message : 'Failed to initialize map. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  // Get current location via GPS
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation. Please drag the map to select your location.',
        variant: 'destructive',
      });
      // Still show the map with default location
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(coords);
        getAddressFromCoords(coords.lat, coords.lng);
      }
      return;
    }

    setIsLoadingAddress(true);
    toast({
      title: 'Getting your location...',
      description: 'This may take a few seconds',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingAddress(false);
        const { latitude, longitude } = position.coords;
        
        const validation = validateDistance(latitude, longitude);
        
        if (!validation.isValid) {
          toast({
            title: 'Location too far',
            description: `You are ${validation.distance.toFixed(1)}km from MUJ. We only deliver within ${MAX_DELIVERY_RADIUS_KM}km. Please drag the map to select a location within range.`,
            variant: 'destructive',
          });
          // Still center on user location but show warning
        }

        setCoords({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(17);
        }
        getAddressFromCoords(latitude, longitude);
      },
      (error) => {
        setIsLoadingAddress(false);
        console.error('Geolocation error:', error);
        let errorMessage = 'Please drag the map to select your location.';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access or drag the map.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location unavailable. Please drag the map to select your location.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please drag the map to select your location.';
        }
        
        toast({
          title: 'Location access failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Still show the map with default location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(coords);
          getAddressFromCoords(coords.lat, coords.lng);
        } else {
          // If map not initialized yet, just get address for default coords
          getAddressFromCoords(coords.lat, coords.lng);
        }
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  // Initialize map when modal opens and Google Maps is loaded
  useEffect(() => {
    if (isOpen && isGoogleMapsLoaded && window.google && window.google.maps) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          initializeMap();
          if (mode === 'gps') {
            getCurrentLocation();
          } else {
            getAddressFromCoords(coords.lat, coords.lng);
          }
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup: reset map instance when modal closes
    if (!isOpen) {
      mapInstanceRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isGoogleMapsLoaded, mode]); // coords intentionally excluded to prevent infinite loop

  // Handle save
  const handleSave = () => {
    // Validation
    if (!buildingName.trim()) {
      toast({
        title: 'Building name required',
        description: 'Please enter your building/PG/hostel name',
        variant: 'destructive',
      });
      return;
    }

    const validation = validateDistance(coords.lat, coords.lng);
    if (!validation.isValid) {
      toast({
        title: 'Location too far',
        description: `Selected location is ${validation.distance.toFixed(1)}km away. Please select within ${MAX_DELIVERY_RADIUS_KM}km of MUJ.`,
        variant: 'destructive',
      });
      return;
    }

    const label = addressType === 'other' && customLabel ? customLabel : addressType.charAt(0).toUpperCase() + addressType.slice(1);

    const addressData: SavedAddressData = {
      latitude: coords.lat,
      longitude: coords.lng,
      complete_address: address,
      flat_number: flatNumber,
      building_name: buildingName,
      landmark: landmark,
      label: label,
      address_type: addressType,
    };

    onSave(addressData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-8.5rem)] w-[95vw] p-0 flex flex-col sm:max-h-[90vh] sm:w-full sm:!top-[50%] sm:!translate-y-[-50%] !top-[4rem] !bottom-[4.5rem] !translate-y-0 !left-[50%] !translate-x-[-50%] z-[10000]">
        <DialogHeader className="p-4 pb-2 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">Select Delivery Location</DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4">
          {/* Map Section */}
          <div className="relative flex-shrink-0 -mx-4 overflow-hidden">
            {!isGoogleMapsLoaded ? (
              <div className="w-full h-[200px] lg:h-[300px] bg-gray-100 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapRef}
                className="w-full h-[200px] lg:h-[300px] bg-gray-100 relative"
              />
            )}
          
          {/* Fixed Pin in Center - Must be above map with high z-index */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[100]">
            <MapPin className="h-12 w-12 text-red-500 drop-shadow-lg" fill="currentColor" stroke="white" strokeWidth={2} />
          </div>

          {/* Drag Map Instruction */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 z-[100]">
            <p className="text-sm font-medium text-gray-700">📍 Drag map to adjust pin</p>
          </div>

            {/* GPS Button */}
            <Button
              onClick={getCurrentLocation}
              className="absolute bottom-4 right-4 bg-white text-gray-700 hover:bg-gray-50 border shadow-lg z-[100]"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-1" />
              My Location
            </Button>
          </div>

          {/* Address Display */}
          <div className="py-3 bg-gray-50 border-y flex-shrink-0 -mx-4 px-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {isLoadingAddress ? 'Detecting address...' : address}
                </p>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 pt-4 pb-24">
          <div>
            <Label htmlFor="flat-number" className="text-sm">Door / Flat No.</Label>
            <Input
              id="flat-number"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g., Room 301, Flat B-12"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="building-name" className="text-sm">Building / PG / Hostel Name *</Label>
            <Input
              id="building-name"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              placeholder="e.g., Shree Krishna PG, Academic Block"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="landmark" className="text-sm">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g., Near Water Tank, Opposite MUJ Gate"
              className="mt-1"
            />
          </div>

          {/* Address Type Selection */}
          <div>
            <Label className="text-sm mb-2 block">Save address as</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={addressType === 'home' ? 'default' : 'outline'}
                onClick={() => setAddressType('home')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                type="button"
                variant={addressType === 'work' ? 'default' : 'outline'}
                onClick={() => setAddressType('work')}
                className="flex-1"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Work
              </Button>
              <Button
                type="button"
                variant={addressType === 'other' ? 'default' : 'outline'}
                onClick={() => setAddressType('other')}
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Other
              </Button>
            </div>
          </div>

          {addressType === 'other' && (
            <div>
              <Label htmlFor="custom-label" className="text-sm">Custom Label</Label>
              <Input
                id="custom-label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g., Friend's Place, Gym"
                className="mt-1"
              />
            </div>
          )}
          </div>
        </div>

        {/* Fixed Save Button at Bottom */}
        <div className="p-4 pt-2 pb-6 border-t bg-white flex-shrink-0 safe-area-inset-bottom">
          <Button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 lg:py-6 text-base"
          >
            SAVE ADDRESS & PROCEED
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

