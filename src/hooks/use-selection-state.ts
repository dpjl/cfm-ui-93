import { useState } from 'react';

export type SelectionMode = 'single' | 'multiple';

/**
 * Hook to manage selection state
 */
export function useSelectionState(initialSelectionMode: SelectionMode = 'single') {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  
  const toggleSelectionMode = () => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // When switching from multiple to single with more than one selection,
      // keep only the last selected item
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
