
import { useRef, useEffect, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';

export function useGalleryMediaTracking(
  mediaIds: string[],
  selectedIds: string[],
  gridRef: React.RefObject<FixedSizeGrid>
) {
  const prevMediaIdsRef = useRef<string[]>(mediaIds);
  const prevSelectedIdsRef = useRef<string[]>(selectedIds);
  const scrollPositionRef = useRef(0);

  // Update cell selection states
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Find IDs with changed selection state
    const prevSelectedSet = new Set(prevSelectedIdsRef.current);
    const currentSelectedSet = new Set(selectedIds);
    
    const changedIds = mediaIds.filter(id => 
      (prevSelectedSet.has(id) && !currentSelectedSet.has(id)) || 
      (!prevSelectedSet.has(id) && currentSelectedSet.has(id))
    );
    
    // Update reference for next comparison
    prevSelectedIdsRef.current = [...selectedIds];
    
    // If selections changed, force grid update without resetting scroll
    if (changedIds.length > 0 && gridRef.current) {
      gridRef.current.forceUpdate();
    }
  }, [selectedIds, mediaIds, gridRef]);

  // Track media ID changes
  useEffect(() => {
    // Check if media IDs have significantly changed
    if (Math.abs(prevMediaIdsRef.current.length - mediaIds.length) > 5) {
      // Save current reference
      prevMediaIdsRef.current = mediaIds;
      
      // Check if this is a completely different set of IDs
      const intersection = mediaIds.filter(id => prevMediaIdsRef.current.includes(id));
      if (intersection.length < Math.min(mediaIds.length, prevMediaIdsRef.current.length) * 0.5) {
        // If vastly different, reset scroll to top
        scrollPositionRef.current = 0;
      }
    } else {
      // Just update the reference without other actions
      prevMediaIdsRef.current = mediaIds;
    }
  }, [mediaIds]);

  return {
    prevMediaIdsRef,
    prevSelectedIdsRef,
    scrollPositionRef
  };
}
