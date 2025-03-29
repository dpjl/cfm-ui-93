
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteImages } from '@/api/imageApi';

export const useGalleryActions = (
  directory: 'source' | 'destination',
  selectedIds: string[],
  clearSelection: () => void,
  refetchMediaIds: () => void
) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) {
      toast.error('Aucun élément sélectionné');
      handleCloseDeleteDialog();
      return;
    }

    try {
      console.log(`Deleting ${selectedIds.length} items from ${directory} directory`);
      console.log('Selected IDs:', selectedIds);
      
      await deleteImages(directory, selectedIds);
      
      toast.success(`${selectedIds.length} élément${selectedIds.length > 1 ? 's' : ''} supprimé${selectedIds.length > 1 ? 's' : ''}`);
      clearSelection();
      refetchMediaIds();
    } catch (error) {
      console.error('Error deleting images:', error);
      toast.error('Erreur lors de la suppression des éléments');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return {
    isDeleteDialogOpen,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleDeleteConfirm,
  };
};
