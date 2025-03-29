
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMediaIds } from '@/api/imageApi';
import { useSelectionState } from '@/hooks/use-selection-state';
import { useGalleryActions } from '@/hooks/use-gallery-actions';
import GalleryContent from './GalleryContent';
import GallerySelectionBar from './GallerySelectionBar';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface GalleryProps {
  directory: 'source' | 'destination';
  title: string;
}

const Gallery: React.FC<GalleryProps> = ({ directory, title }) => {
  const {
    data: mediaIds = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['mediaIds', directory],
    queryFn: () => getMediaIds(directory),
  });

  const { 
    selectedIds, 
    isSelecting, 
    toggleSelection, 
    clearSelection, 
    toggleSelectionMode 
  } = useSelectionState();

  const {
    isDeleteDialogOpen,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteConfirm,
  } = useGalleryActions(directory, selectedIds, clearSelection, () => refetch());

  // Clear selection when directory changes
  useEffect(() => {
    clearSelection();
  }, [directory, clearSelection]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <GalleryContent
        title={title}
        mediaIds={mediaIds}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isSelecting={isSelecting}
        selectedIds={selectedIds}
        onToggleSelection={toggleSelection}
        onToggleSelectionMode={toggleSelectionMode}
      />

      {isSelecting && selectedIds.length > 0 && (
        <GallerySelectionBar
          selectedCount={selectedIds.length}
          onDeselectAll={clearSelection}
          onDelete={handleOpenDeleteDialog}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteConfirm}
        selectedCount={selectedIds.length}
      />
    </div>
  );
};

export default Gallery;
