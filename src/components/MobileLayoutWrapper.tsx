import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutWrapperProps {
  children: React.ReactNode;
  mobileChildren?: React.ReactNode;
}

/**
 * Safe wrapper component that conditionally renders different layouts
 * for mobile vs desktop without breaking existing functionality
 */
const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({ 
  children, 
  mobileChildren 
}) => {
  const isMobile = useIsMobile();
  
  // If mobileChildren is provided, use it for mobile, otherwise use default children
  if (isMobile && mobileChildren) {
    return <>{mobileChildren}</>;
  }
  
  // Default behavior: render the original children (desktop layout)
  return <>{children}</>;
};

export default MobileLayoutWrapper;
