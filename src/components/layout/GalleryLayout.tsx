
import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useGalleryActions } from '@/hooks/use-gallery-actions';
import { useUIState } from '@/hooks/use-ui-state';
import { useGalleryContext } from '@/contexts/GalleryContext';
import GalleriesContainer from './GalleriesContainer';

const GalleryLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [columnsCountLeft, setColumnsCountLeft] = useState(3);
  const [columnsCountRight, setColumnsCountRight] = useState(3);
  
  // Use the gallery context instead of individual hooks
  const {
    selectedDirectoryIdLeft,
    selectedDirectoryIdRight,
    selectedIdsLeft,
    setSelectedIdsLeft,
    selectedIdsRight,
    setSelectedIdsRight,
    activeSide,
    setActiveSide,
    viewMode,
    setViewMode,
    leftFilter,
    rightFilter,
    toggleLeftPanel,
    toggleRightPanel,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDelete,
    deleteMutation,
    handleDeleteSelected,
  } = useGalleryContext();

  const handleColumnsChange = useCallback((side: 'left' | 'right', count: number) => {
    if (side === 'left') {
      setColumnsCountLeft(count);
    } else {
      setColumnsCountRight(count);
    }
  }, []);

  return (
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
      handleDelete={handleDelete}
      mobileViewMode={viewMode}
      setMobileViewMode={setViewMode}
      leftFilter={leftFilter}
      rightFilter={rightFilter}
      onToggleLeftPanel={toggleLeftPanel}
      onToggleRightPanel={toggleRightPanel}
      onColumnsChange={handleColumnsChange}
    />
  );
};

export default GalleryLayout;
