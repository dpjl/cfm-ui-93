
import { useCallback } from 'react';
import { useGalleryContext } from '@/contexts/GalleryContext';

/**
 * Hook simplifié pour manipuler les médias dans la galerie
 */
export const useGalleryMediaHandler = (
  selectedIds: string[],
  position: 'source' | 'destination' = 'source'
) => {
  const { handleDownloadMedia, handleDownloadSelected } = useGalleryContext();

  // Wrapper autour de l'implémentation du context
  const downloadSelected = useCallback(async (ids: string[] = selectedIds): Promise<void> => {
    return handleDownloadSelected(ids, position);
  }, [selectedIds, position, handleDownloadSelected]);

  return {
    handleDownloadSelected: downloadSelected
  };
};
