
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

// Optimisé pour réduire les re-rendus et éliminer les clignotements
const SelectionCheckbox = memo(({
  selected,
  onSelect,
  loaded,
  mediaId
}: SelectionCheckboxProps) => {
  const isMobile = useIsMobile();
  
  // Éviter le retard d'affichage avec un placeholder
  const visibilityStyle = {
    opacity: loaded ? 1 : 0,
    transition: 'opacity 150ms ease',
    pointerEvents: loaded ? 'auto' : 'none',
    willChange: 'opacity',
    transform: 'translateZ(0)'
  } as React.CSSProperties;
  
  return (
    <div 
      className={cn(
        "absolute z-20",
        isMobile ? "top-1 left-1" : "top-2 left-2",
      )}
      style={visibilityStyle}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (loaded) onSelect(e); // Protection supplémentaire
      }}
      role="checkbox"
      aria-checked={selected}
      aria-label={selected ? `Deselect media ${mediaId}` : `Select media ${mediaId}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && loaded) {
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
          "transform-gpu shadow-sm" // Optimisations pour éviter les clignotements
        )}
        tabIndex={-1}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation extrême des comparaisons
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.mediaId === nextProps.mediaId
  );
});

SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox;
