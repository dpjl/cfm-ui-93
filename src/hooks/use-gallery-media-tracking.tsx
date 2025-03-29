
import { useEffect, useRef } from 'react';
import type { FixedSizeGrid } from 'react-window';

export function useGalleryMediaTracking(
  mediaIds: string[], 
  selectedIds: string[],
  gridRef: React.RefObject<FixedSizeGrid>
) {
  const prevMediaIdsRef = useRef<string[]>([]);
  
  // Détecter les changements importants dans les médias et réinitialiser la grille seulement dans ce cas
  useEffect(() => {
    const prevMediaIds = prevMediaIdsRef.current;
    
    // Vérifier s'il y a eu un changement significatif dans les médias
    const significantMediaChange = Math.abs(mediaIds.length - prevMediaIds.length) > 5;
    
    if (significantMediaChange) {
      // Réinitialisation seulement en cas de changement significatif des médias
      if (gridRef.current) {
        // Stocker la liste actuelle comme référence
        prevMediaIdsRef.current = [...mediaIds];
        
        // Faire remonter la grille vers le haut
        gridRef.current.scrollTo({ scrollTop: 0 });
      }
    } else {
      // Mettre à jour la référence même sans changement significatif
      prevMediaIdsRef.current = [...mediaIds];
    }
  }, [mediaIds, gridRef]);
  
  // Ne pas réagir aux changements de sélection pour éviter les resets inutiles
  // Les changements de sélection sont gérés dans le useGallerySelection
}
