
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useScrollPercentage } from './use-scroll-percentage';

interface UseGalleryGridProps {
  position: 'source' | 'destination';
}

export function useGalleryGrid({ position }: UseGalleryGridProps) {
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const lastResetTimeRef = useRef(0);
  const isResettingRef = useRef(false);
  
  // Utiliser notre nouveau hook pour gérer le pourcentage de défilement
  const { 
    saveScrollPercentage, 
    restoreScrollPercentage 
  } = useScrollPercentage({ position });
  
  // Fonction pour incrémenter la clé de la grille et forcer un nouveau rendu
  const refreshGrid = useCallback(() => {
    // Éviter les resets trop fréquents (throttling)
    const now = Date.now();
    if (now - lastResetTimeRef.current < 500) {
      console.log(`[${position}] Grid refresh throttled (< 500ms)`);
      return;
    }
    
    console.log(`[${position}] Refreshing grid (key ${gridKey} -> ${gridKey + 1})`);
    
    // Sauvegarder la position actuelle de défilement avant le refresh
    if (gridRef.current) {
      console.log(`[${position}] Saving scroll before grid refresh`);
      saveScrollPercentage(gridRef);
    } else {
      console.log(`[${position}] Cannot save scroll before refresh: gridRef is null`);
    }
    
    // Marquer que nous sommes en train de reset
    isResettingRef.current = true;
    
    // Mettre à jour la clé pour forcer un nouveau rendu
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, [saveScrollPercentage, gridKey, position]);
  
  // Fonction à appeler quand la grille est prête après un refresh
  const handleGridReady = useCallback(() => {
    console.log(`[${position}] Grid ready called, isResetting:`, isResettingRef.current);
    
    // Ne restaurer que si nous sommes en train de reset
    if (isResettingRef.current) {
      console.log(`[${position}] Grid is ready after reset, restoring scroll position`);
      restoreScrollPercentage(gridRef);
      isResettingRef.current = false;
    } else {
      console.log(`[${position}] Grid ready but not after reset, skipping restoration`);
    }
  }, [restoreScrollPercentage, position]);
  
  // Gérer le redimensionnement avec debounce
  const handleResize = useCallback((width: number, height: number) => {
    // Vérifier si le changement de taille est significatif
    const isSignificantChange = 
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5;
      
    console.log(`[${position}] Resize event: ${width}x${height}, previous: ${previousSizeRef.current.width}x${previousSizeRef.current.height}, significant:`, isSignificantChange);
      
    if (isSignificantChange) {
      // Sauvegarder la position avant la mise à jour
      if (gridRef.current) {
        console.log(`[${position}] Saving scroll position before resize`);
        saveScrollPercentage(gridRef);
      }
      
      // Mettre à jour la référence de taille
      previousSizeRef.current = { width, height };
      
      // Forcer le rafraîchissement de la grille
      refreshGrid();
    }
  }, [saveScrollPercentage, refreshGrid, position]);
  
  // Sauvegarder la position avant démontage
  useEffect(() => {
    // Log au montage
    console.log(`[${position}] Gallery grid hook mounted with key:`, gridKey);
    
    // Effet de nettoyage (démontage)
    return () => {
      console.log(`[${position}] Gallery grid hook unmounting, saving final scroll position`);
      if (gridRef.current) {
        saveScrollPercentage(gridRef);
      }
    };
  }, [saveScrollPercentage, gridKey, position]);

  return {
    gridRef,
    gridKey,
    refreshGrid,
    handleResize,
    handleGridReady,
    saveScrollPercentage
  };
}
