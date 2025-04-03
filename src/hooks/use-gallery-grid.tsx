
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
      return;
    }
    
    // Sauvegarder la position actuelle de défilement avant le refresh
    if (gridRef.current) {
      saveScrollPercentage(gridRef);
    }
    
    // Marquer que nous sommes en train de reset
    isResettingRef.current = true;
    
    // Mettre à jour la clé pour forcer un nouveau rendu
    setGridKey(prev => prev + 1);
    lastResetTimeRef.current = now;
  }, [saveScrollPercentage]);
  
  // Fonction à appeler quand la grille est prête après un refresh
  const handleGridReady = useCallback(() => {
    // Ne restaurer que si nous sommes en train de reset
    if (isResettingRef.current) {
      restoreScrollPercentage(gridRef);
      isResettingRef.current = false;
    }
  }, [restoreScrollPercentage]);
  
  // Gérer le redimensionnement avec debounce
  const handleResize = useCallback((width: number, height: number) => {
    // Vérifier si le changement de taille est significatif
    const isSignificantChange = 
      Math.abs(previousSizeRef.current.width - width) > 5 || 
      Math.abs(previousSizeRef.current.height - height) > 5;
      
    if (isSignificantChange) {
      // Sauvegarder la position avant la mise à jour
      if (gridRef.current) {
        saveScrollPercentage(gridRef);
      }
      
      // Mettre à jour la référence de taille
      previousSizeRef.current = { width, height };
      
      // Forcer le rafraîchissement de la grille
      refreshGrid();
    }
  }, [saveScrollPercentage, refreshGrid]);
  
  // Sauvegarder la position avant démontage
  useEffect(() => {
    return () => {
      if (gridRef.current) {
        saveScrollPercentage(gridRef);
      }
    };
  }, [saveScrollPercentage]);

  return {
    gridRef,
    gridKey,
    refreshGrid,
    handleResize,
    handleGridReady,
    saveScrollPercentage
  };
}
