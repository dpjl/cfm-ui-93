
import { useState, useCallback } from 'react';

interface UseGalleryPreviewHandlerProps {
  mediaIds: string[];
  onPreviewMedia?: (id: string) => void;
}

/**
 * Hook simplifié pour la prévisualisation des médias
 */
export function useGalleryPreviewHandler({
  mediaIds,
  onPreviewMedia
}: UseGalleryPreviewHandlerProps) {
  const [previewMediaId, setPreviewMediaId] = useState<string | null>(null);

  const handleOpenPreview = useCallback((id: string) => {
    setPreviewMediaId(id);
    if (onPreviewMedia) {
      onPreviewMedia(id);
    }
  }, [onPreviewMedia]);
  
  const handleClosePreview = useCallback(() => {
    setPreviewMediaId(null);
  }, []);
  
  const handleNavigatePreview = useCallback((direction: 'prev' | 'next') => {
    if (!previewMediaId || mediaIds.length === 0) return;
    
    const currentIndex = mediaIds.indexOf(previewMediaId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + mediaIds.length) % mediaIds.length;
    } else {
      newIndex = (currentIndex + 1) % mediaIds.length;
    }
    
    setPreviewMediaId(mediaIds[newIndex]);
    if (onPreviewMedia) {
      onPreviewMedia(mediaIds[newIndex]);
    }
  }, [previewMediaId, mediaIds, onPreviewMedia]);

  return {
    previewMediaId,
    handleOpenPreview,
    handleClosePreview,
    handleNavigatePreview
  };
}
