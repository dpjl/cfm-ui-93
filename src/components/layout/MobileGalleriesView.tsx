import React from 'react';
import GalleryContainer from '@/components/GalleryContainer';
import { MobileViewMode } from '@/types/gallery';
import MobileViewSwitcher from './MobileViewSwitcher';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { BaseGalleryProps, SidebarToggleProps } from '@/types/gallery-props';

interface MobileGalleriesViewProps extends BaseGalleryProps, SidebarToggleProps {
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
}

const MobileGalleriesView: React.FC<MobileGalleriesViewProps> = ({
  columnsCountLeft,
  columnsCountRight,
  mobileViewMode,
  setMobileViewMode,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  handleDeleteSelected,
  deleteDialogOpen,
  activeSide,
  setDeleteDialogOpen,
  deleteMutation,
  leftFilter = 'all',
  rightFilter = 'all',
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  const leftGalleryProps = {
    title: "Left Gallery",
    directory: selectedDirectoryIdLeft,
    position: 'left' as const,
    columnsCount: columnsCountLeft,
    selectedIds: selectedIdsLeft,
    setSelectedIds: setSelectedIdsLeft,
    onDeleteSelected: () => handleDeleteSelected('left'),
    deleteDialogOpen: deleteDialogOpen && activeSide === 'left',
    setDeleteDialogOpen,
    deleteMutation,
    hideHeader: true,
    filter: leftFilter,
    hideMobileColumns: true
  };

  const rightGalleryProps = {
    title: "Right Gallery",
    directory: selectedDirectoryIdRight,
    position: 'right' as const,
    columnsCount: columnsCountRight,
    selectedIds: selectedIdsRight,
    setSelectedIds: setSelectedIdsRight,
    onDeleteSelected: () => handleDeleteSelected('right'),
    deleteDialogOpen: deleteDialogOpen && activeSide === 'right',
    setDeleteDialogOpen,
    deleteMutation,
    hideHeader: true,
    filter: rightFilter,
    hideMobileColumns: true
  };

  return (
    <div className="flex-1 overflow-hidden h-full relative">
      <div className="h-full bg-background rounded-lg border-2 border-border/40 shadow-sm">
        <div className="h-full flex flex-row relative">
          <div 
            className={`h-full ${
              mobileViewMode === 'both' ? 'w-1/2 relative' : 
              mobileViewMode === 'left' ? 'w-full relative z-10' : 
              'w-0 absolute opacity-0 pointer-events-none'
            }`}
            style={{
              transition: 'width 200ms ease-out',
              background: 'var(--background)'
            }}
          >
            {(mobileViewMode === 'both' || mobileViewMode === 'left') && (
              <GalleryContainer 
                {...leftGalleryProps}
                viewMode={mobileViewMode === 'left' ? 'single' : 'split'}
              />
            )}
          </div>
          
          {mobileViewMode === 'both' && (
            <Separator orientation="vertical" className="bg-border/60" />
          )}
          
          <div 
            className={`h-full ${
              mobileViewMode === 'both' ? 'w-1/2 relative' : 
              mobileViewMode === 'right' ? 'w-full relative z-10' : 
              'w-0 absolute opacity-0 pointer-events-none'
            }`}
            style={{
              transition: 'width 200ms ease-out',
              background: 'var(--background)'
            }}
          >
            {(mobileViewMode === 'both' || mobileViewMode === 'right') && (
              <GalleryContainer 
                {...rightGalleryProps}
                viewMode={mobileViewMode === 'right' ? 'single' : 'split'}
              />
            )}
          </div>
        </div>
      </div>
      
      <MobileControls 
        mobileViewMode={mobileViewMode}
        setMobileViewMode={setMobileViewMode}
        onToggleLeftPanel={onToggleLeftPanel}
        onToggleRightPanel={onToggleRightPanel}
      />
    </div>
  );
};

interface MobileControlsProps {
  mobileViewMode: MobileViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<MobileViewMode>>;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  mobileViewMode,
  setMobileViewMode,
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  const showLeftPanelToggle = mobileViewMode === 'both' || mobileViewMode === 'left';
  const showRightPanelToggle = mobileViewMode === 'both' || mobileViewMode === 'right';
  
  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-20">
      {showLeftPanelToggle ? (
        <Button 
          variant="secondary" 
          size="icon"
          className="rounded-full shadow-md h-10 w-10"
          onClick={onToggleLeftPanel}
        >
          <div className="flex items-center justify-center">
            <Settings className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -mr-0.5" />
          </div>
        </Button>
      ) : (
        <div className="h-10 w-10 opacity-0"></div>
      )}
      
      <MobileViewSwitcher 
        viewMode={mobileViewMode}
        setViewMode={setMobileViewMode}
      />
      
      {showRightPanelToggle ? (
        <Button 
          variant="secondary" 
          size="icon"
          className="rounded-full shadow-md h-10 w-10"
          onClick={onToggleRightPanel}
        >
          <div className="flex items-center justify-center">
            <ChevronLeft className="h-4 w-4 -ml-0.5" />
            <Settings className="h-4 w-4" />
          </div>
        </Button>
      ) : (
        <div className="h-10 w-10 opacity-0"></div>
      )}
    </div>
  );
};

export default MobileGalleriesView;
