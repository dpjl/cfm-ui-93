
import { useEffect, useRef, useCallback } from 'react';
import type { FixedSizeGrid } from 'react-window';

export function useGalleryMediaTracking(
  mediaIds: string[], 
  selectedIds: string[],
  gridRef: React.RefObject<FixedSizeGrid>
) {
  const prevMediaIdsRef = useRef<string[]>([]);
  const prevSelectedIdsRef = useRef<string[]>([]);
  const lastScrollPositionRef = useRef<number>(0);
  
  // Sauvegarder la position de défilement actuelle
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      lastScrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, [gridRef]);
  
  // Restaurer la position de défilement sauvegardée
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && lastScrollPositionRef.current > 0) {
      gridRef.current.scrollTo({ scrollTop: lastScrollPositionRef.current });
    }
  }, [gridRef]);
  
  // Détecter les changements importants dans les médias
  useEffect(() => {
    const prevMediaIds = prevMediaIdsRef.current;
    
    // Vérifier s'il y a eu un changement significatif dans les médias
    // Un changement significatif est défini comme un ajout ou une suppression de plus de 5 médias
    // Ou si l'ordre a changé significativement (plus de 5 positions différentes)
    const significantMediaChange = Math.abs(mediaIds.length - prevMediaIds.length) > 5;
    
    if (significantMediaChange) {
      // Sauvegarder la position actuelle avant toute modification
      saveScrollPosition();
      
      // Réinitialisation seulement en cas de changement significatif des médias
      if (gridRef.current) {
        // Stocker la liste actuelle comme référence
        prevMediaIdsRef.current = [...mediaIds];
        
        // Faire remonter la grille vers le haut seulement si la liste a beaucoup changé
        if (Math.abs(mediaIds.length - prevMediaIds.length) > 50) {
          gridRef.current.scrollTo({ scrollTop: 0 });
        } else {
          // Pour des changements moins importants, essayer de maintenir la position
          restoreScrollPosition();
        }
      }
    }
  }, [mediaIds, gridRef, saveScrollPosition, restoreScrollPosition]);
  
  // Optimisation pour les changements de sélection - ne rien faire
  useEffect(() => {
    // Ne pas réagir aux changements de sélection, pour éviter les resets
    // Stocker simplement la sélection actuelle comme référence
    prevSelectedIdsRef.current = [...selectedIds];
  }, [selectedIds]);
  
  return {
    saveScrollPosition,
    restoreScrollPosition,
    lastScrollPositionRef
  };
}
