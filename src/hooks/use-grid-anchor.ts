
import { useRef, RefObject, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import { GalleryViewMode } from '@/types/gallery';

interface GridScrollPosition {
  scrollPercentage: number;
}

interface GridAnchorProps {
  gridRef: RefObject<FixedSizeGrid>;
  columnsCount: number;
  previousColumnsCount: number;
  viewMode: GalleryViewMode;
  previousViewMode: GalleryViewMode;
}

/**
 * Hook that handles preserving scroll position when grid layout changes
 * Using a percentage-based approach to maintain relative position
 * This is more intuitive and works better across different view modes and column counts
 */
export function useGridAnchor() {
  // Store scroll percentage instead of item indices
  const previousScrollRef = useRef<GridScrollPosition>({
    scrollPercentage: 0
  });
  
  /**
   * Save the current scroll position as a percentage before layout change
   */
  const saveScrollAnchor = useCallback((props: GridAnchorProps) => {
    const { gridRef } = props;
    
    if (!gridRef.current) return;
    
    try {
      const grid = gridRef.current;
      
      // Get current scroll metrics
      const { scrollTop, scrollHeight } = grid.state;
      
      // Calculate scroll percentage (handle edge case of zero height)
      const scrollPercentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      // Save the scroll percentage
      previousScrollRef.current = {
        scrollPercentage
      };
      
      console.log("[GridAnchor] Saved scroll percentage:", scrollPercentage);
    } catch (error) {
      console.error('Error saving scroll anchor:', error);
    }
  }, []);
  
  /**
   * Restore scroll position after layout change using the saved percentage
   */
  const restoreScrollAnchor = useCallback((props: GridAnchorProps) => {
    const { 
      gridRef, 
      columnsCount, 
      previousColumnsCount, 
      viewMode, 
      previousViewMode 
    } = props;
    
    if (!gridRef.current) return;
    
    // Check if we need to restore position (column count or view mode change)
    const isColumnChange = columnsCount !== previousColumnsCount;
    const isViewModeChange = viewMode !== previousViewMode;
    
    if (!isColumnChange && !isViewModeChange) return;
    
    // Use requestAnimationFrame to ensure the grid has updated its layout
    requestAnimationFrame(() => {
      if (!gridRef.current) return;
      
      try {
        const grid = gridRef.current;
        
        // Get the saved scroll percentage
        const { scrollPercentage } = previousScrollRef.current;
        
        // Get current scroll height
        const { scrollHeight } = grid.state;
        
        // Calculate the new scroll position based on percentage
        const newScrollTop = scrollHeight * scrollPercentage;
        
        console.log("[GridAnchor] Restoring to percentage:", scrollPercentage, "New scrollTop:", newScrollTop);
        
        // Apply the scroll position with a slight delay to ensure layout is complete
        setTimeout(() => {
          if (gridRef.current) {
            gridRef.current.scrollTo({ scrollTop: newScrollTop });
          }
        }, 50);
      } catch (error) {
        console.error('Error restoring scroll position:', error);
      }
    });
  }, []);
  
  return {
    saveScrollAnchor,
    restoreScrollAnchor
  };
}
