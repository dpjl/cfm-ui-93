
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
  
  // Track previous values for comparison
  const previousColumnsRef = useRef(props?.columnsCount || 0);
  const previousViewModeRef = useRef<GalleryViewMode>(props?.viewMode || 'both');
  
  // Use our grid anchor hook
  const { saveScrollAnchor, restoreScrollAnchor } = useGridAnchor();
  
  // Effect to handle column count or view mode changes
  useEffect(() => {
    if (!props) return;
    
    const { columnsCount, mediaItemsCount, viewMode } = props;
    const previousColumnsCount = previousColumnsRef.current;
    const previousViewMode = previousViewModeRef.current;
    
    // Only proceed if we have a grid reference and values have changed
    if (gridRef.current && (
      columnsCount !== previousColumnsCount || 
      viewMode !== previousViewMode
    )) {
      // Save current position before update
      saveScrollAnchor({
        gridRef,
        columnsCount: previousColumnsCount,
        previousColumnsCount,
        mediaItemsCount,
        viewMode: previousViewMode,
        previousViewMode
      });
      
      // Refresh grid to apply new layout
      refreshGrid();
      
      // Restore scroll position after refresh
      setTimeout(() => {
        restoreScrollAnchor({
          gridRef,
          columnsCount,
          previousColumnsCount,
          mediaItemsCount,
          viewMode,
          previousViewMode
        });
      }, 50);
      
      // Update previous values
      previousColumnsRef.current = columnsCount;
      previousViewModeRef.current = viewMode;
    }
  }, [props?.columnsCount, props?.viewMode, props?.mediaItemsCount, saveScrollAnchor, restoreScrollAnchor]);

  // Incrémenter la clé de la grille pour forcer le rendu
  const refreshGrid = useCallback(() => {
    // Éviter les resets trop fréquents (throttling)
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      return;
    }
    
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, []);
  
  // Sauvegarder la position de défilement actuelle
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      scrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, []);
  
  // Restaurer la position de défilement sauvegardée
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && scrollPositionRef.current > 0) {
      gridRef.current.scrollTo({ scrollTop: scrollPositionRef.current });
    }
  }, []);

  // Gérer le redimensionnement avec debounce
  const handleResize = useCallback((width: number, height: number) => {
    // Vérifier si le changement de taille est significatif
    const isSignificantChange = 
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5;
      
    if (isSignificantChange) {
      // Sauvegarder la position avant la mise à jour
      saveScrollPosition();
      
      // Mettre à jour la référence de taille
      previousSizeRef.current = { width, height };
      
      // Forcer le rafraîchissement de la grille
      refreshGrid();
      
      // Restaurer la position après la mise à jour
      setTimeout(restoreScrollPosition, 50);
    }
  }, [saveScrollPosition, restoreScrollPosition, refreshGrid]);

  return {
    gridRef,
    gridKey,
    scrollPositionRef,
    previousSizeRef,
    refreshGrid,
    saveScrollPosition,
    restoreScrollPosition,
    handleResize
  };
}
