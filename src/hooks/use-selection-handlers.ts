import { useCallback, useRef } from 'react';
import { SelectionMode } from './use-selection-state';

interface UseSelectionHandlersProps {
  mediaIds: string[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  lastSelectedId: string | null;
  setLastSelectedId: (id: string | null) => void;
  selectionMode: SelectionMode;
}

/**
 * Hook to manage selection handlers
 */
export function useSelectionHandlers({
  mediaIds,
  selectedIds,
  setSelectedIds,
  lastSelectedId,
  setLastSelectedId,
  selectionMode
}: UseSelectionHandlersProps) {
  const processingBatchRef = useRef(false);
  const preventResetRef = useRef<boolean>(true);
  
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    // Prevent resets during selection changes
    preventResetRef.current = true;
    
    // Don't start another batch selection if we're already processing one
    if (processingBatchRef.current && extendSelection) return;
    
    // For single selection mode and no forced extension
    if (selectionMode === 'single' && !extendSelection) {
      // If item is already selected, deselect it
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } 
      // Otherwise, deselect others and select this one
      else {
        setSelectedIds([id]);
      }
    }
    // For multiple selection mode or if extension is forced
    else {
      // If Shift key is used to extend selection
      if (extendSelection && lastSelectedId) {
        // Find indices
        const lastIndex = mediaIds.indexOf(lastSelectedId);
        const currentIndex = mediaIds.indexOf(id);
        
        if (lastIndex !== -1 && currentIndex !== -1) {
          // Define selection range
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          
          // Select all items in the range
          const idsToSelect = mediaIds.slice(start, end + 1);
          
          processingBatchRef.current = true;
          
          // Add all items in range to the selection
          const newSelection = new Set([...selectedIds]);
          idsToSelect.forEach(mediaId => {
            if (!newSelection.has(mediaId)) {
              newSelection.add(mediaId);
            }
          });
          
          setSelectedIds(Array.from(newSelection));
          processingBatchRef.current = false;
        }
      } 
      // Toggle selection of this item in multiple mode
      else {
        if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
          setSelectedIds([...selectedIds, id]);
        }
      }
    }
    
    // Keep track of the last selected item for Shift functionality
    setLastSelectedId(id);
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [mediaIds, selectedIds, setSelectedIds, selectionMode, lastSelectedId, setLastSelectedId]);

  const handleSelectAll = useCallback(() => {
    // Enable protection against resets
    preventResetRef.current = true;
    
    // Performance limit check
    if (mediaIds.length > 100) {
      console.warn("Too many items to select (>100)");
      return;
    }
    
    processingBatchRef.current = true;
    
    // Add all mediaIds to the selection
    const selectedIdSet = new Set(selectedIds);
    mediaIds.forEach(id => {
      if (!selectedIdSet.has(id)) {
        selectedIdSet.add(id);
      }
    });
    
    setSelectedIds(Array.from(selectedIdSet));
    processingBatchRef.current = false;
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [mediaIds, selectedIds, setSelectedIds]);

  const handleDeselectAll = useCallback(() => {
    // Enable protection against resets
    preventResetRef.current = true;
    
    // Deselect all media
    setSelectedIds([]);
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [setSelectedIds]);

  return {
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    preventResetRef
  };
}
