
import React, { useCallback } from 'react';
import { useGalleryContext } from '@/contexts/GalleryContext';

// Define the selection mode type
export type SelectionMode = 'single' | 'multiple';

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
}

/**
 * Hook amélioré pour la gestion de la sélection des médias
 * Version simplifiée qui réutilise la logique du contexte
 */
export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId
}: UseGallerySelectionProps) {
  const { selectionMode, toggleSelectionMode } = useGalleryContext();
  
  // Handle selecting an item with potential range selection
  const handleSelectItem = useCallback((id: string, extendSelection: boolean = false) => {
    onSelectId(id);
  }, [onSelectId]);

  // Handle select all functionality
  const handleSelectAll = useCallback(() => {
    // Performance limit check
    if (mediaIds.length > 100) {
      console.warn("Too many items to select (>100)");
      return;
    }
    
    // Add all mediaIds to the selection
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  }, [mediaIds, selectedIds, onSelectId]);

  // Handle deselect all functionality
  const handleDeselectAll = useCallback(() => {
    // Deselect all media
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode,
    preventResetRef: { current: false }
  };
}
