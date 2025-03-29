
import { useState } from 'react';

export type SelectionMode = 'single' | 'multiple';

/**
 * Hook simplifié pour gérer l'état de sélection
 */
export function useSelectionState(initialSelectionMode: SelectionMode = 'single') {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  
  const toggleSelectionMode = () => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // Lorsqu'on passe du mode multiple à simple avec plusieurs sélections,
      // ne conserver que le dernier élément sélectionné
      if (prev === 'multiple' && selectedIds.length > 1) {
        const lastId = lastSelectedId || selectedIds[selectedIds.length - 1];
        setSelectedIds(lastId ? [lastId] : []);
      }
      
      return newMode;
    });
  };

  return {
    selectedIds,
    setSelectedIds,
    lastSelectedId,
    setLastSelectedId,
    selectionMode,
    setSelectionMode,
    toggleSelectionMode
  };
}
