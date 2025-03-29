
import { useRef, useState, useCallback, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';

/**
 * Hook unifié qui combine la gestion de la grille et les calculs de dimensions
 */
export function useUnifiedGrid(
  containerWidth: number = 0, 
  columnsCount: number = 4, 
  gap: number = 8, 
  showDates: boolean = false
) {
  // Références pour la grille
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const scrollPositionRef = useRef(0);
  const lastResetTimeRef = useRef(0);

  // Calculer les dimensions des éléments
  const itemWidth = useMemo(() => {
    // Si la largeur du conteneur n'est pas encore connue, utiliser une valeur par défaut
    if (!containerWidth) return 200;
    
    // Calculer la largeur totale des espaces
    const totalGapWidth = gap * (columnsCount - 1);
    // Calculer la largeur de l'élément en divisant l'espace restant
    return Math.floor((containerWidth - totalGapWidth) / columnsCount);
  }, [containerWidth, columnsCount, gap]);

  // Calculer la hauteur des éléments en fonction de leur largeur et de l'affichage des dates
  const itemHeight = useMemo(() => {
    return itemWidth + (showDates ? 40 : 0);
  }, [itemWidth, showDates]);

  // Calculer le nombre de lignes nécessaires
  const calculateRowCount = useCallback((itemCount: number) => {
    return Math.ceil(itemCount / columnsCount);
  }, [columnsCount]);

  // Calculer les styles des cellules avec des ajustements pour les espaces
  const calculateCellStyle = useCallback((originalStyle: React.CSSProperties): React.CSSProperties => {
    return {
      ...originalStyle,
      width: `${parseFloat(originalStyle.width as string) - gap}px`,
      height: `${parseFloat(originalStyle.height as string) - gap}px`,
      padding: 0,
    };
  }, [gap]);

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

  // Calculer l'index d'un élément à partir des indices de ligne et de colonne
  const calculateItemIndex = useCallback((rowIndex: number, columnIndex: number): number => {
    return rowIndex * columnsCount + columnIndex;
  }, [columnsCount]);

  // Vérifier si un élément existe à un index donné
  const itemExistsAtIndex = useCallback((rowIndex: number, columnIndex: number, totalItems: number): boolean => {
    const index = calculateItemIndex(rowIndex, columnIndex);
    return index < totalItems;
  }, [calculateItemIndex]);

  // Configuration pour le component FixedSizeGrid
  const getGridConfig = useCallback((itemCount: number, width: number, height: number) => {
    const rowCount = calculateRowCount(itemCount);
    
    return {
      key: `gallery-grid-${gridKey}`,
      ref: gridRef,
      columnCount: columnsCount,
      columnWidth: itemWidth + gap / columnsCount,
      height,
      rowCount,
      rowHeight: itemHeight + gap,
      width,
      overscanRowCount: 5,
      overscanColumnCount: 2,
      onScroll: ({ scrollTop }: { scrollTop: number }) => {
        scrollPositionRef.current = scrollTop;
      },
      initialScrollTop: scrollPositionRef.current,
      className: "scrollbar-vertical"
    };
  }, [gridKey, columnsCount, itemWidth, itemHeight, gap, calculateRowCount]);

  return {
    // Références et état
    gridRef,
    gridKey,
    scrollPositionRef,
    
    // Dimensions calculées
    itemWidth,
    itemHeight,
    gap,
    
    // Méthodes de calcul
    calculateRowCount,
    calculateCellStyle,
    calculateItemIndex,
    itemExistsAtIndex,
    
    // Méthodes de gestion de la grille
    refreshGrid,
    saveScrollPosition,
    restoreScrollPosition,
    handleResize,
    getGridConfig
  };
}
