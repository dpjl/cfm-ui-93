
import { useGalleryContext } from '@/contexts/GalleryContext';

/**
 * Hook simplifié pour les actions sur la galerie
 */
export function useGalleryActions() {
  const { 
    handleRefresh, 
    handleDeleteSelected, 
    handleDelete,
    deleteMutation,
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    setDeleteDialogOpen
  } = useGalleryContext();
  
  return {
    deleteMutation,
    handleRefresh,
    handleDeleteSelected,
    handleDelete,
    selectedIdsLeft,
    selectedIdsRight,
    activeSide,
    setDeleteDialogOpen
  };
}
