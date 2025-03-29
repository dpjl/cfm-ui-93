
import { useCallback, useState } from 'react';
import { SelectionMode } from '@/types/gallery';

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  initialSelectionMode?: SelectionMode;
}

/**
 * Hook simplifié pour la gestion de la sélection dans la galerie
 * Utilise une approche de délégation vers le parent plutôt que de gérer l'état en interne
 */
export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId,
  initialSelectionMode = 'multiple'
}: UseGallerySelectionProps) {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // Fonction de sélection d'un élément avec support Shift pour sélection multiple
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    if (extendSelection && lastSelectedId && selectionMode === 'multiple') {
      // Pour la sélection de plage avec la touche Shift
      const lastIndex = mediaIds.indexOf(lastSelectedId);
      const currentIndex = mediaIds.indexOf(id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        // Définir la plage de sélection
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const idsToSelect = mediaIds.slice(start, end + 1);
        
        // Sélectionner tous les éléments de la plage
        idsToSelect.forEach(mediaId => {
          if (!selectedIds.includes(mediaId)) {
            onSelectId(mediaId);
          }
        });
      }
    } else if (selectionMode === 'single') {
      // Mode sélection unique
      if (selectedIds.includes(id)) {
        // Désélectionner si déjà sélectionné
        onSelectId(id);
      } else {
        // Sinon désélectionner tous les autres et sélectionner celui-ci
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            onSelectId(selectedId);
          }
        });
        onSelectId(id);
      }
    } else {
      // Si plusieurs éléments sont déjà sélectionnés, ou si on clique sur un élément déjà sélectionné
      onSelectId(id);
    }
    
    // Garder une trace du dernier élément sélectionné pour la fonctionnalité Shift
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, onSelectId, lastSelectedId, selectionMode]);

  // Sélectionner tous les médias
  const handleSelectAll = useCallback(() => {
    // Limiter pour des raisons de performance
    if (mediaIds.length > 100) {
      console.warn("Trop d'éléments à sélectionner (>100)");
      return;
    }
    
    // Sélectionner tous les médias
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  }, [mediaIds, selectedIds, onSelectId]);

  // Désélectionner tous les médias
  const handleDeselectAll = useCallback(() => {
    // Désélectionner tous les médias
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);

  // Basculer entre les modes de sélection
  const toggleSelectionMode = useCallback(() => {
    // Effacer la sélection lors du basculement des modes
    if (selectedIds.length > 0) {
      handleDeselectAll();
    }
    setSelectionMode(prev => prev === 'single' ? 'multiple' : 'single');
  }, [selectedIds, handleDeselectAll]);

  return {
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    selectionMode,
    toggleSelectionMode
  };
}
