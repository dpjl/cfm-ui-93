
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MobileViewMode } from '@/types/gallery';
import { ArrowLeft, ArrowRight, Columns } from 'lucide-react';

interface MobileViewSwitcherProps {
  viewMode: MobileViewMode;
  setViewMode: (mode: MobileViewMode) => void;
  className?: string;
  // Ces deux props sont supprimées car elles font double emploi avec viewMode et setViewMode
  // mobileViewMode?: MobileViewMode;
  // setMobileViewMode?: React.Dispatch<React.SetStateAction<MobileViewMode>>;
}

const MobileViewSwitcher: React.FC<MobileViewSwitcherProps> = ({
  viewMode,
  setViewMode,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <div className={`mobile-view-switcher ${className}`}>
      <Button
        variant={viewMode === 'left' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('left')}
        className="h-9 w-9"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'both' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('both')}
        className="h-9 w-9"
      >
        <Columns className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'right' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('right')}
        className="h-9 w-9"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MobileViewSwitcher;
