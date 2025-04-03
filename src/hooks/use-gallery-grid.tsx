
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useGridAnchor } from './use-grid-anchor';
import { GalleryViewMode } from '@/types/gallery';

interface UseGalleryGridProps {
  columnsCount: number;
  mediaItemsCount: number;
  viewMode: GalleryViewMode;
}

export function useGalleryGrid(props?: UseGalleryGridProps) {
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const scrollPositionRef = useRef(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const lastResetTimeRef = useRef(0);
  const gridReadyRef = useRef(false);
  
  // Track previous values for comparison
  const previousColumnsRef = useRef(props?.columnsCount || 0);
  const previousViewModeRef = useRef<GalleryViewMode>(props?.viewMode || 'both');
  
  // Use our simplified grid anchor hook
  const { saveScrollAnchor, restoreScrollAnchor } = useGridAnchor();
  
  // Effect to handle column count or view mode changes
  useEffect(() => {
    if (!props) return;
    
    const { columnsCount, mediaItemsCount, viewMode } = props;
    const previousColumnsCount = previousColumnsRef.current;
    const previousViewMode = previousViewModeRef.current;
    
    // Only proceed if we have a grid reference and values have changed
    if (gridRef.current && gridReadyRef.current && (
      columnsCount !== previousColumnsCount || 
      viewMode !== previousViewMode
    )) {
      try {
        // Save current position using percentage approach
        saveScrollAnchor({
          gridRef,
          columnsCount: previousColumnsCount,
          previousColumnsCount,
          viewMode: previousViewMode,
          previousViewMode
        });
        
        // Refresh grid to apply new layout
        refreshGrid();
        
        // Restore scroll position after refresh with a safe delay
        const timeoutId = setTimeout(() => {
          try {
            if (gridRef.current) {
              restoreScrollAnchor({
                gridRef,
                columnsCount,
                previousColumnsCount,
                viewMode,
                previousViewMode
              });
            }
          } catch (error) {
            console.error('Error in restore scroll timeout callback:', error);
          }
        }, 100);
        
        // Update previous values
        previousColumnsRef.current = columnsCount;
        previousViewModeRef.current = viewMode;
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error handling grid updates:', error);
      }
    }
  }, [props?.columnsCount, props?.viewMode, props?.mediaItemsCount, saveScrollAnchor, restoreScrollAnchor]);

  // Force grid re-render to apply layout changes
  const refreshGrid = useCallback(() => {
    // Throttle resets to avoid excessive re-renders
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      return;
    }
    
    // Reset grid ready state before re-render
    gridReadyRef.current = false;
    
    // Increment key to force re-render
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, []);
  
  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current && gridReadyRef.current) {
      scrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, []);
  
  // Restore saved scroll position
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && gridReadyRef.current && scrollPositionRef.current > 0) {
      gridRef.current.scrollTo({ scrollTop: scrollPositionRef.current });
    }
  }, []);

  // Handle resize events with debouncing
  const handleResize = useCallback((width: number, height: number) => {
    // Check if size change is significant
    const isSignificantChange = 
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5;
      
    if (isSignificantChange && gridReadyRef.current) {
      try {
        // Save position before update
        saveScrollPosition();
        
        // Update size reference
        previousSizeRef.current = { width, height };
        
        // Force grid refresh
        refreshGrid();
        
        // Restore position after update
        const timeoutId = setTimeout(restoreScrollPosition, 100);
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error handling resize:', error);
      }
    }
  }, [saveScrollPosition, restoreScrollPosition, refreshGrid]);

  // Mark grid as ready after initial render
  const handleGridInitialized = useCallback(() => {
    gridReadyRef.current = true;
  }, []);

  return {
    gridRef,
    gridKey,
    scrollPositionRef,
    previousSizeRef,
    refreshGrid,
    saveScrollPosition,
    restoreScrollPosition,
    handleResize,
    handleGridInitialized,
    gridReadyRef
  };
}
