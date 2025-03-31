
import React from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import SidePanel from '@/components/layout/SidePanel';
import GalleriesContainer from '@/components/layout/GalleriesContainer';
import AppSidebar from '@/components/AppSidebar';
import { GalleryViewMode } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import { useColumnsState } from '@/hooks/use-columns-state';
import { useGalleryContext } from '@/context/GalleryContext';

interface GalleryLayoutProps {
  // Directory selection
  selectedDirectoryIdLeft: string;
  setSelectedDirectoryIdLeft: (id: string) => void;
  selectedDirectoryIdRight: string;
  setSelectedDirectoryIdRight: (id: string) => void;
  
  // Column management
  columnsCountLeft: number;
  columnsCountRight: number;
  onLeftColumnsChange: (count: number) => void;
  onRightColumnsChange: (count: number) => void;
  
  // Selection state
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Dialog state
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSide: 'left' | 'right';
  deleteMutation: any;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  
  // Panel state - maintenant via contexte
  leftPanelOpen: boolean;
  toggleLeftPanel: () => void;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
  
  // View mode - maintenant via contexte
  viewMode: GalleryViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  
  // Filters - maintenant via contexte
  leftFilter: MediaFilter;
  setLeftFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
  rightFilter: MediaFilter;
  setRightFilter: React.Dispatch<React.SetStateAction<MediaFilter>>;
}

const GalleryLayout: React.FC<GalleryLayoutProps> = ({
  selectedDirectoryIdLeft,
  setSelectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  setSelectedDirectoryIdRight,
  columnsCountLeft,
  columnsCountRight,
  onLeftColumnsChange,
  onRightColumnsChange,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  deleteDialogOpen,
  setDeleteDialogOpen,
  activeSide,
  deleteMutation,
  handleDeleteSelected,
  leftPanelOpen,
  toggleLeftPanel,
  rightPanelOpen,
  toggleRightPanel,
  viewMode,
  setViewMode,
  leftFilter,
  setLeftFilter,
  rightFilter,
  setRightFilter
}) => {
  const isMobile = useIsMobile();
  const { getColumnValuesForSide, getViewModeType, updateColumnsCount } = useColumnsState();
  
  // Récupérer le type de vue actuel
  const currentViewMode = getViewModeType(isMobile, viewMode);
  
  // Force refresh du composant quand columnsCountLeft ou columnsCountRight changent
  // en mettant à jour d'abord l'état central
  React.useEffect(() => {
    updateColumnsCount('left', isMobile, viewMode, columnsCountLeft);
  }, [columnsCountLeft, isMobile, viewMode, updateColumnsCount]);
  
  React.useEffect(() => {
    updateColumnsCount('right', isMobile, viewMode, columnsCountRight);
  }, [columnsCountRight, isMobile, viewMode, updateColumnsCount]);
  
  // Récupérer les valeurs de colonnes à chaque rendu - maintenant réactif aux changements
  const leftColumnValues = getColumnValuesForSide('left');
  const rightColumnValues = getColumnValuesForSide('right');
  
  return (
    <div className="flex h-full overflow-hidden mt-2 relative">
      <SidePanel 
        position="left" 
        isOpen={leftPanelOpen} 
        onOpenChange={toggleLeftPanel}
        title="Source"
        viewMode={viewMode}
      >
        <AppSidebar
          selectedDirectoryId={selectedDirectoryIdLeft}
          onSelectDirectory={setSelectedDirectoryIdLeft}
          position="left"
          selectedFilter={leftFilter}
          onFilterChange={setLeftFilter}
          galleryViewMode={viewMode}
          onColumnsChange={onLeftColumnsChange}
          columnValues={leftColumnValues}
          currentViewMode={currentViewMode}
        />
      </SidePanel>

      <div className="flex-1 flex flex-col overflow-hidden">
        <GalleriesContainer 
          columnsCountLeft={columnsCountLeft}
          columnsCountRight={columnsCountRight}
          selectedIdsLeft={selectedIdsLeft}
          setSelectedIdsLeft={setSelectedIdsLeft}
          selectedIdsRight={selectedIdsRight}
          setSelectedIdsRight={setSelectedIdsRight}
          selectedDirectoryIdLeft={selectedDirectoryIdLeft}
          selectedDirectoryIdRight={selectedDirectoryIdRight}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          activeSide={activeSide}
          deleteMutation={deleteMutation}
          handleDeleteSelected={handleDeleteSelected}
          galleryViewMode={viewMode}
          setGalleryViewMode={setViewMode}
          leftFilter={leftFilter}
          rightFilter={rightFilter}
          onToggleLeftPanel={toggleLeftPanel}
          onToggleRightPanel={toggleRightPanel}
          onColumnsChange={(side, count) => {
            if (side === 'left') {
              onLeftColumnsChange(count);
            } else {
              onRightColumnsChange(count);
            }
          }}
        />
      </div>

      <SidePanel 
        position="right" 
        isOpen={rightPanelOpen} 
        onOpenChange={toggleRightPanel}
        title="Destination"
        viewMode={viewMode}
      >
        <AppSidebar
          selectedDirectoryId={selectedDirectoryIdRight}
          onSelectDirectory={setSelectedDirectoryIdRight}
          position="right"
          selectedFilter={rightFilter}
          onFilterChange={setRightFilter}
          galleryViewMode={viewMode}
          onColumnsChange={onRightColumnsChange}
          columnValues={rightColumnValues}
          currentViewMode={currentViewMode}
        />
      </SidePanel>
    </div>
  );
};

export default GalleryLayout;
