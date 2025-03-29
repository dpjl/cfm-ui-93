
import React, { useState, useEffect, memo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getThumbnailUrl } from '@/api/imageApi';
import MediaItemRenderer from './media/MediaItemRenderer';
import { useMediaCache } from '@/hooks/use-media-cache';
import { useMediaInteractions } from '@/hooks/use-media-interactions';
import { useCombinedRef } from '@/hooks/use-combined-ref';
import MediaPlaceholder from './media/MediaPlaceholder';

interface LazyMediaItemProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, extendSelection: boolean) => void;
  index: number;
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: any) => void;
  position: 'source' | 'destination';
}

const LazyMediaItem = memo(({
  id,
  selected,
  onSelect,
  index,
  showDates = false,
  updateMediaInfo,
  position
}: LazyMediaItemProps) => {
  const [loaded, setLoaded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  
  // Observer l'intersection pour le chargement paresseux
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    freezeOnceVisible: true 
  });
  
  // Utiliser le cache pour les miniatures
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  // Utiliser notre hook d'interactions unifié pour gérer les clics, touches et interactions tactiles
  const { 
    handleClick, 
    handleKeyDown, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd 
  } = useMediaInteractions({
    id,
    onSelect,
  });
  
  // Référence combinée pour l'élément
  const setCombinedRef = useCombinedRef<HTMLDivElement>(elementRef, itemRef);
  
  // Charger les informations sur le média uniquement lorsque l'élément est visible
  const shouldLoadInfo = isIntersecting;
  const { mediaInfo, isLoading } = useMediaInfo(id, shouldLoadInfo, position);
  
  // Charger l'URL de la miniature, en utilisant le cache si disponible
  useEffect(() => {
    if (isIntersecting) {
      const cachedUrl = getCachedThumbnailUrl(id, position);
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
        return;
      }
      
      const url = getThumbnailUrl(id, position);
      setThumbnailUrl(url);
      setCachedThumbnailUrl(id, position, url);
    }
  }, [id, isIntersecting, position, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  // Mettre à jour le composant parent avec les informations sur le média
  useEffect(() => {
    if (mediaInfo && updateMediaInfo) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo]);
  
  // Déterminer s'il s'agit d'une vidéo en fonction de l'extension du fichier
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Rendre uniquement un espace réservé lorsqu'il n'est pas visible
  if (!isIntersecting) {
    return <MediaPlaceholder ref={setCombinedRef} />;
  }
  
  return (
    <div
      ref={setCombinedRef}
      className={cn(
        "image-card group relative", 
        "aspect-square cursor-pointer", 
        selected && "selected",
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      aria-label={`Media item ${mediaInfo?.alt || id}`}
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-media-id={id}
      data-selection-state={selected ? 'selected' : 'unselected'}
      style={{ touchAction: 'pan-y' }}
    >
      {thumbnailUrl && (
        <>
          <MediaItemRenderer
            mediaId={id}
            src={thumbnailUrl}
            alt={mediaInfo?.alt || id}
            isVideo={Boolean(isVideo)}
            isSelected={selected}
            onLoad={() => setLoaded(true)}
            loaded={loaded}
          />

          <div className="image-overlay pointer-events-none" />
        </>
      )}
    </div>
  );
});

// Définir le nom d'affichage pour le débogage
LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
export type { LazyMediaItemProps };
