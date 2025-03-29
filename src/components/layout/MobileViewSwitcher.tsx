
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MobileViewMode } from '@/types/gallery';
import { ArrowLeft, ArrowRight, Columns } from 'lucide-react';

interface MobileViewSwitcherProps {
  viewMode: MobileViewMode;
  setViewMode: (mode: MobileViewMode) => void;
  className?: string;
  mobileViewMode?: MobileViewMode;  // Added to match usage in MobileGalleriesView
  setMobileViewMode?: React.Dispatch<React.SetStateAction<MobileViewMode>>; // Added to match usage
}

const MobileViewSwitcher: React.FC<MobileViewSwitcherProps> = ({
  viewMode,
  setViewMode,
  className = '',
  // Use these new props if provided, otherwise fall back to the original props
  mobileViewMode,
  setMobileViewMode
}) => {
  const isMobile = useIsMobile();
  const currentViewMode = mobileViewMode || viewMode;
  const changeViewMode = (mode: MobileViewMode) => {
    if (setMobileViewMode) {
      setMobileViewMode(mode);
    } else {
      setViewMode(mode);
    }
  };
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className={`mobile-view-switcher ${className}`}>
      <Button
        variant={currentViewMode === 'left' ? 'default' : 'outline'}
        size="icon"
        onClick={() => changeViewMode('left')}
        className="h-9 w-9"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={currentViewMode === 'both' ? 'default' : 'outline'}
        size="icon"
        onClick={() => changeViewMode('both')}
        className="h-9 w-9"
      >
        <Columns className="h-4 w-4" />
      </Button>
      
      <Button
        variant={currentViewMode === 'right' ? 'default' : 'outline'}
        size="icon"
        onClick={() => changeViewMode('right')}
        className="h-9 w-9"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MobileViewSwitcher;
