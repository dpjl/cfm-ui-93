
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Calendar, CalendarOff, PanelLeft, Settings, Users, UserPlus, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SelectionMode } from '@/hooks/use-gallery-selection';

interface GalleryToolbarProps {
  selectedIds: string[];
  mediaIds: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  showDates: boolean;
  onToggleDates: () => void;
  viewMode?: 'single' | 'split';
  position?: 'source' | 'destination';
  onToggleSidebar?: () => void;
  selectionMode: SelectionMode;
  onToggleSelectionMode: () => void;
}

const GalleryToolbar: React.FC<GalleryToolbarProps> = ({
  selectedIds,
  mediaIds,
  onSelectAll,
  onDeselectAll,
  showDates,
  onToggleDates,
  viewMode = 'single',
  position = 'source',
  onToggleSidebar,
  selectionMode,
  onToggleSelectionMode
}) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const isCompactMode = viewMode === 'split';
  const isSourceGallery = position === 'source';
  const isMobileSplitView = isMobile && viewMode === 'split';

  const renderToolbarButton = (
    onClick: () => void,
    icon: React.ReactNode,
    activeIcon: React.ReactNode,
    isActive: boolean,
    tooltipText: string
  ) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onClick} variant={isActive ? "default" : "outline"} size="icon" className="h-7 w-7">
            {isActive ? activeIcon : icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Selection count display component
  const selectionCountDisplay = (
    <div className={`text-xs text-muted-foreground ${isSourceGallery ? 'ml-0 mr-2' : 'ml-2 mr-0'}`}>
      {selectedIds.length}/{mediaIds.length} {!isCompactMode && t('selected')}
    </div>
  );

  // Control buttons for the toolbar
  const controlButtons = (
    <>
      {renderToolbarButton(
        onSelectAll,
        <CheckSquare className="h-3.5 w-3.5" />,
        <CheckSquare className="h-3.5 w-3.5" />,
        false,
        t('select_all')
      )}
      
      {renderToolbarButton(
        onDeselectAll,
        <Square className="h-3.5 w-3.5" />,
        <Square className="h-3.5 w-3.5" />,
        false,
        t('deselect_all')
      )}
      
      {/* Hide date toggle in mobile split view */}
      {(!isMobileSplitView) && renderToolbarButton(
        onToggleDates,
        <CalendarOff className="h-3.5 w-3.5" />,
        <Calendar className="h-3.5 w-3.5" />,
        showDates,
        showDates ? t('hide_dates') : t('show_dates')
      )}
      
      {renderToolbarButton(
        onToggleSelectionMode,
        <UserPlus className="h-3.5 w-3.5" />,
        <Users className="h-3.5 w-3.5" />,
        selectionMode === 'multiple',
        selectionMode === 'multiple' ? t('single_selection') : t('multiple_selection')
      )}
      
      {/* Sidebar toggle for desktop mode only */}
      {!isMobile && onToggleSidebar && renderToolbarButton(
        onToggleSidebar,
        position === 'source' ? (
          <div className="flex items-center justify-center">
            <Settings className="h-3 w-3" />
            <ChevronRight className="h-3 w-3 -mr-0.5" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <ChevronRight className="h-3 w-3 rotate-180 -ml-0.5" />
            <Settings className="h-3 w-3" />
          </div>
        ),
        position === 'source' ? (
          <div className="flex items-center justify-center">
            <Settings className="h-3 w-3" />
            <ChevronRight className="h-3 w-3 -mr-0.5" />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <ChevronRight className="h-3 w-3 rotate-180 -ml-0.5" />
            <Settings className="h-3 w-3" />
          </div>
        ),
        false,
        t('gallery_settings')
      )}
    </>
  );

  return (
    <div className="flex items-center justify-between w-full bg-background/90 backdrop-blur-sm py-1.5 px-3 rounded-md z-10 shadow-sm border border-border/30 mb-2">
      {/* For source gallery (left), align controls left and count right */}
      {isSourceGallery ? (
        <>
          <div className="flex items-center gap-2">
            {controlButtons}
          </div>
          <div className="flex items-center gap-2">
            {selectionCountDisplay}
          </div>
        </>
      ) : (
        /* For destination gallery (right), align count left and controls right */
        <>
          <div className="flex items-center gap-2">
            {selectionCountDisplay}
          </div>
          <div className="flex items-center gap-2">
            {controlButtons}
          </div>
        </>
      )}
    </div>
  );
};

export default GalleryToolbar;
