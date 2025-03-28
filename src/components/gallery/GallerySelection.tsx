import { useState } from 'react';

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
    console.log(`Selecting item: ${id}, extend: ${extendSelection}`);
    
    // If Shift key is used to extend selection
    if (extendSelection && lastSelectedId && selectionMode === 'multiple') {
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
        
        // Add all items in the range
        idsToSelect.forEach(mediaId => {
          if (!newSelection.has(mediaId)) {
            newSelection.add(mediaId);
            onSelectId(mediaId); // Inform parent of each newly selected item
          }
        });
      }
    } 
    // Single selection mode - only one item can be selected at a time
    else if (selectionMode === 'single') {
      // If clicked on already selected item, deselect it
      if (selectedIds.includes(id)) {
        onSelectId(id);
      } 
      // Otherwise deselect all and select the new item
      else {
        selectedIds.forEach(selectedId => {
          if (selectedId !== id) {
            onSelectId(selectedId);
          }
        });
        onSelectId(id);
      }
    }
    // If multiple items are already selected, or we click on an already selected item
    else {
      // Toggle the selection of this item
      onSelectId(id);
    }
    
    // Keep track of the last selected item for Shift functionality
    setLastSelectedId(id);
  };

  const handleSelectAll = () => {
    // Select all media
    mediaIds.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectId(id);
      }
    });
  };

  const handleDeselectAll = () => {
    // Deselect all media
    selectedIds.forEach(id => onSelectId(id));
  };

  const toggleSelectionMode = () => {
    // Clear selection when toggling modes
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
