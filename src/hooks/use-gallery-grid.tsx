
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';

export function useGalleryGrid() {
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const scrollPositionRef = useRef(0);
  const lastResetTimeRef = useRef(0);

  // Increment grid key to force re-render
  const refreshGrid = useCallback(() => {
    // Vérifiez si un reset a été fait récemment pour éviter les resets trop fréquents
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      // Éviter les resets trop fréquents
      return;
    }
    
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, []);
  
  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      scrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, []);
  
  // Restore saved scroll position
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && scrollPositionRef.current > 0) {
      gridRef.current.scrollTo({ scrollTop: scrollPositionRef.current });
    }
  }, []);

  // Handle resize with debounce
  const handleResize = useCallback((width: number, height: number) => {
    // Check if size change is significant
    if (
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5
    ) {
      // Save position before update
      saveScrollPosition();
      
      // Update size reference
      previousSizeRef.current = { width, height };
      
      // Force grid refresh
      refreshGrid();
      
      // Restore position after update
      setTimeout(restoreScrollPosition, 50);
    }
  }, [saveScrollPosition, restoreScrollPosition, refreshGrid]);

  return {
    gridRef,
    gridKey,
    scrollPositionRef,
    previousSizeRef,
    setGridKey,
    refreshGrid,
    saveScrollPosition,
    restoreScrollPosition,
    handleResize
  };
}
