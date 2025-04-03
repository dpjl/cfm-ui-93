
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Type pour la position de défilement
interface ScrollPosition {
  top: number;
  left: number;
}

// Props pour le hook
interface UseGalleryGridProps {
  position: 'source' | 'destination';
  viewModeType: string;
}

export function useGalleryGrid({ position, viewModeType }: UseGalleryGridProps) {
  const gridRef = useRef<FixedSizeGrid>(null);
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  
  // Stocker la position de défilement dans localStorage pour persister entre les sessions
  // Format de clé: 'scroll-position-{position}-{viewModeType}'
  const storageKey = `scroll-position-${position}-${viewModeType}`;
  const [savedScrollPosition, setSavedScrollPosition] = useLocalStorage<ScrollPosition>(
    storageKey, 
    { top: 0, left: 0 }
  );

  const lastResetTimeRef = useRef(0);
  const isRestoringRef = useRef(false);

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
    if (gridRef.current && !isRestoringRef.current) {
      const { scrollTop, scrollLeft } = gridRef.current.state;
      setSavedScrollPosition({ top: scrollTop, left: scrollLeft });
    }
  }, [setSavedScrollPosition]);
  
  // Gérer le défilement dans la grille
  const handleScroll = useCallback(({ scrollTop, scrollLeft }: { scrollTop: number, scrollLeft: number }) => {
    // Ne pas sauvegarder pendant une restauration pour éviter les boucles
    if (!isRestoringRef.current) {
      setSavedScrollPosition({ top: scrollTop, left: scrollLeft });
    }
  }, [setSavedScrollPosition]);
  
  // Restaurer la position de défilement sauvegardée
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && savedScrollPosition) {
      // Marquer que nous sommes en train de restaurer pour éviter de sauvegarder pendant la restauration
      isRestoringRef.current = true;
      gridRef.current.scrollTo({ 
        scrollTop: savedScrollPosition.top,
        scrollLeft: savedScrollPosition.left
      });
      
      // Remettre le flag à false après la restauration
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    }
  }, [savedScrollPosition]);

  // Appliquer la restauration de la position après l'initialisation complète de la grille
  useEffect(() => {
    // Attendre que la grille soit complètement rendue
    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [restoreScrollPosition, gridKey]);

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
    }
  }, [saveScrollPosition, refreshGrid]);

  return {
    gridRef,
    gridKey,
    handleScroll,
    refreshGrid,
    saveScrollPosition,
    restoreScrollPosition,
    handleResize
  };
}
