import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getMediaThumbnailUrl } from '@/api/imageApi';
import MediaItemRenderer from './media/MediaItemRenderer';
import { useMediaCache } from '@/hooks/use-media-cache';
import { useTouchInteractions } from '@/hooks/use-touch-interactions';
import { useKeyboardInteractions } from '@/hooks/use-keyboard-interactions';
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
  
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    freezeOnceVisible: true 
  });
  
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchInteractions({
    id,
    onSelect,
  });
  
  const { handleKeyDown } = useKeyboardInteractions({
    id,
    onSelect,
  });
  
  const setCombinedRef = useCombinedRef<HTMLDivElement>(elementRef, itemRef);
  
  const shouldLoadInfo = isIntersecting;
  const { mediaInfo, isLoading } = useMediaInfo(id, shouldLoadInfo, position);
  
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  useEffect(() => {
    if (isIntersecting) {
      const cachedUrl = getCachedThumbnailUrl(id, position);
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
        return;
      }
      
      const url = getMediaThumbnailUrl(id);
      setThumbnailUrl(url);
      setCachedThumbnailUrl(id, position, url);
    }
  }, [id, isIntersecting, position, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  useEffect(() => {
    if (mediaInfo && updateMediaInfo) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo]);
  
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
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
      onClick={handleItemClick}
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

LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
export type { LazyMediaItemProps };
