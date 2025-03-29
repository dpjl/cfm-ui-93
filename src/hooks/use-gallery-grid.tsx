
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
  
  // Références pour le suivi de position
  const scrollPositionRef = useRef(0);
  const scrollHeightRef = useRef(0);
  const firstVisibleItemRef = useRef<string | null>(null);
  const firstVisibleRowRef = useRef<number>(0);
  const lastResetTimeRef = useRef(0);
  
  // Utiliser notre hook amélioré pour la mémoire des positions
  const { saveScrollPosition, getScrollPosition } = useScrollPositionMemory();
  
  // Méthode pour calculer le ratio de défilement actuel
  const calculateScrollRatio = useCallback(() => {
    if (!gridRef.current || !scrollHeightRef.current) return 0;
    const scrollHeight = gridRef.current.props.height as number;
    const scrollTop = scrollPositionRef.current;
    return scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  }, []);
  
  // Effet séparé pour charger la position sauvegardée
  useEffect(() => {
    if (!directoryId || !gridRef.current) return;
    
    // Essayer de charger la position exacte pour ce mode de vue
    const savedPosition = getScrollPosition(galleryId, directoryId, filter, viewMode);
    
    if (savedPosition) {
      console.log(`Restauration de la position pour ${galleryId}-${directoryId}-${filter}-${viewMode}`);
      
      // Si c'est le même nombre de colonnes, restaurer directement
      if (savedPosition.columnsCount === columnsCount) {
        gridRef.current.scrollTo({
          scrollLeft: 0,
          scrollTop: savedPosition.scrollTop
        });
      } 
      // Sinon, utiliser la position relative ou l'indice d'élément
      else if (savedPosition.firstVisibleItemId) {
        const itemIndex = mediaIds.indexOf(savedPosition.firstVisibleItemId);
        
        if (itemIndex !== -1) {
          // Calculer la nouvelle ligne basée sur le nouvel arrangement de colonnes
          const newRowIndex = Math.floor(itemIndex / columnsCount);
          const rowHeight = gridRef.current.props.rowHeight as number;
          
          gridRef.current.scrollTo({
            scrollLeft: 0,
            scrollTop: newRowIndex * rowHeight
          });
        } 
        // Fallback sur l'index de ligne si l'élément n'est pas trouvé
        else if (savedPosition.firstVisibleRowIndex >= 0) {
          const rowHeight = gridRef.current.props.rowHeight as number;
          gridRef.current.scrollTo({
            scrollLeft: 0, 
            scrollTop: savedPosition.firstVisibleRowIndex * rowHeight
          });
        }
      }
      
      // Mettre à jour les refs avec les valeurs chargées
      scrollPositionRef.current = gridRef.current.state.scrollTop;
      firstVisibleItemRef.current = savedPosition.firstVisibleItemId;
      firstVisibleRowRef.current = savedPosition.firstVisibleRowIndex;
    }
  }, [galleryId, directoryId, filter, viewMode, getScrollPosition, mediaIds, columnsCount]);
  
  // Effet séparé pour sauvegarder la position lors du démontage
  useEffect(() => {
    return () => {
      saveCurrentScrollPosition();
    };
  }, [galleryId, directoryId, filter, viewMode]);
  
  // Sauvegarder la position de défilement actuelle
  const saveCurrentScrollPosition = useCallback(() => {
    if (!gridRef.current || !directoryId) return;
    
    // Déterminer le premier élément visible
    const scrollTop = gridRef.current.state.scrollTop;
    const rowHeight = gridRef.current.props.rowHeight as number;
    const firstVisibleRow = Math.floor(scrollTop / rowHeight);
    
    // Calculer l'indice de l'élément visible en haut à gauche
    const firstVisibleIndex = firstVisibleRow * columnsCount;
    const firstVisibleId = mediaIds.length > firstVisibleIndex ? mediaIds[firstVisibleIndex] : null;
    
    // Calculer le ratio de défilement pour une meilleure adaptabilité entre les vues
    const scrollRatio = calculateScrollRatio();
    
    // Sauvegarder ces informations
    saveScrollPosition(galleryId, directoryId, filter, viewMode, {
      scrollTop,
      scrollRatio,
      firstVisibleItemId: firstVisibleId,
      firstVisibleRowIndex: firstVisibleRow,
      columnsCount,
      viewMode
    });
    
    // Mettre à jour les refs
    scrollPositionRef.current = scrollTop;
    firstVisibleItemRef.current = firstVisibleId;
    firstVisibleRowRef.current = firstVisibleRow;
  }, [galleryId, directoryId, filter, columnsCount, viewMode, mediaIds, saveScrollPosition, calculateScrollRatio]);
  
  // Sauvegarder explicitement avant un changement de vue
  const prepareViewModeChange = useCallback(() => {
    saveCurrentScrollPosition();
  }, [saveCurrentScrollPosition]);
  
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
    // Sauvegarder la hauteur de défilement actuelle pour calculer le ratio
    if (gridRef.current) {
      scrollHeightRef.current = height;
    }
    
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
    prepareViewModeChange,
    handleResize,
    handleScroll
  };
}
