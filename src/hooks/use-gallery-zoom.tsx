
import { useCallback, useEffect, RefObject } from 'react';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface ZoomOptions {
  minColumns: number;
  maxColumns: number;
  initialColumns: number;
  onColumnsChange: (columns: number) => void;
}

/**
 * Hook pour gérer les interactions de zoom (molette/pincement) dans la galerie
 */
export function useGalleryZoom(
  containerRef: RefObject<HTMLElement>,
  options: ZoomOptions
) {
  const { minColumns, maxColumns, initialColumns, onColumnsChange } = options;
  const isMobile = useIsMobile();
  
  // Gestionnaire pour la molette de la souris (desktop)
  const handleWheel = useCallback((event: WheelEvent) => {
    // Vérifie si la touche Ctrl est enfoncée
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      // Déterminer la direction du zoom (positif = zoom out, négatif = zoom in)
      const delta = Math.sign(event.deltaY);
      
      // Sur desktop, + de colonnes = vignettes plus petites
      if (delta > 0) {
        // Zoom out = ajouter une colonne (réduire les vignettes)
        onColumnsChange(Math.min(maxColumns, initialColumns + 1));
      } else {
        // Zoom in = enlever une colonne (agrandir les vignettes)
        onColumnsChange(Math.max(minColumns, initialColumns - 1));
      }
    }
  }, [initialColumns, minColumns, maxColumns, onColumnsChange]);
  
  // Gestionnaire pour le pincement (mobile)
  const handlePinchGesture = useCallback(() => {
    if (!isMobile) return;
    
    let initialDistance = 0;
    let initialColumns = 0;
    
    // Début du pincement
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialColumns = options.initialColumns;
      }
    };
    
    // Pendant le pincement
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        // Calculer le ratio du pincement
        const ratio = currentDistance / initialDistance;
        
        // Seuil pour éviter des changements trop fréquents
        if (Math.abs(ratio - 1) > 0.2) {
          // Sur mobile, - de colonnes = vignettes plus grandes
          const newColumns = ratio > 1 
            ? Math.max(minColumns, initialColumns - 1) 
            : Math.min(maxColumns, initialColumns + 1);
          
          if (newColumns !== initialColumns) {
            onColumnsChange(newColumns);
            initialDistance = currentDistance;
            initialColumns = newColumns;
          }
        }
      }
    };
    
    // Appliquer les écouteurs d'événements
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, options.initialColumns, minColumns, maxColumns, onColumnsChange]);
  
  // Attacher les gestionnaires d'événements
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    // Activer le gestionnaire de molette sur desktop
    if (!isMobile) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    // Activer le gestionnaire de pincement sur mobile
    const cleanupPinch = isMobile ? handlePinchGesture() : undefined;
    
    return () => {
      if (!isMobile && element) {
        element.removeEventListener('wheel', handleWheel);
      }
      if (typeof cleanupPinch === 'function') {
        cleanupPinch();
      }
    };
  }, [containerRef, handleWheel, handlePinchGesture, isMobile]);
}
