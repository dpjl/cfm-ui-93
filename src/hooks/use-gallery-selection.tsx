import React, { useState, useCallback, useRef } from 'react';

// Define the selection mode type
export type SelectionMode = 'single' | 'multiple';

interface UseGallerySelectionProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  initialSelectionMode?: SelectionMode;
}

/**
 * Unified hook for gallery selection management
 * Consolidates the functionality from multiple selection-related hooks
 */
export function useGallerySelection({
  mediaIds,
  selectedIds,
  onSelectId,
  initialSelectionMode = 'single'
}: UseGallerySelectionProps) {
  // Selection state management
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(initialSelectionMode);
  
  // Refs for preventing unwanted behavior
  const processingBatchRef = useRef(false);
  const preventResetRef = useRef<boolean>(true);
  
  // Create a selection handler that interfaces with the parent component
  const handleSelectChange = useCallback((id: string) => {
    onSelectId(id);
  }, [onSelectId]);

  // Handle selecting an item with potential range selection
  const handleSelectItem = useCallback((id: string, extendSelection: boolean = false) => {
    // Prevent resets during selection changes
    preventResetRef.current = true;
    
    // Don't start another batch selection if we're already processing one
    if (processingBatchRef.current && extendSelection) return;
    
    // For single selection mode
    if (selectionMode === 'single') {
      // If item is already selected, deselect it
      if (selectedIds.includes(id)) {
        handleSelectChange(id);
      } 
      // Otherwise, deselect all others and select this one
      else {
        // Deselect all other items first
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            handleSelectChange(selectedId);
          }
        });
        // Then select the new item
        handleSelectChange(id);
      }
    }
    // For multiple selection mode
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
          idsToSelect.forEach(mediaId => {
            if (!selectedIds.includes(mediaId)) {
              handleSelectChange(mediaId);
            }
          });
          
          processingBatchRef.current = false;
        }
      } 
      // Toggle selection of this item in multiple mode
      else {
        handleSelectChange(id);
      }
    }
    
    // Keep track of the last selected item for Shift functionality
    setLastSelectedId(id);
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [mediaIds, selectedIds, handleSelectChange, selectionMode, lastSelectedId]);

  // Handle select all functionality
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
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        handleSelectChange(id);
      }
    });
    
    processingBatchRef.current = false;
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [mediaIds, selectedIds, handleSelectChange]);

  // Handle deselect all functionality
  const handleDeselectAll = useCallback(() => {
    // Enable protection against resets
    preventResetRef.current = true;
    
    // Deselect all media
    selectedIds.forEach(id => handleSelectChange(id));
    
    // Re-enable resets after a short delay
    setTimeout(() => {
      preventResetRef.current = false;
    }, 100);
  }, [selectedIds, handleSelectChange]);

  // Toggle between single and multiple selection modes
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multiple' : 'single';
      
      // When switching from multiple to single with more than one selection,
      // keep only the last selected item
      if (prev === 'multiple' && selectedIds.length > 1) {
        const lastId = lastSelectedId || selectedIds[selectedIds.length - 1];
        if (lastId) {
          // Deselect all except the last selected
          selectedIds.forEach(id => {
            if (id !== lastId && selectedIds.includes(id)) {
              handleSelectChange(id);
            }
          });
        }
      }
      
      return newMode;
    });
  }, [selectedIds, lastSelectedId, handleSelectChange]);

  return {
    selectionMode,
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    toggleSelectionMode,
    preventResetRef
  };
}
