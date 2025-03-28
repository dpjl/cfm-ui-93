
import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface SelectionCheckboxProps {
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  loaded: boolean;
  mediaId: string;
}

const SelectionCheckbox = memo(({
  selected,
  onSelect,
  loaded,
  mediaId
}: SelectionCheckboxProps) => {
  const isMobile = useIsMobile();
  
  if (!loaded) {
    return null; // Ne pas afficher si le média n'est pas chargé
  }
  
  return (
    <div 
      className={cn(
        "absolute z-20",
        isMobile ? "top-1 left-1" : "top-2 left-2"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(e);
      }}
      role="checkbox"
      aria-checked={selected}
      aria-label={selected ? `Deselect media ${mediaId}` : `Select media ${mediaId}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const mouseEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          onSelect(mouseEvent as unknown as React.MouseEvent);
        }
      }}
    >
      <Checkbox 
        checked={selected}
        className={cn(
          "border-2",
          "h-5 w-5",
          selected ? "border-primary bg-primary" : "border-white bg-white/30",
          "shadow-sm"
        )}
        tabIndex={-1}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation des comparaisons
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.mediaId === nextProps.mediaId
  );
});

SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox;
