
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Maximize2, Minimize2, Rows3, LayoutGrid, PanelLeft, PanelRight } from 'lucide-react';
import { GalleryViewMode } from '@/types/gallery';
import { useIsMobile } from '@/hooks/use-breakpoint';
import ViewModeSwitcher from '../layout/ViewModeSwitcher';

interface GalleryToolbarProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  viewMode: 'single' | 'split';
  position: 'source' | 'destination';
  onToggleSidebar?: () => void;
  selectionMode: 'single' | 'multiple';
  onToggleSelectionMode: () => void;
  galleryViewMode?: GalleryViewMode;
  onToggleFullView?: () => void;
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
  galleryViewMode,
  onToggleFullView
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const showSelectAllButton = selectionMode === 'multiple' && mediaIds.length > 0;
  const showDeselectAllButton = selectionMode === 'multiple' && selectedIds.length > 0;
  
  const isFullView = galleryViewMode === 'left' && position === 'left' || galleryViewMode === 'right' && position === 'right';
  const canToggleFullView = galleryViewMode && onToggleFullView;
  
  const titleClasses = "text-md font-semibold flex-1 truncate";
  const buttonClasses = "h-8 w-8 p-0";
  
  const renderSidebarToggleButton = () => {
    if (!onToggleSidebar) return null;
    
    const Icon = position === 'source' ? PanelLeft : PanelRight;
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className={buttonClasses}
        title={`Toggle ${position} sidebar`}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-between p-2 bg-background/60 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center gap-2">
        {renderSidebarToggleButton()}
        <h2 className={titleClasses}>{position === 'source' ? 'Source' : 'Destination'}</h2>
      </div>
      
      <div className="flex items-center gap-1">
        {showSelectAllButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="text-xs h-7 px-2"
          >
            Tout sélectionner
          </Button>
        )}
        
        {showDeselectAllButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            className="text-xs h-7 px-2"
          >
            Désélectionner
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSelectionMode}
          className={buttonClasses}
          title={selectionMode === 'multiple' ? t('single_selection') : t('multiple_selection')}
        >
          {selectionMode === 'multiple' ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <Rows3 className="h-4 w-4" />
          )}
        </Button>
        
        {canToggleFullView && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullView}
            className={buttonClasses}
            title={isFullView ? "Vue partagée" : "Vue plein écran"}
          >
            {isFullView ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GalleryToolbar;
