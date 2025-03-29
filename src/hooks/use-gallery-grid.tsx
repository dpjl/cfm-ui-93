
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useScrollPositionMemory, ScrollPositionData } from './use-scroll-position-memory';

interface UseGalleryGridOptions {
  galleryId: 'left' | 'right';
  directoryId: string;
  filter?: string;
  columnsCount: number;
  viewMode: 'single' | 'split';
  mediaIds: string[];
}

export function useGalleryGrid({
  galleryId,
  directoryId,
  filter = 'all',
  columnsCount,
  viewMode,
  mediaIds
}: UseGalleryGridOptions) {
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const scrollPositionRef = useRef(0);
  const lastResetTimeRef = useRef(0);
  
  // Utiliser notre nouveau hook pour la mémoire des positions
  const { saveScrollPosition, getScrollPosition } = useScrollPositionMemory();
  
  // Référence au premier élément visible
  const firstVisibleItemRef = useRef<string | null>(null);
  const firstVisibleRowRef = useRef<number>(0);
  
  // Observer les changements qui nécessiteraient de sauvegarder la position
  useEffect(() => {
    // Charger la position sauvegardée au montage ou lors d'un changement de contexte
    const savedPosition = getScrollPosition(galleryId, directoryId, filter);
    
    if (savedPosition && gridRef.current) {
      // Si le nombre de colonnes est différent, nous devons recalculer la position
      if (savedPosition.columnsCount !== columnsCount) {
        // Calcul de la nouvelle position basée sur l'index de ligne visible
        const rowIndex = savedPosition.firstVisibleRowIndex;
        if (mediaIds.length > 0) {
          // Si nous avons un ID d'élément visible, essayons de le trouver dans la liste actuelle
          if (savedPosition.firstVisibleItemId) {
            const itemIndex = mediaIds.indexOf(savedPosition.firstVisibleItemId);
            if (itemIndex !== -1) {
              // Calculer la nouvelle ligne basée sur le nouveau nombre de colonnes
              const newRowIndex = Math.floor(itemIndex / columnsCount);
              // Appliquer la nouvelle position
              gridRef.current.scrollTo({
                scrollLeft: 0,
                scrollTop: newRowIndex * (gridRef.current.props.rowHeight as number)
              });
            } else {
              // Si l'élément n'est plus dans la liste, utiliser l'index de ligne
              gridRef.current.scrollTo({
                scrollLeft: 0,
                scrollTop: rowIndex * (gridRef.current.props.rowHeight as number)
              });
            }
          } else {
            // Fallback sur l'index de ligne
            gridRef.current.scrollTo({
              scrollLeft: 0,
              scrollTop: rowIndex * (gridRef.current.props.rowHeight as number)
            });
          }
        }
      } else {
        // Si le nombre de colonnes est le même, restaurer directement la position
        gridRef.current.scrollTo({
          scrollLeft: 0,
          scrollTop: savedPosition.scrollTop
        });
      }
      
      // Mettre à jour les refs avec les valeurs chargées
      scrollPositionRef.current = savedPosition.scrollTop;
      firstVisibleItemRef.current = savedPosition.firstVisibleItemId;
      firstVisibleRowRef.current = savedPosition.firstVisibleRowIndex;
    }
    
    // Sauvegarder la position lors du démontage
    return () => {
      saveCurrentScrollPosition();
    };
  }, [galleryId, directoryId, filter, columnsCount, viewMode]);
  
  // Sauvegarder la position de défilement actuelle
  const saveCurrentScrollPosition = useCallback(() => {
    if (gridRef.current && directoryId) {
      // Déterminer le premier élément visible
      const scrollTop = gridRef.current.state.scrollTop;
      const rowHeight = gridRef.current.props.rowHeight as number;
      const firstVisibleRow = Math.floor(scrollTop / rowHeight);
      
      // Calculer l'indice de l'élément visible en haut à gauche
      const firstVisibleIndex = firstVisibleRow * columnsCount;
      const firstVisibleId = mediaIds.length > firstVisibleIndex ? mediaIds[firstVisibleIndex] : null;
      
      // Sauvegarder ces informations
      saveScrollPosition(galleryId, directoryId, filter, {
        scrollTop,
        firstVisibleItemId: firstVisibleId,
        firstVisibleRowIndex: firstVisibleRow,
        columnsCount,
        viewMode
      });
      
      // Mettre à jour les refs
      scrollPositionRef.current = scrollTop;
      firstVisibleItemRef.current = firstVisibleId;
      firstVisibleRowRef.current = firstVisibleRow;
    }
  }, [galleryId, directoryId, filter, columnsCount, viewMode, mediaIds, saveScrollPosition]);
  
  // Incrémenter la clé de la grille pour forcer le rendu
  const refreshGrid = useCallback(() => {
    // Éviter les resets trop fréquents (throttling)
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      return;
    }
    
    // Sauvegarder la position avant de rafraîchir
    saveCurrentScrollPosition();
    
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
    
    // Restaurer la position après le rafraîchissement
    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.scrollTo({ scrollTop: scrollPositionRef.current });
      }
    }, 50);
  }, [saveCurrentScrollPosition]);
  
  // Gérer le redimensionnement avec debounce
  const handleResize = useCallback((width: number, height: number) => {
    // Vérifier si le changement de taille est significatif
    const isSignificantChange = 
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5;
      
    if (isSignificantChange) {
      // Sauvegarder la position avant la mise à jour
      saveCurrentScrollPosition();
      
      // Mettre à jour la référence de taille
      previousSizeRef.current = { width, height };
      
      // Forcer le rafraîchissement de la grille
      refreshGrid();
    }
  }, [saveCurrentScrollPosition, refreshGrid]);
  
  // Sauvegarder la position lors du défilement
  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    scrollPositionRef.current = scrollTop;
    
    // Déterminer le premier élément visible (mais pas trop fréquemment)
    const rowHeight = gridRef.current?.props.rowHeight as number || 100;
    const firstVisibleRow = Math.floor(scrollTop / rowHeight);
    
    // Ne mettre à jour que si la ligne visible a changé
    if (firstVisibleRow !== firstVisibleRowRef.current) {
      firstVisibleRowRef.current = firstVisibleRow;
      
      // Calculer l'indice de l'élément visible en haut à gauche
      const firstVisibleIndex = firstVisibleRow * columnsCount;
      firstVisibleItemRef.current = mediaIds.length > firstVisibleIndex ? mediaIds[firstVisibleIndex] : null;
      
      // Sauvegarder périodiquement pendant le défilement (throttled)
      const now = Date.now();
      if (now - lastResetTimeRef.current > 1000) { // Sauvegarder au maximum une fois par seconde
        saveCurrentScrollPosition();
        lastResetTimeRef.current = now;
      }
    }
  }, [columnsCount, mediaIds, saveCurrentScrollPosition]);

  return {
    gridRef,
    gridKey,
    scrollPositionRef,
    previousSizeRef,
    refreshGrid,
    saveScrollPosition: saveCurrentScrollPosition,
    handleResize,
    handleScroll
  };
}
