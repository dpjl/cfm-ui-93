
import { useState, useCallback, useRef, useEffect } from 'react';

export type SelectionMode = 'single' | 'multiple';

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  initialSelectionMode?: SelectionMode;
}

export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId,
  initialSelectionMode = 'multiple'
}: UseGallerySelectionProps) {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  
  // Fonction simplifiée de sélection d'élément
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    // Mode single - sélection simple
    if (selectionMode === 'single') {
      if (selectedIds.includes(id)) {
        onSelectId(id); // Désélectionner si déjà sélectionné
      } else {
        // Si d'autres éléments sont sélectionnés, les désélectionner
        if (selectedIds.length > 0) {
          selectedIds.forEach(selectedId => {
            if (selectedId !== id) {
              onSelectId(selectedId);
            }
          });
        }
        // Sélectionner le nouvel élément
        onSelectId(id);
      }
    }
    // Mode multiple ou sélection étendue
    else {
      // Sélection Shift pour plage
      if (extendSelection && lastSelectedId) {
        const lastIndex = mediaIds.indexOf(lastSelectedId);
        const currentIndex = mediaIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Sélectionner toute la plage
          for (let i = start; i <= end; i++) {
            const mediaId = mediaIds[i];
            if (!selectedIds.includes(mediaId)) {
              onSelectId(mediaId);
            }
          }
        }
      } 
      // Basculer un seul élément
      else {
        onSelectId(id);
      }
    }
    
    // Mémoriser le dernier élément sélectionné
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, onSelectId, selectionMode, lastSelectedId]);
  
  // Sélection complète simplifiée
  const handleSelectAll = useCallback(() => {
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  }, [mediaIds, selectedIds, onSelectId]);
  
  // Désélection simplifiée
  const handleDeselectAll = useCallback(() => {
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);
  
  // Changement de mode simplifié
  const toggleSelectionMode = useCallback(() => {
    // Désélectionner tous les éléments lors du changement de mode
    if (selectedIds.length > 0) {
      handleDeselectAll();
    }
    setSelectionMode(prev => prev === 'single' ? 'multiple' : 'single');
  }, [selectionMode, selectedIds, handleDeselectAll]);
  
  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode
  };
}
