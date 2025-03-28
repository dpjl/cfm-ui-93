
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTouchInteractionsProps {
  id: string;
  onSelect: (id: string, extendSelection: boolean) => void;
}

export function useTouchInteractions({ id, onSelect }: UseTouchInteractionsProps) {
  const [touchStartPoint, setTouchStartPoint] = useState<{x: number, y: number} | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const touchMoveCount = useRef(0);
  
  // Clean up the timer when component unmounts or when the id changes
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [id, longPressTimer]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Store the starting touch point
    const touch = e.touches[0];
    setTouchStartPoint({x: touch.clientX, y: touch.clientY});
    touchMoveCount.current = 0;
    
    // Start the long press timer
    const timer = setTimeout(() => {
      // If the user hasn't moved much, consider it a long press
      if (touchMoveCount.current < 10) {
        // Simulate Ctrl+click for multi-selection
        onSelect(id, true);
        
        // Provide haptic feedback on supported devices
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
  }, [id, onSelect]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Increment the movement counter
    touchMoveCount.current += 1;
    
    // Cancel long press if user moves too much
    if (touchMoveCount.current > 10 && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Cancel the timer when touch ends
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // If minimal movement, treat as a simple tap
    if (touchMoveCount.current < 10) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id, false);
    }
    
    // Reset for next interaction
    setTouchStartPoint(null);
  }, [longPressTimer, id, onSelect]);
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
