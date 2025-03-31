
import React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { GalleryViewMode } from '@/types/gallery';
import { ArrowLeft, ArrowRight, Columns } from 'lucide-react';

interface ViewModeSwitcherProps {
  viewMode: GalleryViewMode;
  setViewMode: (mode: GalleryViewMode) => void;
  className?: string;
  showOnDesktop?: boolean;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  setViewMode,
  className = '',
  showOnDesktop = false
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile && !showOnDesktop) {
    return null;
  }
  
  return (
    <div className={`view-mode-switcher ${className}`}>
      <Button
        variant={viewMode === 'left' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('left')}
        className="h-9 w-9"
        title="Afficher uniquement la galerie source"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'both' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('both')}
        className="h-9 w-9"
        title="Afficher les deux galeries"
      >
        <Columns className="h-4 w-4" />
      </Button>
      
      <Button
        variant={viewMode === 'right' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setViewMode('right')}
        className="h-9 w-9"
        title="Afficher uniquement la galerie destination"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewModeSwitcher;
