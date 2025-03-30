
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, SplitSquareHorizontal } from 'lucide-react';
import { MobileViewMode } from '@/types/gallery';

interface MobileViewSwitcherProps {
  viewMode: MobileViewMode;
  setViewMode: (mode: MobileViewMode) => void;
  className?: string;
}

const MobileViewSwitcher: React.FC<MobileViewSwitcherProps> = ({ 
  viewMode, 
  setViewMode,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode('left')}
        className={viewMode === 'left' ? 'bg-muted' : ''}
        title="Source uniquement"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-4 h-4 border-r border-muted-foreground"></div>
        </div>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode('both')}
        className={viewMode === 'both' ? 'bg-muted' : ''}
        title="Les deux galeries"
      >
        <SplitSquareHorizontal className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode('right')}
        className={viewMode === 'right' ? 'bg-muted' : ''}
        title="Destination uniquement"
      >
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-4 h-4 border-l border-muted-foreground"></div>
        </div>
      </Button>
    </div>
  );
};

export default MobileViewSwitcher;
