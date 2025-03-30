
import React from 'react';
import { Button } from '../ui/button';
import { SelectionMode } from '../../hooks/use-gallery-selection';
import { CheckSquare, Square, ChevronLeft, ChevronRight, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MobileViewMode } from '@/types/gallery';

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
  mobileViewMode?: MobileViewMode;
  onToggleMaximize?: () => void;
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
  onToggleSelectionMode,
  mobileViewMode = 'both',
  onToggleMaximize
}) => {
  const isMobile = useIsMobile();
  
  // Définir l'icône du bouton sidebar selon la position (gauche/droite)
  const SidebarIcon = position === 'source' ? ChevronLeft : ChevronRight;
  const SidebarLabel = position === 'source' ? 'Options Left' : 'Options Right';
  
  // Déterminer si ce panneau est actuellement maximisé (vue unique)
  const isCurrentGalleryMaximized = 
    (mobileViewMode === 'left' && position === 'source') || 
    (mobileViewMode === 'right' && position === 'destination');
  
  // Créer le bouton de maximisation/minimisation
  const maximizeButton = onToggleMaximize && (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMaximize}
            className="h-8 w-8"
          >
            {isCurrentGalleryMaximized ? (
              <Minimize2 size={isMobile ? 18 : 20} />
            ) : (
              <Maximize2 size={isMobile ? 18 : 20} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isCurrentGalleryMaximized ? 'Show both galleries' : `Maximize ${position} gallery`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Pour la galerie de gauche (source), ordre: sidebar, select all, clear, mode, maximize
  const leftGalleryToolbar = (
    <>
      {onToggleSidebar && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleSidebar}
                className="h-8 w-8"
              >
                {position === 'source' ? (
                  <div className="flex items-center justify-center">
                    <ChevronLeft size={isMobile ? 16 : 18} className="text-muted-foreground" />
                    <Settings size={isMobile ? 14 : 16} className="ml-[-4px]" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Settings size={isMobile ? 14 : 16} className="mr-[-4px]" />
                    <ChevronRight size={isMobile ? 16 : 18} className="text-muted-foreground" />
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{SidebarLabel}</p>
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
      
      {maximizeButton}
    </>
  );

  // Pour la galerie de droite (destination), ordre: maximize, mode, clear, select all, sidebar
  const rightGalleryToolbar = (
    <>
      {maximizeButton}
    
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
      
      {onToggleSidebar && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleSidebar}
                className="h-8 w-8"
              >
                {position === 'source' ? (
                  <div className="flex items-center justify-center">
                    <ChevronLeft size={isMobile ? 16 : 18} className="text-muted-foreground" />
                    <Settings size={isMobile ? 14 : 16} className="ml-[-4px]" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Settings size={isMobile ? 14 : 16} className="mr-[-4px]" />
                    <ChevronRight size={isMobile ? 16 : 18} className="text-muted-foreground" />
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{SidebarLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );

  return (
    <div className="flex items-center justify-between space-x-2 py-2">
      <div className="flex items-center space-x-1">
        {position === 'source' && leftGalleryToolbar}
      </div>
      
      <div className="flex items-center space-x-1 ml-auto">
        {position === 'destination' && rightGalleryToolbar}
      </div>
    </div>
  );
};

export default GalleryToolbar;
