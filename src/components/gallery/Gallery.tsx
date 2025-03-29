
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

  // Use the basic selection state hooks
  const { 
    selectedIds, 
    setSelectedIds,
    selectionMode,
    toggleSelectionMode
  } = useSelectionState();
  
  // Simplified selection management
  const isSelecting = selectedIds.length > 0;
  
  const clearSelection = () => setSelectedIds([]);
  
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        // In single mode, replace the selection
        if (selectionMode === 'single') {
          return [id];
        }
        // In multiple mode, add to selection
        return [...prev, id];
      }
    });
  };

  const {
    isDeleteDialogOpen,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteConfirm,
  } = useGalleryActions(directory, selectedIds, clearSelection, () => refetch());

  // Clear selection when directory changes
  useEffect(() => {
    clearSelection();
  }, [directory]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <GalleryContent
        title={title}
        mediaIds={mediaIds}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedIds={selectedIds}
        onSelectId={toggleSelection}
        columnsCount={4} // Default value
        viewMode="single"
        onPreviewItem={() => {}} // Empty handler
        onDeleteSelected={handleOpenDeleteDialog}
        filter="all"
        position={directory}
      />

      {isSelecting && (
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
