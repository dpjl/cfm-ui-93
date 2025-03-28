import { useState, useCallback, useMemo, useRef } from 'react';

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
  const processingBatchRef = useRef(false);

  // More optimized selection handler with useCallback to maintain reference stability
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    // If we're already processing a batch selection, don't start another one
    if (processingBatchRef.current && extendSelection) return;

    // For single selection mode and not forcing extension
    if (selectionMode === 'single' && !extendSelection) {
      // If the item is already selected, deselect it
      if (selectedIds.includes(id)) {
        onSelectId(id);
      } 
      // Otherwise, deselect all others and select this item
      else {
        // Create a local cache of currently selected IDs to avoid multiple state updates
        const currentSelected = [...selectedIds];
        // Only deselect others if we have multiple items selected
        if (currentSelected.length > 0) {
          processingBatchRef.current = true;
          currentSelected.forEach(selectedId => {
            if (selectedId !== id) {
              onSelectId(selectedId);
            }
          });
          processingBatchRef.current = false;
        }
        // Select the new item
        onSelectId(id);
      }
    }
    // For multiple selection mode or if extension is forced
    else {
      // If Shift is used to extend selection
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
          
          // Create a new selection set keeping already selected items
          const newSelection = new Set([...selectedIds]);
          
          // Process as a batch operation
          processingBatchRef.current = true;
          
          // Add all items in the range
          idsToSelect.forEach(mediaId => {
            if (!newSelection.has(mediaId)) {
              newSelection.add(mediaId);
              onSelectId(mediaId); // Inform parent of each newly selected item
            }
          });
          
          processingBatchRef.current = false;
        }
      } 
      // Toggle the selection of this item in multiple mode
      else {
        onSelectId(id);
      }
    }
    
    // Keep track of the last selected item for Shift functionality
    setLastSelectedId(id);
  }, [mediaIds, selectedIds, onSelectId, selectionMode, lastSelectedId]);

  // Optimized select all handler
  const handleSelectAll = useCallback(() => {
    // Create set of currently selected IDs for faster lookup
    const selectedIdSet = new Set(selectedIds);
    
    // Process as a batch operation
    processingBatchRef.current = true;
    
    // Select all media not already selected
    mediaIds.forEach(id => {
      if (!selectedIdSet.has(id)) {
        onSelectId(id);
      }
    });
    
    processingBatchRef.current = false;
  }, [mediaIds, selectedIds, onSelectId]);

  // Optimized deselect all handler
  const handleDeselectAll = useCallback(() => {
    // Process as a batch operation
    processingBatchRef.current = true;
    
    // Deselect all media
    selectedIds.forEach(id => onSelectId(id));
    
    processingBatchRef.current = false;
  }, [selectedIds, onSelectId]);

  // Optimized selection mode toggle
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // When switching from multiple to single, deselect all items except the last
      if (prev === 'multiple' && selectedIds.length > 1) {
        const lastIndex = selectedIds.length - 1;
        const keepId = selectedIds[lastIndex];
        
        // Process as a batch operation
        processingBatchRef.current = true;
        
        selectedIds.forEach((id, index) => {
          if (index !== lastIndex) {
            onSelectId(id);
          }
        });
        
        processingBatchRef.current = false;
        
        // If no item was selected, do nothing
        if (selectedIds.length === 0) {
          return newMode;
        }
        // If the last selected item wasn't already selected, select it
        if (!selectedIds.includes(keepId)) {
          onSelectId(keepId);
        }
      }
      
      return newMode;
    });
  }, [selectedIds, onSelectId]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode
  };
}
