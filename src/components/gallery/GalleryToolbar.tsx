
import React from 'react';
import { Button } from '../ui/button';
import { SelectionMode } from '../../hooks/use-gallery-selection';
import { useMediaQuery } from '../../hooks/use-media-query';
import { CheckSquare, Square, Menu, Panels, PanelLeft, PanelRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface GalleryToolbarProps {
  directory?: string;
  showSidePanel?: () => void;
  mediaIds: string[];
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  viewMode?: 'single' | 'split';
  position?: 'source' | 'destination';
  onToggleSidebar?: () => void;
  selectionMode: SelectionMode;
  onToggleSelectionMode: () => void;
}

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({ 
  mediaIds,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  viewMode = 'single',
  position = 'source',
  onToggleSidebar,
  selectionMode,
  onToggleSelectionMode
}) => {
  const isMobile = useIsMobile();
  
  // Define the sidebar icon based on position
  const SidebarIcon = position === 'source' ? PanelLeft : PanelRight;

  return (
    <div className="flex items-center justify-between space-x-2 py-2">
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onSelectAll}
                disabled={mediaIds.length === 0}
                className="h-8 w-8"
              >
                <CheckSquare size={isMobile ? 18 : 20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Select All</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {selectedIds.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDeselectAll}
                  className="h-8 w-8"
                >
                  <Square size={isMobile ? 18 : 20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Clear Selection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleSelectionMode}
                className="h-8 w-8"
              >
                {selectionMode === 'single' ? (
                  <div className="relative">
                    <CheckSquare size={isMobile ? 18 : 20} />
                    <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">1</span>
                  </div>
                ) : (
                  <div className="relative">
                    <CheckSquare size={isMobile ? 18 : 20} />
                    <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">+</span>
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{selectionMode === 'single' ? 'Single Select' : 'Multi Select'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center">
        {selectedIds.length > 0 && (
          <span className="text-xs px-2 text-muted-foreground">
            {selectedIds.length}/{mediaIds.length}
          </span>
        )}
        
        {onToggleSidebar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="h-8 w-8 ml-1"
                >
                  <SidebarIcon size={isMobile ? 18 : 20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle Sidebar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default GalleryToolbar;
