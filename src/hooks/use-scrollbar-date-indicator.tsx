
import { useState, useCallback, useRef, useEffect } from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateIndicatorState {
  visible: boolean;
  formattedDate: string | null;
}

export function useScrollbarDateIndicator(
  mediaInfoMap: Map<string, DetailedMediaInfo | null>,
  mediaIds: string[]
) {
  const [dateIndicator, setDateIndicator] = useState<DateIndicatorState>({
    visible: false,
    formattedDate: null
  });
  
  const timerRef = useRef<number | null>(null);
  const lastScrollTopRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  
  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollTop = scrollContainer.scrollTop;
    
    // Ne pas traiter si le défilement est minimal
    if (Math.abs(scrollTop - lastScrollTopRef.current) < 15 && !isScrollingRef.current) {
      return;
    }
    
    isScrollingRef.current = true;
    lastScrollTopRef.current = scrollTop;
    
    // Trouver le premier élément visible
    const viewport = scrollContainer.getBoundingClientRect();
    let visibleItemId: string | null = null;
    
    // Parcourir les éléments pour trouver celui qui est visible en haut de la zone de visualisation
    const mediaElements = scrollContainer.querySelectorAll('[data-media-id]');
    
    if (mediaElements.length > 0) {
      let closestItem = null;
      let closestDistance = Infinity;
      
      mediaElements.forEach((element) => {
        const itemRect = element.getBoundingClientRect();
        const distance = Math.abs(itemRect.top - viewport.top);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = element;
        }
      });
      
      if (closestItem) {
        visibleItemId = closestItem.getAttribute('data-media-id');
      }
    }
    
    // Obtenir et formater la date du premier élément visible
    if (visibleItemId && mediaInfoMap.has(visibleItemId)) {
      const mediaInfo = mediaInfoMap.get(visibleItemId);
      
      if (mediaInfo?.createdAt) {
        try {
          const date = new Date(mediaInfo.createdAt);
          const formattedDate = format(date, 'dd MMMM yyyy', { locale: fr });
          
          setDateIndicator({
            visible: true,
            formattedDate
          });
          
          // Masquer l'indicateur après un délai
          if (timerRef.current) {
            window.clearTimeout(timerRef.current);
          }
          
          timerRef.current = window.setTimeout(() => {
            setDateIndicator(prev => ({ ...prev, visible: false }));
            isScrollingRef.current = false;
          }, 1500);
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
    }
  }, [mediaInfoMap]);
  
  return { dateIndicator, handleScroll };
}
