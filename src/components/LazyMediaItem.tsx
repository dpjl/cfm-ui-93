
import React, { useState, useEffect, memo, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getThumbnailUrl } from '@/api/imageApi';
import { useMediaCache } from '@/hooks/use-media-cache';
import MediaItemContainer from './media/MediaItemContainer';
import MediaItemContent from './media/MediaItemContent';

interface LazyMediaItemProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, extendSelection: boolean) => void;
  index: number;
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: any) => void;
  position: 'source' | 'destination';
  isScrolling?: boolean;
}

const LazyMediaItem = memo(({
  id,
  selected,
  onSelect,
  index,
  showDates = false,
  updateMediaInfo,
  position,
  isScrolling = false
}: LazyMediaItemProps) => {
  const [loaded, setLoaded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loadingStarted, setLoadingStarted] = useState(false);
  
  // Observer avec marge augmentée pour charger en avance
  const { elementRef, isIntersecting, hasBeenVisible } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1,
    rootMargin: '500px', // Chargement très anticipé
    triggerOnce: true // Observer une seule fois puis se déconnecter
  });
  
  const { mediaInfo, isLoading } = useMediaInfo(id, isIntersecting || hasBeenVisible, position);
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  
  // Gestion optimisée du chargement
  useEffect(() => {
    // Ne pas exécuter pendant le scrolling pour éviter la surcharge
    if (isScrolling && !hasBeenVisible) return;
    
    // Charger seulement si l'élément est visible ou l'a déjà été
    if ((isIntersecting || hasBeenVisible) && !loadingStarted) {
      setLoadingStarted(true);
      
      // Essayer d'abord le cache
      const cachedUrl = getCachedThumbnailUrl(id, position);
      
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
        // Pas de setLoaded ici pour permettre la transition correcte
      } else {
        const url = getThumbnailUrl(id, position);
        setThumbnailUrl(url);
        setCachedThumbnailUrl(id, position, url);
      }
    }
  }, [id, isIntersecting, hasBeenVisible, position, loadingStarted, isScrolling, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  // Mise à jour des infos seulement quand nécessaire
  useEffect(() => {
    if (mediaInfo && updateMediaInfo && (isIntersecting || hasBeenVisible)) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo, isIntersecting, hasBeenVisible]);
  
  // Détecter les vidéos
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Gestionnaire de clics optimisé avec useCallback
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Gestionnaire de checkbox distinct pour éviter les conflits d'événements
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Placeholder hautement optimisé pendant le chargement
  if (!isIntersecting && !hasBeenVisible && !thumbnailUrl) {
    return (
      <div 
        ref={elementRef} 
        className="aspect-square bg-muted/50 rounded-lg transform-gpu"
        style={{ willChange: 'transform' }}
      />
    );
  }
  
  // Utiliser nos composants dédiés avec le minimum de props
  return (
    <div ref={elementRef}>
      <MediaItemContainer
        id={id}
        selected={selected}
        onClick={handleItemClick}
      >
        <MediaItemContent
          id={id}
          thumbnailUrl={thumbnailUrl}
          loaded={loaded}
          setLoaded={setLoaded}
          handleCheckboxClick={handleCheckboxClick}
          mediaInfo={mediaInfo}
          isVideo={isVideo}
          showDates={showDates}
          isScrolling={isScrolling}
          selected={selected}
        />
      </MediaItemContainer>
    </div>
  );
});

LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
