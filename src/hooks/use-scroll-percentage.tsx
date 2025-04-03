
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
  
  // Track ready state of the grid
  const isGridReadyRef = useRef<boolean>(false);
  const restoreAttemptRef = useRef<number>(0);
  const maxRestoreAttempts = 10;
  
  // Store the latest grid ref to access during restoration attempts
  const latestGridRef = useRef<any>(null);
  
  // Debounced function to save the scroll percentage to localStorage
  const debouncedSavePercentage = useRef(
    debounce((percentage: number) => {
      if (Math.abs(percentage - storedPercentage) > minPercentageDiff) {
        setStoredPercentage(percentage);
      }
    }, debounceMs)
  ).current;
  
  // Calculate and save scroll percentage
  const saveScrollPercentage = (gridRef: React.RefObject<any>) => {
    if (!gridRef.current || !gridRef.current._outerRef) return;
    
    const grid = gridRef.current._outerRef;
    const maxScroll = grid.scrollHeight - grid.clientHeight || 1;
    const percentage = maxScroll <= 0 ? 0 : grid.scrollTop / maxScroll;
    
    // Save to ref immediately for quick access
    currentPercentageRef.current = percentage;
    
    // Debounced save to localStorage to avoid performance issues
    debouncedSavePercentage(percentage);
  };
  
  // Safe scroll restoration with verification that grid is ready
  const restoreScrollPercentage = (gridRef: React.RefObject<any>) => {
    // Save the grid ref for potential retry attempts
    latestGridRef.current = gridRef;
    
    // Reset attempt counter when explicitly called
    restoreAttemptRef.current = 0;
    
    // Start the restore process
    attemptRestore();
  };
  
  // Function that attempts to restore scroll position
  const attemptRestore = () => {
    const gridRef = latestGridRef.current;
    if (!gridRef || !gridRef.current) return false;
    
    try {
      // Check if grid is fully initialized - with multiple safeguards
      const grid = gridRef.current._outerRef;
      const isGridReady = 
        gridRef.current && 
        grid && 
        grid.scrollHeight > 0 &&
        typeof grid.scrollTop === 'number' &&
        gridRef.current._instanceProps !== undefined;
      
      if (isGridReady) {
        isGridReadyRef.current = true;
        
        // Apply the scroll position
        const maxScroll = grid.scrollHeight - grid.clientHeight || 1;
        const targetScrollTop = currentPercentageRef.current * maxScroll;
        
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          try {
            grid.scrollTop = targetScrollTop;
          } catch (err) {
            console.error('Error setting scroll position:', err);
          }
        });
        
        return true;
      } 
    } catch (err) {
      console.error('Error checking grid readiness:', err);
    }
    
    // If we reach here, the grid is not ready yet or there was an error
    if (restoreAttemptRef.current < maxRestoreAttempts) {
      // Retry with exponential backoff
      const delay = Math.min(100 * Math.pow(1.5, restoreAttemptRef.current), 2000);
      restoreAttemptRef.current++;
      
      setTimeout(attemptRestore, delay);
      return false;
    }
    
    return false;
  };
  
  // Clean up the debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSavePercentage.cancel();
    };
  }, [debouncedSavePercentage]);
  
  return {
    saveScrollPercentage,
    restoreScrollPercentage,
    currentPercentage: currentPercentageRef.current
  };
}
