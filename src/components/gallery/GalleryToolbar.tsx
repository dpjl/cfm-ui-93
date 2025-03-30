
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/use-language';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { SelectionMode } from '@/hooks/use-gallery-selection';
import { MobileViewMode } from '@/types/gallery';
import { 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  Columns,
  Maximize2,
  Minimize2,
  SlidersHorizontal
} from 'lucide-react';

interface GalleryToolbarProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  viewMode: 'single' | 'split';
  position: 'source' | 'destination';
  onToggleSidebar?: () => void;
  selectionMode: SelectionMode;
  onToggleSelectionMode: () => void;
  mobileViewMode?: MobileViewMode;
  onToggleFullView?: () => void;
  onColumnsChange?: (count: number) => void;
  columnsCount?: number;
}

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({
  mediaIds,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  viewMode,
  position,
  onToggleSidebar,
  selectionMode,
  onToggleSelectionMode,
  mobileViewMode,
  onToggleFullView,
  onColumnsChange,
  columnsCount = 4
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const hasSelection = selectedIds.length > 0;
  const allSelected = mediaIds.length > 0 && selectedIds.length === mediaIds.length;
  
  // Rendus conditionnels pour l'optimisation des performances
  const renderSidebarToggle = () => {
    if (!onToggleSidebar) return null;
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="text-muted-foreground hover:text-foreground"
      >
        {position === 'source' ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    );
  };

  const renderSelectionControls = () => {
    if (mediaIds.length === 0) return null;
    
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-muted-foreground hover:text-foreground"
          disabled={mediaIds.length === 0}
        >
          {allSelected ? (
            <CheckSquare className="h-4 w-4" />
          ) : (
            <Square className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant={selectionMode === 'multiple' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onToggleSelectionMode}
          className="text-muted-foreground hover:text-foreground"
          title={selectionMode === 'multiple' ? 'Switch to single selection' : 'Switch to multiple selection'}
        >
          <Columns className="h-4 w-4" />
        </Button>
      </>
    );
  };

  // Nouveau: contrôle des colonnes directement dans la barre d'outils
  const renderColumnsControl = () => {
    if (!onColumnsChange) return null;
    
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onColumnsChange(columnsCount - 1)}
          disabled={columnsCount <= 2}
          className="text-muted-foreground hover:text-foreground h-7 w-7"
          title="Decrease columns"
        >
          <span>-</span>
        </Button>
        
        <div className="text-xs text-muted-foreground w-6 text-center">
          {columnsCount}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onColumnsChange(columnsCount + 1)}
          disabled={columnsCount >= 12}
          className="text-muted-foreground hover:text-foreground h-7 w-7"
          title="Increase columns"
        >
          <span>+</span>
        </Button>
      </div>
    );
  };

  // Nouveau: Bouton pour basculer la vue pleine/partagée
  const renderViewToggle = () => {
    if (!onToggleFullView) return null;

    // Déterminer si ce composant est en mode plein écran
    const isFullScreen = position === 'source' 
      ? mobileViewMode === 'left'
      : mobileViewMode === 'right';

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFullView}
        className="text-muted-foreground hover:text-foreground"
        title={isFullScreen ? "Switch to split view" : "Maximize this gallery"}
      >
        {isFullScreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    );
  };

  return (
    <div className={`
      flex items-center justify-between px-2 py-1 
      bg-background/80 backdrop-blur-sm border-b border-border/30
      ${isMobile ? 'gallery-toolbar-mobile' : ''}
    `}>
      <div className="flex items-center gap-1">
        {renderSidebarToggle()}
        {renderSelectionControls()}
      </div>
      
      <div className="text-sm font-medium truncate px-2">
        {selectedIds.length > 0 ? (
          <span>{selectedIds.length} selected</span>
        ) : position === 'source' ? (
          <span>Source Gallery</span>
        ) : (
          <span>Destination Gallery</span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {renderColumnsControl()}
        <Separator orientation="vertical" className="h-6 mx-1" />
        {renderViewToggle()}
      </div>
    </div>
  );
};

export default GalleryToolbar;
