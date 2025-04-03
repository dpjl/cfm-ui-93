
import React, { useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import GalleryContent from '@/components/gallery/GalleryContent';
import { ViewModeType, GalleryViewMode } from '@/types/gallery';
import { useGalleryQuery } from '@/hooks/use-gallery-query';
import { MediaFilter } from '@/components/AppSidebar';
import { BaseGalleryProps } from '@/types/gallery-props';
import { useGallerySync } from '@/hooks/use-gallery-sync';

interface GalleriesViewProps extends BaseGalleryProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onColumnsChange: (side: 'left' | 'right', count: number) => void;
  mobileViewMode: GalleryViewMode;
  onToggleFullView: (side: 'left' | 'right') => void;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
  handleDelete: () => void;
}

const GalleriesView = ({
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  columnsCountLeft,
  columnsCountRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  deleteDialogOpen,
  setDeleteDialogOpen,
  activeSide,
  deleteMutation,
  handleDeleteSelected,
  handleDelete,
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange,
  mobileViewMode,
  onToggleFullView,
  leftFilter,
  rightFilter
}: GalleriesViewProps) => {
  // Références pour les grilles
  const leftGridRef = useRef<FixedSizeGrid>(null);
  const rightGridRef = useRef<FixedSizeGrid>(null);
  
  // Requêtes pour les données des galeries
  const { data: mediaLeft, isLoading: isLoadingLeft, isError: isErrorLeft, error: errorLeft } = 
    useGalleryQuery(selectedDirectoryIdLeft, leftFilter);
    
  const { data: mediaRight, isLoading: isLoadingRight, isError: isErrorRight, error: errorRight } = 
    useGalleryQuery(selectedDirectoryIdRight, rightFilter);

  // Hook de synchronisation des galeries
  const { isSyncEnabled, toggleSync, handleLeftScroll, handleRightScroll } = useGallerySync({
    leftGridRef,
    rightGridRef,
    leftMediaResponse: mediaLeft,
    rightMediaResponse: mediaRight,
    columnsCountLeft,
    columnsCountRight
  });

  // Helper function to wrap setSelectedIds to match expected onSelectId signature
  const handleSelectIdLeft = (id: string) => {
    setSelectedIdsLeft((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectIdRight = (id: string) => {
    setSelectedIdsRight((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="flex flex-1 h-full">
      {/* Bouton de synchronisation */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={toggleSync}
          className={`p-2 rounded-full ${isSyncEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} shadow-md transition-colors`}
          title={isSyncEnabled ? "Désactiver la synchronisation par mois" : "Activer la synchronisation par mois"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
      </div>
      
      {/* Galerie gauche */}
      <div className={`h-full ${mobileViewMode === 'right' ? 'hidden md:block' : ''} ${mobileViewMode === 'both' ? 'w-1/2' : 'flex-1'}`}>
        <GalleryContent
          title="Source"
          mediaResponse={mediaLeft || { mediaIds: [], mediaDates: [] }}
          selectedIds={selectedIdsLeft}
          onSelectId={handleSelectIdLeft}
          isLoading={isLoadingLeft}
          isError={isErrorLeft}
          error={errorLeft}
          columnsCount={columnsCountLeft}
          viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
          onPreviewItem={(id) => console.log("Preview left:", id)}
          onDeleteSelected={() => handleDeleteSelected('left')}
          filter={leftFilter}
          position="source"
          onToggleSidebar={onToggleLeftPanel}
          onColumnsChange={(count) => onColumnsChange('left', count)}
          mobileViewMode={mobileViewMode}
          onToggleFullView={() => onToggleFullView('left')}
          gridRef={leftGridRef}
          onScroll={handleLeftScroll}
        />
      </div>
      
      {/* Séparateur central (visible uniquement en mode double vue) */}
      {mobileViewMode === 'both' && (
        <div className="w-1 bg-muted-foreground/10" />
      )}
      
      {/* Galerie droite */}
      <div className={`h-full ${mobileViewMode === 'left' ? 'hidden md:block' : ''} ${mobileViewMode === 'both' ? 'w-1/2' : 'flex-1'}`}>
        <GalleryContent 
          title="Destination"
          mediaResponse={mediaRight || { mediaIds: [], mediaDates: [] }}
          selectedIds={selectedIdsRight}
          onSelectId={handleSelectIdRight}
          isLoading={isLoadingRight}
          isError={isErrorRight}
          error={errorRight}
          columnsCount={columnsCountRight}
          viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
          onPreviewItem={(id) => console.log("Preview right:", id)}
          onDeleteSelected={() => handleDeleteSelected('right')}
          filter={rightFilter}
          position="destination" 
          onToggleSidebar={onToggleRightPanel}
          onColumnsChange={(count) => onColumnsChange('right', count)}
          mobileViewMode={mobileViewMode}
          onToggleFullView={() => onToggleFullView('right')}
          gridRef={rightGridRef}
          onScroll={handleRightScroll}
        />
      </div>
    </div>
  );
};

export default GalleriesView;
