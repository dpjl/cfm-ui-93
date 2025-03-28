
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
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

// Optimized and simplified LazyMediaItem that delegates to smaller components
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
  
  // Simplified intersection observer usage
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1,
    rootMargin: '200px', // Load images a bit earlier
  });
  
  const { mediaInfo, isLoading } = useMediaInfo(id, isIntersecting, position);
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  
  // Load thumbnail URL, using cache if available
  useEffect(() => {
    if (isIntersecting) {
      const cachedUrl = getCachedThumbnailUrl(id, position);
      
      if (cachedUrl) {
        setThumbnailUrl(cachedUrl);
      } else {
        const url = getThumbnailUrl(id, position);
        setThumbnailUrl(url);
        setCachedThumbnailUrl(id, position, url);
      }
    }
  }, [id, isIntersecting, position, getCachedThumbnailUrl, setCachedThumbnailUrl]);
  
  // Update the parent component with media info when it's loaded
  useEffect(() => {
    if (mediaInfo && updateMediaInfo && isIntersecting) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo, isIntersecting]);
  
  // Determine if this is a video based on the file extension if available
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Optimized click handlers
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Handle checkbox selection - separate from item click for better performance
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Only render a simple placeholder when the item is not intersecting
  if (!isIntersecting && !thumbnailUrl) {
    return (
      <div 
        ref={elementRef} 
        className="aspect-square bg-muted rounded-lg"
        aria-label="Loading media item"
      ></div>
    );
  }
  
  // Using our new components for a cleaner structure
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

// Set component display name for debugging
LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
