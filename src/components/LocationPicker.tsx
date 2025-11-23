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

// Manipal University Jaipur coordinates
const MUJ_CENTER = {
  lat: 26.8432,
  lng: 75.5659
};
const MAX_DELIVERY_RADIUS_KM = 3;

// Comprehensive list of PGs, Hostels and Landmarks near MUJ
// Organized alphabetically for easy search
const ALL_LOCATIONS = [
  // Campus Hostels
  { name: 'GHS Boys Hostel', category: 'Campus', lat: 26.8432, lng: 75.5659, address: 'GHS Boys Hostel, Manipal University Jaipur, Dehmi Kalan, Jaipur' },
  { name: 'GHS Girls Hostel', category: 'Campus', lat: 26.8428, lng: 75.5655, address: 'GHS Girls Hostel, Manipal University Jaipur, Dehmi Kalan, Jaipur' },
  { name: 'MUJ Main Gate', category: 'Campus', lat: 26.8445, lng: 75.5670, address: 'Main Gate, Manipal University Jaipur, Jaipur-Ajmer Expressway' },
  { name: 'Academic Block MUJ', category: 'Campus', lat: 26.8425, lng: 75.5665, address: 'Academic Block, Manipal University Jaipur, Dehmi Kalan' },
  
  // Boys Hostels (from your map + web search)
  { name: 'Harlin Boys Hostel', category: 'Boys Hostel', lat: 26.8472, lng: 75.5698, address: 'Harlin Boys Hostel, Vinayak Marg, Near MUJ, Jaipur' },
  { name: 'ChillOut Hostels Boys', category: 'Boys Hostel', lat: 26.8476, lng: 75.5708, address: 'ChillOut Hostels, Elegance Hostel Rd, Near MUJ, Jaipur' },
  { name: 'Hotel O SS', category: 'Boys Hostel', lat: 26.8470, lng: 75.5705, address: 'Hotel O SS, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Narbada Hostel', category: 'Boys Hostel', lat: 26.8478, lng: 75.5710, address: 'Narbada Hostel, Near MUJ, Dehmi Kalan, Jaipur' },
  { name: 'Pioneer Hostel', category: 'Boys Hostel', lat: 26.8468, lng: 75.5712, address: 'Pioneer Hostel, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Sundarone Hostel', category: 'Boys Hostel', lat: 26.8477, lng: 75.5715, address: 'Sundarone Hostel, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Hostel SS', category: 'Boys Hostel', lat: 26.8475, lng: 75.5707, address: 'Hostel SS, Near Manipal University Jaipur, Dehmi Kalan' },
  { name: 'Stay Well Hostel', category: 'Boys Hostel', lat: 26.8480, lng: 75.5718, address: 'Stay Well Hostel, Manipal University Road, Dehmi Kalan' },
  { name: 'Pankh Hostel', category: 'Boys Hostel', lat: 26.8474, lng: 75.5704, address: 'Pankh Hostel, Sanjharia Vatika Road, Near MUJ' },
  { name: 'Elegance Hostel', category: 'Boys Hostel', lat: 26.8476, lng: 75.5709, address: 'Elegance Hostel, Elegance Hostel Rd, Near MUJ, Jaipur' },
  
  // Girls Hostels & PGs
  { name: 'Manu Shri PG For Girls', category: 'Girls PG', lat: 26.8473, lng: 75.5700, address: 'Manu Shri PG For Girls, Vinayak Marg, Near MUJ' },
  { name: 'ChillOut Hostels Girls', category: 'Girls PG', lat: 26.8476, lng: 75.5708, address: 'ChillOut Hostels Girls, Elegance Hostel Rd, Near MUJ' },
  
  // Mixed/Residential
  { name: 'Narayan Residency Hostel', category: 'Residency', lat: 26.8471, lng: 75.5702, address: 'Narayan Residency Hostel & Flats, Near MUJ, Dehmi Kalan' },
  { name: 'Lakshay Residency', category: 'Residency', lat: 26.8482, lng: 75.5720, address: 'Lakshay Residency & Flats, Near Manipal University Jaipur' },
  { name: 'Samarth Ghar', category: 'Residency', lat: 26.8467, lng: 75.5714, address: 'Samarth Ghar, Near MUJ, Dehmi Kalan, Jaipur' },
  
  // General PG Areas
  { name: 'Dehmi Kalan Main Area', category: 'Area', lat: 26.8475, lng: 75.5705, address: 'Dehmi Kalan Main Area, Near MUJ, Jaipur' },
  { name: 'Kardhani Village', category: 'Area', lat: 26.8380, lng: 75.5620, address: 'Kardhani Village, Near MUJ, Jaipur' },
  { name: 'NH-8 Side Area', category: 'Area', lat: 26.8485, lng: 75.5725, address: 'NH-8, Near Manipal University, Jaipur' },
  { name: 'Sanjharia Vatika Road', category: 'Area', lat: 26.8474, lng: 75.5706, address: 'Sanjharia Vatika Road, Near MUJ, Jaipur' },
  { name: 'Vinayak Marg Area', category: 'Area', lat: 26.8472, lng: 75.5698, address: 'Vinayak Marg, Dehmi Kalan, Near MUJ, Jaipur' },
  { name: 'Elegance Hostel Road Area', category: 'Area', lat: 26.8476, lng: 75.5709, address: 'Elegance Hostel Road, Near MUJ, Jaipur' },
  
  // Key Landmarks
  { name: 'Water Tank, Dehmi Kalan', category: 'Landmark', lat: 26.8478, lng: 75.5708, address: 'Water Tank, Dehmi Kalan, Jaipur' },
  { name: 'Main Market, Dehmi Kalan', category: 'Landmark', lat: 26.8475, lng: 75.5710, address: 'Main Market, Dehmi Kalan, Jaipur' },
  { name: 'Bus Stop, MUJ Gate', category: 'Landmark', lat: 26.8445, lng: 75.5672, address: 'Bus Stop, Near MUJ Gate, Jaipur-Ajmer Expressway' },
  { name: 'Medical Store, Near MUJ', category: 'Landmark', lat: 26.8476, lng: 75.5707, address: 'Medical Store, Near MUJ, Dehmi Kalan' },
  { name: 'Petrol Pump, NH-8', category: 'Landmark', lat: 26.8488, lng: 75.5728, address: 'Petrol Pump, NH-8, Near Manipal University' },
  { name: 'Shree Food Court', category: 'Landmark', lat: 26.8470, lng: 75.5696, address: 'Shree Food Court, Near MUJ, Dehmi Kalan' },
  { name: 'The Bamboo Canopy', category: 'Landmark', lat: 26.8483, lng: 75.5722, address: 'The Bamboo Canopy, Near MUJ, Jaipur' },
  { name: 'Pioneer Cafe', category: 'Landmark', lat: 26.8468, lng: 75.5713, address: 'Pioneer Cafe, Near MUJ, Dehmi Kalan' },
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

// Group by category for organized display
const COMMON_AREAS = ALL_LOCATIONS.reduce((acc, location) => {
  if (!acc[location.category]) {
    acc[location.category] = [];
  }
  acc[location.category].push(location);
  return acc;
}, {} as Record<string, typeof ALL_LOCATIONS>);

// Flatten for backward compatibility
const COMMON_LOCATIONS = Object.values(COMMON_AREAS).flat();

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [showQuickLocations, setShowQuickLocations] = useState(false);
  const [quickLocationSearch, setQuickLocationSearch] = useState('');
  
  // Structured address fields
  const [locationSelected, setLocationSelected] = useState(!!coordinates);
  const [baseAddress, setBaseAddress] = useState(''); // From GPS/Map/Quick Location
  const [buildingName, setBuildingName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
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

  const validateDistance = (lat: number, lng: number, showToast: boolean = true): { isValid: boolean; distance: number } => {
    const distance = calculateDistance(MUJ_CENTER.lat, MUJ_CENTER.lng, lat, lng);
    
    if (distance > MAX_DELIVERY_RADIUS_KM) {
      const errorMsg = `This location is ${distance.toFixed(1)}km away. We only deliver within ${MAX_DELIVERY_RADIUS_KM}km of Manipal University Jaipur.`;
      setDistanceError(errorMsg);
      if (showToast) {
        toast({
          title: 'Location too far',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      return { isValid: false, distance };
    }
    
    setDistanceError(null);
    return { isValid: true, distance };
  };

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

    // Set search bias to MUJ area (prioritize nearby results)
    const circle = new window.google.maps.Circle({
      center: MUJ_CENTER,
      radius: MAX_DELIVERY_RADIUS_KM * 1000, // Convert km to meters
    });
    autocomplete.setBounds(circle.getBounds());

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || address;

        // Validate distance before accepting
        const validation = validateDistance(lat, lng);
        if (!validation.isValid) {
          // Clear the invalid location
          setAddress('');
          setCoords(null);
          onChange('', null);
          if (autocompleteRef.current) {
            autocompleteRef.current.value = '';
          }
          return;
        }

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

    // Check if running on localhost without HTTPS - show warning
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHTTPS = window.location.protocol === 'https:';
    
    if (isLocalhost && !isHTTPS) {
      console.warn('⚠️ Geolocation may not work reliably on localhost without HTTPS');
    }

    setIsLoading(true);
    toast({
      title: 'Getting your location...',
      description: 'This may take a few seconds',
    });

    console.log('🔍 Requesting geolocation permission...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('📍 GPS Location detected:', { lat: latitude, lng: longitude });
        
        // Validate distance before accepting
        const validation = validateDistance(latitude, longitude);
        
        if (!validation.isValid) {
          setIsLoading(false);
          console.log(`❌ Location rejected: ${validation.distance.toFixed(1)}km away from MUJ`);
          toast({
            title: 'Location too far',
            description: `You are ${validation.distance.toFixed(1)}km from MUJ. We only deliver within ${MAX_DELIVERY_RADIUS_KM}km radius. Try using "Quick Locations" or type your address manually.`,
            variant: 'destructive',
            duration: 6000,
          });
          return;
        }

        console.log(`✅ Location accepted: ${validation.distance.toFixed(1)}km from MUJ`);
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
                setBaseAddress(formattedAddress);
                setLocationSelected(true);
                toast({
                  title: 'Location detected',
                  description: 'Now add your complete address details below',
                  duration: 4000,
                });
              } else {
                // Fallback: use coordinates as address
                const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setBaseAddress(coordAddress);
                setLocationSelected(true);
                toast({
                  title: 'Location detected',
                  description: 'Now add your complete address details below',
                  duration: 4000,
                });
              }
            }
          );
        } else {
          // Fallback: use coordinates as address
          const coordAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setBaseAddress(coordAddress);
          setLocationSelected(true);
          setIsLoading(false);
          toast({
            title: 'Location detected',
            description: 'Now add your complete address details below',
            duration: 4000,
          });
        }
      },
      (error) => {
        setIsLoading(false);
        
        let errorTitle = 'Location access failed';
        let errorDescription = 'Please try another method to enter your address.';
        
        console.error('❌ Geolocation Error:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        // Check if running on localhost
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            if (isLocalhost) {
              errorTitle = 'GPS not working on localhost';
              errorDescription = 'Geolocation often fails on localhost. Use "Quick Locations" to select a preset location, or type your address manually. GPS will work on production (HTTPS).';
            } else {
              errorDescription = 'Location permission denied. Please enable it in browser settings or use alternative methods.';
            }
            break;
          case error.POSITION_UNAVAILABLE:
            errorDescription = 'Cannot determine location. Use "Quick Locations" or type your address manually.';
            break;
          case error.TIMEOUT:
            errorDescription = 'Location request timed out. Use "Quick Locations" or type your address manually.';
            break;
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: 'destructive',
          duration: 7000,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 0,
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
    setDistanceError(null);
    setLocationSelected(false);
    setBaseAddress('');
    setBuildingName('');
    setRoomNumber('');
    setLandmark('');
    onChange('', null);
    if (autocompleteRef.current) {
      autocompleteRef.current.value = '';
    }
  };

  // Combine address fields into final address
  useEffect(() => {
    if (!locationSelected) return;
    
    const parts = [];
    if (roomNumber) parts.push(roomNumber);
    if (buildingName) parts.push(buildingName);
    if (landmark) parts.push(landmark);
    if (baseAddress) parts.push(baseAddress);
    
    const finalAddress = parts.filter(p => p.trim()).join(', ');
    setAddress(finalAddress);
    onChange(finalAddress, coords);
  }, [buildingName, roomNumber, landmark, baseAddress, locationSelected]);

  // Select a common location
  const selectCommonLocation = (location: typeof COMMON_LOCATIONS[0]) => {
    setBaseAddress(location.address);
    setCoords({ lat: location.lat, lng: location.lng });
    setShowQuickLocations(false);
    setDistanceError(null);
    setLocationSelected(true);
    toast({
      title: 'Location selected',
      description: `${location.name} - Now add your complete address details below`,
      duration: 4000,
    });
  };

  // Initialize interactive map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const center = coords || MUJ_CENTER;
    
    // Create map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Create draggable marker
    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      title: 'Drag to select delivery location',
    });

    markerRef.current = marker;

    // Draw circle showing delivery radius
    const circle = new window.google.maps.Circle({
      map,
      center: MUJ_CENTER,
      radius: MAX_DELIVERY_RADIUS_KM * 1000, // Convert to meters
      fillColor: '#FF6B35',
      fillOpacity: 0.1,
      strokeColor: '#FF6B35',
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });

    // Handle map click to place marker
    map.addListener('click', (e: any) => {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      
      // Validate distance
      const validation = validateDistance(clickedLat, clickedLng);
      
      if (!validation.isValid) {
        toast({
          title: 'Location too far',
          description: `Selected location is ${validation.distance.toFixed(1)}km away. Please select within ${MAX_DELIVERY_RADIUS_KM}km of MUJ.`,
          variant: 'destructive',
        });
        return;
      }

      // Update marker position
      marker.setPosition(e.latLng);
      
      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const newAddress = results[0].formatted_address;
          setBaseAddress(newAddress);
          setCoords({ lat: clickedLat, lng: clickedLng });
          setDistanceError(null);
          setLocationSelected(true);
          toast({
            title: 'Location selected',
            description: 'Now add your complete address details below',
            duration: 4000,
          });
        }
      });
    });

    // Handle marker drag
    marker.addListener('dragend', (e: any) => {
      const draggedLat = e.latLng.lat();
      const draggedLng = e.latLng.lng();
      
      // Validate distance
      const validation = validateDistance(draggedLat, draggedLng);
      
      if (!validation.isValid) {
        toast({
          title: 'Location too far',
          description: `Selected location is ${validation.distance.toFixed(1)}km away. Please select within ${MAX_DELIVERY_RADIUS_KM}km of MUJ.`,
          variant: 'destructive',
        });
        // Reset marker to previous valid position
        marker.setPosition(coords || MUJ_CENTER);
        return;
      }

      // Reverse geocode
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const newAddress = results[0].formatted_address;
          setBaseAddress(newAddress);
          setCoords({ lat: draggedLat, lng: draggedLng });
          setDistanceError(null);
          setLocationSelected(true);
        }
      });
    });
  };

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && window.google) {
      // Small delay to ensure the div is rendered
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [showMap]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="flex gap-1 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="h-8 text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isLoading ? 'GPS' : 'Use GPS'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQuickLocations(!showQuickLocations)}
            className="h-8 text-xs"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Quick
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="h-8 text-xs"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Map
          </Button>
          {locationSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearLocation}
              className="h-8"
              title="Clear and start over"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Locations Dropdown - With Search */}
      {showQuickLocations && (
        <div className="bg-white border rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between z-10">
            <p className="text-sm text-gray-700 font-semibold">📍 {ALL_LOCATIONS.length} Locations Near MUJ</p>
            <button
              type="button"
              onClick={() => {
                setShowQuickLocations(false);
                setQuickLocationSearch('');
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Search Box */}
          <div className="sticky top-12 bg-white border-b px-3 py-2 z-10">
            <Input
              type="text"
              placeholder="Search for your PG, hostel, or area..."
              value={quickLocationSearch}
              onChange={(e) => setQuickLocationSearch(e.target.value)}
              className="w-full text-sm"
              autoFocus
            />
          </div>
          
          {/* Scrollable Results */}
          <div className="overflow-y-auto flex-1 p-2">
            {(() => {
              const searchTerm = quickLocationSearch.toLowerCase().trim();
              const filtered = searchTerm 
                ? ALL_LOCATIONS.filter(loc => 
                    loc.name.toLowerCase().includes(searchTerm) ||
                    loc.category.toLowerCase().includes(searchTerm) ||
                    loc.address.toLowerCase().includes(searchTerm)
                  )
                : ALL_LOCATIONS;
              
              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No locations found for "{quickLocationSearch}"</p>
                    <p className="text-xs mt-2">Try searching by PG name, hostel, or area</p>
                  </div>
                );
              }
              
              // Group filtered results by category
              const groupedFiltered = filtered.reduce((acc, loc) => {
                if (!acc[loc.category]) acc[loc.category] = [];
                acc[loc.category].push(loc);
                return acc;
              }, {} as Record<string, typeof ALL_LOCATIONS>);
              
              return Object.entries(groupedFiltered).map(([category, locations]) => (
                <div key={category} className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-1 sticky top-0 bg-white">
                    {category} ({locations.length})
                  </p>
                  <div className="space-y-1">
                    {locations.map((location) => (
                      <button
                        key={location.name}
                        type="button"
                        onClick={() => {
                          selectCommonLocation(location);
                          setQuickLocationSearch('');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-orange-50 hover:border-orange-200 border border-transparent rounded-lg text-sm transition-all group"
                      >
                        <div className="font-medium text-gray-900 group-hover:text-orange-700">{location.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{location.address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ));
            })()}
            
            <div className="border-t pt-2 mt-2 sticky bottom-0 bg-white">
              <p className="text-xs text-gray-600 px-2 py-1">
                💡 Don't see your PG? Type the full address in the field below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* After Location Selection - Show Address Detail Fields */}
      {locationSelected && coords && (
        <div className="space-y-3 bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2 text-sm text-green-800 mb-2">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-semibold">Location confirmed!</p>
              <p className="text-xs">Base: {baseAddress}</p>
            </div>
          </div>

          <div className="space-y-3 bg-white p-3 rounded border">
            <p className="font-medium text-sm text-gray-700">📝 Complete your address:</p>
            
            <div>
              <Label htmlFor="room-number" className="text-xs text-gray-600">
                Room/Flat Number
              </Label>
              <Input
                id="room-number"
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., Room 301, Flat B-12"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="building-name" className="text-xs text-gray-600">
                Building/PG/Hostel Name *
              </Label>
              <Input
                id="building-name"
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="e.g., Shree Krishna PG, Academic Block"
                className="mt-1"
                required={required}
              />
            </div>

            <div>
              <Label htmlFor="landmark" className="text-xs text-gray-600">
                Nearby Landmark (Optional)
              </Label>
              <Input
                id="landmark"
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Water Tank, Opposite MUJ Gate"
                className="mt-1"
              />
            </div>

            {address && (
              <div className="bg-gray-50 p-2 rounded text-xs">
                <p className="font-medium text-gray-700 mb-1">📬 Final Address:</p>
                <p className="text-gray-600">{address}</p>
              </div>
            )}
          </div>

          <input
            ref={autocompleteRef}
            type="hidden"
            value={address}
            required={required}
          />
        </div>
      )}

      {distanceError && (
        <div className="text-sm text-red-600 flex items-start gap-2 bg-red-50 p-2 rounded">
          <span>⚠️</span>
          <span>{distanceError}</span>
        </div>
      )}

      {!distanceError && coords && (
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

      {address && !coords && !distanceError && (
        <p className="text-sm text-muted-foreground">
          💡 Tip: If no suggestions appear, just type your full address and press Tab or click outside
        </p>
      )}

      {!locationSelected && !distanceError && (
        <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-4 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full p-2 flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-blue-900">Choose how to select your location:</p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold bg-blue-500 text-white px-2 py-0.5 rounded text-xs">OPTION 1</span>
                    <strong>Use GPS</strong> - Auto-detect your location
                  </p>
                </div>
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold bg-blue-500 text-white px-2 py-0.5 rounded text-xs">OPTION 2</span>
                    <strong>Quick Locations</strong> - Select from 32+ preset locations
                  </p>
                </div>
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold bg-blue-500 text-white px-2 py-0.5 rounded text-xs">OPTION 3</span>
                    <strong>Choose on Map</strong> - Click/drag to select exact location
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-2 italic text-center">
                  📍 After selection, you'll add detailed address (room, building, landmark)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {showMap && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              🗺️ Click or drag the marker to select your exact location
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMap(false)}
              className="text-xs"
            >
              Hide Map
            </Button>
          </div>
          <div 
            ref={mapRef}
            className="w-full h-[400px] border-2 border-orange-200 rounded-lg overflow-hidden"
          />
          <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            <p className="font-medium">📍 How to use:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Click anywhere</strong> on the map to place the marker</li>
              <li><strong>Drag the marker</strong> to fine-tune your location</li>
              <li>The orange circle shows the <strong>3km delivery radius</strong></li>
              <li>Address will be <strong>auto-filled</strong> based on map selection</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default LocationPicker;


