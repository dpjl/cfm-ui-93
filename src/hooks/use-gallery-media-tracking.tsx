
import { useEffect, useRef, RefObject } from 'react';
import type { FixedSizeGrid } from 'react-window';

type GridRefType = RefObject<FixedSizeGrid> | React.ForwardedRef<FixedSizeGrid>;

/**
 * Hook pour gérer le suivi des médias dans la galerie et leur affichage
 * Optimisé pour éviter les réinitialisations inutiles du défilement
 */
export function useGalleryMediaTracking(
  mediaIds: string[], 
  gridRef: GridRefType
) {
  const prevMediaIdsRef = useRef<string[]>([]);
  
  // Détecter uniquement les changements importants dans les médias
  useEffect(() => {
    const prevMediaIds = prevMediaIdsRef.current;
    
    // Vérifier s'il y a eu un changement significatif dans les médias
    const significantMediaChange = Math.abs(mediaIds.length - prevMediaIds.length) > 20;
    
    if (significantMediaChange && gridRef && 'current' in gridRef && gridRef.current) {
      // Stocker la liste actuelle comme référence
      prevMediaIdsRef.current = [...mediaIds];
      
      // Faire remonter la grille vers le haut
      gridRef.current.scrollTo({ scrollTop: 0 });
    }
  }, [mediaIds, gridRef]);
}
