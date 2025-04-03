import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { debounce } from 'lodash';
import { toast } from '@/components/ui/use-toast';

interface ScrollPercentageOptions {
  position: 'source' | 'destination';
  debounceMs?: number;
  minPercentageDiff?: number;
}

/**
 * Hook to track and persist scroll position as a percentage
 * This allows for reliable scroll position restoration even when grid dimensions change
 */
export function useScrollPercentage({
  position, 
  debounceMs = 300,
  minPercentageDiff = 0.02
}: ScrollPercentageOptions) {
  // Use local storage for persistence between sessions
  const storageKey = `gallery-scroll-${position}`;
  const [storedPercentage, setStoredPercentage] = useLocalStorage<number>(storageKey, 0);
  
  // Keep current percentage in a ref to avoid unnecessary rerenders
  const currentPercentageRef = useRef<number>(storedPercentage);
  
  // Track grid initialization state
  const isGridReadyRef = useRef<boolean>(false);
  const isRestorationPendingRef = useRef<boolean>(false);
  const latestGridRef = useRef<any>(null);
  
  // Debounced function to save the scroll percentage to localStorage
  const debouncedSavePercentage = useRef(
    debounce((percentage: number) => {
      if (Math.abs(percentage - storedPercentage) > minPercentageDiff) {
        console.log(`[${position}] Saving scroll percentage:`, percentage.toFixed(4));
        setStoredPercentage(percentage);
      }
    }, debounceMs)
  ).current;
  
  // Calculate and save scroll percentage
  const saveScrollPercentage = (gridRef: React.RefObject<any>) => {
    if (!gridRef.current || !gridRef.current._outerRef) {
      console.log(`[${position}] Cannot save scroll: grid or _outerRef is undefined`);
      return;
    }
    
    const grid = gridRef.current._outerRef;
    const maxScroll = grid.scrollHeight - grid.clientHeight || 1;
    const percentage = maxScroll <= 0 ? 0 : grid.scrollTop / maxScroll;
    
    console.log(`[${position}] Current scroll: ${grid.scrollTop}px / ${maxScroll}px = ${percentage.toFixed(4)}`);
    
    // Save to ref immediately for quick access
    currentPercentageRef.current = percentage;
    
    // Debounced save to localStorage to avoid performance issues
    debouncedSavePercentage(percentage);
  };
  
  // Function to handle when items are rendered in the grid
  // This indicates that the grid is ready to receive scroll commands
  const handleGridItemsRendered = () => {
    if (isRestorationPendingRef.current) {
      console.log(`[${position}] Items rendered event received while restoration pending, applying scroll position`);
      isGridReadyRef.current = true;
      applyScrollPosition();
    }
  };
  
  // Apply the stored scroll position to the grid
  const applyScrollPosition = () => {
    const gridRef = latestGridRef.current;
    if (!gridRef?.current?._outerRef) {
      console.log(`[${position}] Cannot apply scroll: grid or _outerRef is not available`);
      return false;
    }
    
    try {
      const grid = gridRef.current._outerRef;
      
      if (typeof grid.scrollTop !== 'number') {
        console.log(`[${position}] Cannot apply scroll: scrollTop is not available`);
        return false;
      }
      
      console.log(`[${position}] Grid ready for scroll restoration:`, {
        scrollHeight: grid.scrollHeight,
        clientHeight: grid.clientHeight,
        percentage: currentPercentageRef.current
      });
      
      // Apply the scroll position
      const maxScroll = grid.scrollHeight - grid.clientHeight || 1;
      const targetScrollTop = currentPercentageRef.current * maxScroll;
      
      console.log(`[${position}] Applying scroll position: ${targetScrollTop.toFixed(2)}px (${currentPercentageRef.current.toFixed(4)} of ${maxScroll}px)`);
      
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        try {
          grid.scrollTop = targetScrollTop;
          console.log(`[${position}] Scroll restoration complete, new scrollTop:`, grid.scrollTop);
          
          // Clear the pending state since we've applied the position
          isRestorationPendingRef.current = false;
        } catch (err) {
          console.error(`[${position}] Error setting scroll position:`, err);
          return false;
        }
      });
      
      return true;
    } catch (err) {
      console.error(`[${position}] Error during scroll restoration:`, err);
      return false;
    }
  };
  
  // Function to trigger the scroll restoration process
  const restoreScrollPercentage = (gridRef: React.RefObject<any>) => {
    console.log(`[${position}] Requesting scroll restoration, percentage:`, currentPercentageRef.current.toFixed(4));
    
    // Save the grid ref for potential retry or event-based restoration
    latestGridRef.current = gridRef;
    
    // Set flag that we want to restore when possible
    isRestorationPendingRef.current = true;
    
    // Try immediately in case grid is already ready
    if (applyScrollPosition()) {
      console.log(`[${position}] Immediate scroll restoration succeeded`);
      return;
    }
    
    console.log(`[${position}] Deferred restoration, waiting for grid items to render`);
    
    // Set a fallback timer in case the event doesn't fire
    const fallbackTimer = setTimeout(() => {
      if (isRestorationPendingRef.current) {
        console.log(`[${position}] Fallback timer for scroll restoration expired, attempting final restoration`);
        applyScrollPosition();
        // Clear the pending state regardless of success to avoid getting stuck
        isRestorationPendingRef.current = false;
      }
    }, 1000);
    
    return () => clearTimeout(fallbackTimer);
  };
  
  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      console.log(`[${position}] Cleaning up scroll percentage hook, final value:`, currentPercentageRef.current.toFixed(4));
      debouncedSavePercentage.cancel();
    };
  }, [debouncedSavePercentage]);
  
  return {
    saveScrollPercentage,
    restoreScrollPercentage,
    currentPercentage: currentPercentageRef.current,
    handleGridItemsRendered
  };
}
