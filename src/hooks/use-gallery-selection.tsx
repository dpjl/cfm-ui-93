
import React, { useCallback } from 'react';
import { useSelectionState, SelectionMode } from './use-selection-state';
import { useSelectionHandlers } from './use-selection-handlers';

// Export SelectionMode from this file as well
export { SelectionMode };

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  initialSelectionMode?: SelectionMode;
}

/**
 * Refactored hook to manage gallery selection with improved structure
 */
export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId,
  initialSelectionMode = 'single'
}: UseGallerySelectionProps) {
  // Create a selection handler that interfaces with the parent component
  const handleSelectChange = useCallback((id: string) => {
    onSelectId(id);
  }, [onSelectId]);

  // Use selection state from refactored hook
  const {
    lastSelectedId,
    setLastSelectedId,
    selectionMode,
    toggleSelectionMode
  } = useSelectionState(initialSelectionMode);

  // Use selection handlers from refactored hook
  const {
    handleSelectItem: baseHandleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    preventResetRef
  } = useSelectionHandlers({
    mediaIds,
    selectedIds,
    setSelectedIds: () => {}, // We don't manage the state here, but in the parent
    lastSelectedId,
    setLastSelectedId,
    selectionMode
  });

  // Create a wrapped handler that calls onSelectId for each selection change
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    if (extendSelection && lastSelectedId && selectionMode === 'multiple') {
      // For range selection with shift key
      const lastIndex = mediaIds.indexOf(lastSelectedId);
      const currentIndex = mediaIds.indexOf(id);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const idsToSelect = mediaIds.slice(start, end + 1);
        
        // Call onSelectId for each id in the range that needs its selection toggled
        idsToSelect.forEach(mediaId => {
          if (!selectedIds.includes(mediaId)) {
            handleSelectChange(mediaId);
          }
        });
      }
    } else if (selectionMode === 'single') {
      // For single selection mode
      if (selectedIds.includes(id)) {
        // Deselect the item
        handleSelectChange(id);
      } else {
        // Deselect all others first
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            handleSelectChange(selectedId);
          }
        });
        // Then select the new item
        handleSelectChange(id);
      }
    } else {
      // For multiple selection mode (toggle)
      handleSelectChange(id);
    }
    
    // Keep track of last selected for shift functionality
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, selectionMode, lastSelectedId, setLastSelectedId, handleSelectChange]);

  // Wrap selectAll to call onSelectId for each new selection
  const wrappedSelectAll = useCallback(() => {
    if (mediaIds.length > 100) {
      console.warn("Too many items to select (>100)");
      return;
    }
    
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        handleSelectChange(id);
      }
    });
  }, [mediaIds, selectedIds, handleSelectChange]);

  // Wrap deselectAll to call onSelectId for each deselection
  const wrappedDeselectAll = useCallback(() => {
    selectedIds.forEach(id => handleSelectChange(id));
  }, [selectedIds, handleSelectChange]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll: wrappedSelectAll,
    handleDeselectAll: wrappedDeselectAll,
    toggleSelectionMode,
    preventResetRef
  };
}
