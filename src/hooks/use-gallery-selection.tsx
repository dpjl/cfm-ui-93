
import { useState, useCallback } from 'react';

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
  initialSelectionMode = 'single'
}: UseGallerySelectionProps) {
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);

  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    console.log(`Selecting item: ${id}, extend: ${extendSelection}, mode: ${selectionMode}`);
    
    // Si nous sommes en mode de sélection unique et que l'extension n'est pas forcée
    if (selectionMode === 'single' && !extendSelection) {
      // Si l'élément est déjà sélectionné, le déselectionner
      if (selectedIds.includes(id)) {
        onSelectId(id);
      } 
      // Sinon, désélectionner tout et sélectionner cet élément
      else {
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            onSelectId(selectedId);
          }
        });
        onSelectId(id);
      }
    }
    // Si nous sommes en mode de sélection multiple ou que l'extension est forcée
    else {
      // Si Shift est utilisé pour étendre la sélection
      if (extendSelection && lastSelectedId) {
        // Trouver les indices
        const lastIndex = mediaIds.indexOf(lastSelectedId);
        const currentIndex = mediaIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          // Définir la plage de sélection
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Sélectionner tous les éléments dans la plage
          const idsToSelect = mediaIds.slice(start, end + 1);
          
          // Créer un nouvel ensemble de sélection conservant les éléments déjà sélectionnés
          const newSelection = new Set([...selectedIds]);
          
          // Ajouter tous les éléments de la plage
          idsToSelect.forEach(mediaId => {
            if (!newSelection.has(mediaId)) {
              newSelection.add(mediaId);
              onSelectId(mediaId); // Informer le parent de chaque élément nouvellement sélectionné
            }
          });
        }
      } 
      // Basculer la sélection de cet élément en mode multiple
      else {
        onSelectId(id);
      }
    }
    
    // Garder une trace du dernier élément sélectionné pour la fonctionnalité Shift
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, onSelectId, selectionMode]);

  const handleSelectAll = useCallback(() => {
    // Select all media
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  }, [mediaIds, selectedIds, onSelectId]);

  const handleDeselectAll = useCallback(() => {
    // Deselect all media
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => prev === 'single' ? 'multiple' : 'single');
    // Lorsque nous passons de multiple à unique, désélectionner tous les éléments sauf le dernier
    if (selectionMode === 'multiple' && selectedIds.length > 1) {
      const lastIndex = selectedIds.length - 1;
      const keepId = selectedIds[lastIndex];
      selectedIds.forEach((id, index) => {
        if (index !== lastIndex) {
          onSelectId(id);
        }
      });
      // Si aucun élément n'était sélectionné, ne rien faire
      if (selectedIds.length === 0) {
        return;
      }
      // Si le dernier élément sélectionné n'était pas déjà sélectionné, le sélectionner
      if (!selectedIds.includes(keepId)) {
        onSelectId(keepId);
      }
    }
  }, [selectionMode, selectedIds, onSelectId]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode
  };
}
