import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  value: string;
  coordinates?: { lat: number; lng: number } | null;
  onChange: (address: string, coordinates?: { lat: number; lng: number } | null) => void;
  required?: boolean;
}

const LocationPickerEnhanced: React.FC<LocationPickerProps> = ({
  value,
  coordinates,
  onChange,
  required = false,
}) => {
  const [address, setAddress] = useState(value);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(coordinates || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const { toast } = useToast();

  // Sync with props when they change (only if different to avoid loops)
  useEffect(() => {
    setAddress(value);
  }, [value]);

  useEffect(() => {
    setCoords(coordinates || null);
  }, [coordinates]);

  // Get current location using browser GPS
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

        // Try to get address using OpenStreetMap Nominatim (free, no API key needed)
        setIsReverseGeocoding(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'MUJFoodClub/1.0', // Required by Nominatim
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              const formattedAddress = data.display_name;
              setAddress(formattedAddress);
              onChange(formattedAddress, { lat: latitude, lng: longitude });
            } else {
              // Fallback: use coordinates
              const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setAddress(coordAddress);
              onChange(coordAddress, { lat: latitude, lng: longitude });
            }
          } else {
            // Fallback: use coordinates
            const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setAddress(coordAddress);
            onChange(coordAddress, { lat: latitude, lng: longitude });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          // Fallback: use coordinates
          const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(coordAddress);
          onChange(coordAddress, { lat: latitude, lng: longitude });
        } finally {
          setIsLoading(false);
          setIsReverseGeocoding(false);
        }
      },
      (error) => {
        setIsLoading(false);
        setIsReverseGeocoding(false);
        let errorMessage = 'Failed to get location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        toast({
          title: 'Location access failed',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Generate Google Maps link (works without API key)
  const getGoogleMapsLink = () => {
    if (coords) {
      return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    }
    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }
    return null;
  };

  // Generate OpenStreetMap link
  const getOSMLink = () => {
    if (coords) {
      return `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=17`;
    }
    if (address) {
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
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
  };

  // Try to geocode address to get coordinates (optional enhancement)
  const geocodeAddress = async () => {
    if (!address || address.trim() === '') return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MUJFoodClub/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords({ lat, lng: lon });
          onChange(address, { lat, lng: lon });
          toast({
            title: 'Location found',
            description: 'Coordinates updated for this address.',
          });
        }
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
    } finally {
      setIsLoading(false);
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
            {isLoading ? (isReverseGeocoding ? 'Getting address...' : 'Getting location...') : 'Use GPS'}
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

      <div className="space-y-2">
        <Input
          id="delivery-address"
          type="text"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onBlur={geocodeAddress} // Try to get coordinates when user finishes typing
          placeholder="Enter your full address (e.g., House number, Street, Area, City) or click 'Use GPS'"
          required={required}
          className="w-full"
        />
        {address && !coords && (
          <p className="text-xs text-muted-foreground">
            💡 Tip: Click outside the field to automatically find coordinates for this address
          </p>
        )}
      </div>

      {coords && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Coordinates: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</span>
          </div>
          <div className="flex gap-2">
            {getGoogleMapsLink() && (
              <a
                href={getGoogleMapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View on Google Maps
              </a>
            )}
            {getOSMLink() && (
              <a
                href={getOSMLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View on OpenStreetMap
              </a>
            )}
          </div>
        </div>
      )}

      {!coords && address && (
        <p className="text-sm text-muted-foreground">
          💡 Click "Use GPS" to automatically get your location, or enter address manually
        </p>
      )}
    </div>
  );
};

export default LocationPickerEnhanced;

