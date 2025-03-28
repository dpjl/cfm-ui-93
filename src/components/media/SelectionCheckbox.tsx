
import React, { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface SelectionCheckboxProps {
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  loaded: boolean;
  mediaId: string;
}

// Optimisé avec memo pour éviter les rendus inutiles
const SelectionCheckbox = memo(({
  selected,
  onSelect,
  loaded,
  mediaId
}: SelectionCheckboxProps) => {
  const isMobile = useIsMobile();
  
  // Empêcher la propagation d'événements et gérer la sélection avec useCallback
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(e);
  }, [onSelect]);
  
  // Gérer les événements tactiles pour mobile avec useCallback
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Créer un événement souris synthétique
    const mouseEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    onSelect(mouseEvent as unknown as React.MouseEvent);
  }, [onSelect]);
  
  // Gérer les interactions clavier pour l'accessibilité avec useCallback
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
  
  // Utiliser style au lieu de className pour les styles critiques
  const checkboxStyle = selected 
    ? "border-primary bg-primary shadow-md" 
    : "border-white bg-white/30 shadow-sm";
  
  return (
    <div 
      className={cn(
        "absolute z-20",
        isMobile ? "top-1 left-1" : "top-2 left-2",
        !loaded && "opacity-0", // Masquer la checkbox jusqu'à ce que le média soit chargé
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
        tabIndex={-1} // Nous voulons que le div parent reçoive le focus, pas la checkbox elle-même
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Vérification d'égalité personnalisée pour éviter les re-rendus
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.loaded === nextProps.loaded &&
    prevProps.mediaId === nextProps.mediaId
  );
});

// Définir un nom d'affichage pour le débogage
SelectionCheckbox.displayName = 'SelectionCheckbox';

export default SelectionCheckbox;
