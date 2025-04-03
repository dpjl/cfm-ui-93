
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
  
  // Use our simplified grid anchor hook
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
      try {
        // Save current position using percentage approach
        saveScrollAnchor({
          gridRef,
          columnsCount: previousColumnsCount,
          previousColumnsCount,
          viewMode: previousViewMode,
          previousViewMode
        });
        
        // Refresh grid to apply new layout
        refreshGrid();
        
        // Restore scroll position after refresh
        setTimeout(() => {
          try {
            restoreScrollAnchor({
              gridRef,
              columnsCount,
              previousColumnsCount,
              viewMode,
              previousViewMode
            });
          } catch (error) {
            console.error('Error in restore scroll timeout callback:', error);
          }
        }, 100);
        
        // Update previous values
        previousColumnsRef.current = columnsCount;
        previousViewModeRef.current = viewMode;
      } catch (error) {
        console.error('Error handling grid updates:', error);
      }
    }
  }, [props?.columnsCount, props?.viewMode, props?.mediaItemsCount, saveScrollAnchor, restoreScrollAnchor]);

  // Incrémente la clé de la grille pour forcer le rendu
  const refreshGrid = useCallback(() => {
    // Éviter les resets trop fréquents (throttling)
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      return;
    }
    
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, []);
  
  // Mettre à jour la référence de la position de défilement
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      scrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, []);
  
  // Restaurer la position de défilement
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
      try {
        // Sauvegarder la position avant la mise à jour
        saveScrollPosition();
        
        // Mettre à jour la référence de taille
        previousSizeRef.current = { width, height };
        
        // Forcer le rafraîchissement de la grille
        refreshGrid();
        
        // Restaurer la position après la mise à jour
        setTimeout(restoreScrollPosition, 100);
      } catch (error) {
        console.error('Error handling resize:', error);
      }
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
