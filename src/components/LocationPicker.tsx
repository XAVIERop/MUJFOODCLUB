import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  value: string;
  coordinates?: { lat: number; lng: number } | null;
  onChange: (address: string, coordinates?: { lat: number; lng: number } | null) => void;
  required?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  coordinates,
  onChange,
  required = false,
}) => {
  const [address, setAddress] = useState(value);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(coordinates || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const { toast } = useToast();

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Location picker will use manual input only.');
      return;
    }

    if (window.google && window.google.maps) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    window.initGoogleMaps = () => {
      initializeAutocomplete();
    };

    document.head.appendChild(script);

    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!autocompleteRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'in' }, // Restrict to India
        fields: ['formatted_address', 'geometry', 'place_id'],
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || address;

        setAddress(formattedAddress);
        setCoords({ lat, lng });
        onChange(formattedAddress, { lat, lng });
      }
    });

    autocompleteInstanceRef.current = autocomplete;
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results: any[], status: string) => {
              setIsLoading(false);
              if (status === 'OK' && results[0]) {
                const formattedAddress = results[0].formatted_address;
                setAddress(formattedAddress);
                onChange(formattedAddress, { lat: latitude, lng: longitude });
              } else {
                // Fallback: use coordinates as address
                const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setAddress(coordAddress);
                onChange(coordAddress, { lat: latitude, lng: longitude });
              }
            }
          );
        } else {
          // Fallback: use coordinates as address
          const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(coordAddress);
          onChange(coordAddress, { lat: latitude, lng: longitude });
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: 'Location access denied',
          description: 'Please allow location access or enter address manually.',
          variant: 'destructive',
        });
      }
    );
  };

  // Generate Google Maps link
  const getGoogleMapsLink = () => {
    if (coords) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    }
    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    return null;
  };

  // Handle manual address input
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    onChange(newAddress, coords);
  };

  // Clear location
  const clearLocation = () => {
    setAddress('');
    setCoords(null);
    onChange('', null);
    if (autocompleteRef.current) {
      autocompleteRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="delivery-address">
          Delivery Address {required && '*'}
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="h-8"
          >
            <Navigation className="h-4 w-4 mr-1" />
            {isLoading ? 'Getting...' : 'Use Current'}
          </Button>
          {address && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearLocation}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Input
        ref={autocompleteRef}
        id="delivery-address"
        type="text"
        value={address}
        onChange={(e) => handleAddressChange(e.target.value)}
        placeholder="Start typing your address or click 'Use Current' for GPS location"
        required={required}
        className="w-full"
      />

      {coords && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Location: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</span>
          {getGoogleMapsLink() && (
            <a
              href={getGoogleMapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-2"
            >
              View on Maps
            </a>
          )}
        </div>
      )}

      {address && !coords && (
        <p className="text-sm text-muted-foreground">
          💡 Tip: Select an address from suggestions or use "Use Current" for precise location
        </p>
      )}

      {showMap && coords && (
        <div className="mt-4 border rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="300"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${coords.lat},${coords.lng}&zoom=17`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {coords && !showMap && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(true)}
          className="w-full"
        >
          Show Map
        </Button>
      )}
    </div>
  );
};

export default LocationPicker;


