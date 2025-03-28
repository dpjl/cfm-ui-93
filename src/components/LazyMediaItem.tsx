
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
  
  // Observer avec marge augmentée pour charger en avance
  const { elementRef, isIntersecting, hasBeenVisible } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1,
    rootMargin: '500px', // Chargement anticipé
    triggerOnce: true
  });
  
  const { mediaInfo } = useMediaInfo(id, isIntersecting || hasBeenVisible, position);
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  
  // Chargement des thumbnails
  useEffect(() => {
    if ((isIntersecting || hasBeenVisible) && !thumbnailUrl) {
      // Essayer d'abord le cache
      const cachedUrl = getCachedThumbnailUrl(id, position);
      
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
      } else {
        const url = getThumbnailUrl(id, position);
        setThumbnailUrl(url);
        setCachedThumbnailUrl(id, position, url);
      }
    }
  }, [id, isIntersecting, hasBeenVisible, position, thumbnailUrl, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  // Mise à jour des infos
  useEffect(() => {
    if (mediaInfo && updateMediaInfo && (isIntersecting || hasBeenVisible)) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo, isIntersecting, hasBeenVisible]);
  
  // Détecter les vidéos
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Gestionnaire de clics
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Gestionnaire de checkbox distinct
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Placeholder simple pendant le chargement
  if (!isIntersecting && !hasBeenVisible && !thumbnailUrl) {
    return <div ref={elementRef} className="aspect-square bg-muted/50 rounded-lg" />;
  }
  
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
