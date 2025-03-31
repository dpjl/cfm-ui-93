import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { useGalleryActions } from '@/hooks/use-gallery-actions';
import { useUIState } from '@/hooks/use-ui-state';
import { useGallerySelection } from '@/hooks/use-gallery-selection';
import GalleriesContainer from './GalleriesContainer';

const GalleryLayout: React.FC = () => {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [columnsCountLeft, setColumnsCountLeft] = useState(3);
  const [columnsCountRight, setColumnsCountRight] = useState(3);
  const selectedDirectoryIdLeftParam = searchParams.get('selectedDirectoryIdLeft') || 'photos-left';
  const selectedDirectoryIdRightParam = searchParams.get('selectedDirectoryIdRight') || 'photos-right';
  const [selectedDirectoryIdLeft, setSelectedDirectoryIdLeft] = useState(selectedDirectoryIdLeftParam);
  const [selectedDirectoryIdRight, setSelectedDirectoryIdRight] = useState(selectedDirectoryIdRightParam);
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    viewMode,
    setViewMode,
    leftFilter,
    rightFilter,
    toggleLeftPanel,
    toggleRightPanel,
  } = useUIState();
  const {
    selectedIdsLeft,
    setSelectedIdsLeft,
    selectedIdsRight,
    setSelectedIdsRight,
    activeSide,
    setActiveSide,
  } = useGallerySelection();
  const {
    deleteMutation,
    handleRefresh,
    handleDeleteSelected,
    handleDelete
  } = useGalleryActions(
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    setDeleteDialogOpen,
    setSelectedIdsLeft,
    setSelectedIdsRight,
    setActiveSide
  );

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
      handleDelete={handleDelete} // Ajout de handleDelete ici
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
