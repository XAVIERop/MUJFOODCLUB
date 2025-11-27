import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserResidency } from '@/utils/residencyUtils';

// Available hostel blocks
const HOSTEL_BLOCKS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];

interface LocationContextType {
  selectedBlock: string;
  setSelectedBlock: (block: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const { scope: userScope } = getUserResidency(profile);
  
  // Determine initial block based on user type
  const getInitialBlock = (): string => {
    // For guests (no profile), return empty string
    if (!profile) {
      return '';
    }
    
    // For outside users, return 'OFF_CAMPUS'
    if (userScope === 'off_campus') {
      return 'OFF_CAMPUS';
    }
    
    // For GHS users, use their profile block or default to empty (let them select)
    return profile.block || '';
  };

  const [selectedBlock, setSelectedBlock] = useState<string>(() => {
    // On initial mount, check localStorage first (for GHS users who may have saved a location)
    const savedLocation = localStorage.getItem('selectedBlock');
    if (savedLocation && savedLocation !== 'B1' && HOSTEL_BLOCKS.includes(savedLocation)) {
      return savedLocation;
    }
    // Otherwise use the initial block based on user type
    return getInitialBlock();
  });

  // Load saved location from localStorage on mount (only for GHS users)
  useEffect(() => {
    if (profile && userScope === 'ghs') {
      const savedLocation = localStorage.getItem('selectedBlock');
      if (savedLocation && savedLocation !== 'B1' && HOSTEL_BLOCKS.includes(savedLocation)) {
        // Only use saved location if it's a valid block and not the default B1
      setSelectedBlock(savedLocation);
      } else if (profile.block && HOSTEL_BLOCKS.includes(profile.block)) {
        // Use profile block if available and valid
        setSelectedBlock(profile.block);
      }
    } else if (!profile) {
      // Guest user - clear location
      setSelectedBlock('');
    } else if (userScope === 'off_campus') {
      // Outside user - set to OFF_CAMPUS
      setSelectedBlock('OFF_CAMPUS');
    }
  }, [profile, userScope]);

  // Save location to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedBlock', selectedBlock);
  }, [selectedBlock]);

  const value = {
    selectedBlock,
    setSelectedBlock,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
