
import { useState, useEffect } from 'react';

export type SelectionMode = 'single' | 'multiple';

export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId
}: {
  mediaIds: string[],
  selectedIds: string[],
  onSelectId: (id: string) => void
}) {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('multiple');

  const handleSelectItem = (id: string, extendSelection: boolean) => {
    // Si Shift key est utilisée pour étendre la sélection
    if (extendSelection && lastSelectedId && selectionMode === 'multiple') {
      // Trouver les indices
      const lastIndex = mediaIds.indexOf(lastSelectedId);
      const currentIndex = mediaIds.indexOf(id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        // Définir la plage de sélection
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        
        // Sélectionner tous les éléments dans la plage
        for (let i = start; i <= end; i++) {
          const mediaId = mediaIds[i];
          if (!selectedIds.includes(mediaId)) {
            onSelectId(mediaId);
          }
        }
      }
    } 
    // Mode de sélection unique - un seul élément peut être sélectionné à la fois
    else if (selectionMode === 'single') {
      // Si on clique sur un élément déjà sélectionné, le désélectionner
      if (selectedIds.includes(id)) {
        onSelectId(id);
      } 
      // Sinon, désélectionner tout et sélectionner le nouvel élément
      else {
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            onSelectId(selectedId);
          }
        });
        onSelectId(id);
      }
    }
    // Si plusieurs éléments sont déjà sélectionnés, ou on clique sur un élément déjà sélectionné
    else {
      // Basculer la sélection de cet élément
      onSelectId(id);
    }
    
    // Garder une trace du dernier élément sélectionné pour la fonctionnalité Shift
    setLastSelectedId(id);
  };

  const handleSelectAll = () => {
    // Sélectionner tous les médias
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  };

  const handleDeselectAll = () => {
    // Désélectionner tous les médias
    selectedIds.forEach(id => onSelectId(id));
  };

  const toggleSelectionMode = () => {
    // Effacer la sélection lors du basculement des modes
    if (selectedIds.length > 0) {
      handleDeselectAll();
    }
    setSelectionMode(prev => prev === 'single' ? 'multiple' : 'single');
  };

  return {
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    selectionMode,
    toggleSelectionMode
  };
}
