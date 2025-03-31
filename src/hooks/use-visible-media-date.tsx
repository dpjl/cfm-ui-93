
import { useState, useEffect, useRef } from 'react';
import { useMediaCache } from './use-media-cache';
import { format } from 'date-fns';

/**
 * Hook qui détecte la date du premier élément média visible dans la galerie
 * @param containerRef - Référence à l'élément conteneur de la galerie
 * @param isActive - Si la galerie est active/visible
 * @param position - Position de la galerie ('source' ou 'destination')
 * @returns Objet contenant la date formatée du premier élément visible
 */
export function useVisibleMediaDate(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean,
  position: 'source' | 'destination' = 'source'
) {
  const [visibleDate, setVisibleDate] = useState<string | null>(null);
  const { getCachedMediaInfo } = useMediaCache();

  // Observer pour détecter les éléments visibles
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    let firstVisibleMediaId: string | null = null;

    // Fonction pour mettre à jour la date visible
    const updateVisibleDate = () => {
      // Trouver tous les éléments média dans le conteneur
      const mediaElements = container.querySelectorAll('[data-media-id]');
      
      // Vérifier quels éléments sont visibles
      for (const element of Array.from(mediaElements)) {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Vérifier si l'élément est visible dans le conteneur
        if (
          rect.top >= containerRect.top - rect.height / 2 &&
          rect.bottom <= containerRect.bottom + rect.height / 2
        ) {
          // Obtenir l'ID du média depuis l'attribut data
          const mediaId = element.getAttribute('data-media-id');
          if (mediaId) {
            firstVisibleMediaId = mediaId;
            break;
          }
        }
      }

      // Récupérer les informations du média depuis le cache
      if (firstVisibleMediaId) {
        const mediaInfo = getCachedMediaInfo(firstVisibleMediaId, position);
        if (mediaInfo?.createdAt) {
          try {
            const date = new Date(mediaInfo.createdAt);
            // Formatter la date au format court DD/MM/YYYY
            const formattedDate = format(date, 'dd/MM/yyyy');
            setVisibleDate(formattedDate);
          } catch (e) {
            console.error('Error formatting date:', e);
          }
        }
      }
    };

    // Appel initial pour mettre à jour la date visible
    updateVisibleDate();

    // Observer le défilement du conteneur
    const handleScroll = () => {
      updateVisibleDate();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // Nettoyage
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, isActive, position, getCachedMediaInfo]);

  return { visibleDate };
}
