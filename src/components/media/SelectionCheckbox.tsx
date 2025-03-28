
import React, { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface SelectionCheckboxProps {
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  loaded: boolean;
  mediaId: string; // Added for accessibility
}

// Optimize with memo to prevent unnecessary re-renders
const SelectionCheckbox = memo(({
  selected,
  onSelect,
  loaded,
  mediaId
}: SelectionCheckboxProps) => {
  const isMobile = useIsMobile();
  
  // Prevent event propagation and handle selection with useCallback
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(e);
  }, [onSelect]);
  
  // Handle touch events for mobile with useCallback
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Create a synthetic mouse event
    const mouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    onSelect(mouseEvent as unknown as React.MouseEvent);
  }, [onSelect]);
  
  // Handle keyboard interactions for accessibility with useCallback
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      onSelect(mouseEvent as unknown as React.MouseEvent);
    }
  }, [onSelect]);
  
  // Use style instead of className for critical styles to reduce re-renders
  const checkboxStyle = selected 
    ? "border-primary bg-primary shadow-md" 
    : "border-white bg-white/30 shadow-sm";
  
  return (
    <div 
      className={cn(
        "absolute z-20",
        isMobile ? "top-1 left-1" : "top-2 left-2",
        !loaded && "opacity-0", // Hide checkbox until media is loaded
      )}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      role="checkbox"
      aria-checked={selected}
      aria-label={selected ? `Deselect media ${mediaId}` : `Select media ${mediaId}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Checkbox 
        checked={selected}
        className={cn(
          "border-2",
          isMobile ? "h-5 w-5" : "h-5 w-5",
          checkboxStyle,
          "transition-all duration-200 ease-out"
        )}
        tabIndex={-1} // We want the parent div to receive focus, not the checkbox itself
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom equality check to avoid re-renders when props haven't meaningfully changed
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.mediaId === nextProps.mediaId
  );
});

// Set display name for debugging
SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox;
