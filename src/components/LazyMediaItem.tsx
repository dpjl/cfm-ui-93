
import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useMediaInfo } from '@/hooks/use-media-info';
import { getThumbnailUrl } from '@/api/imageApi';
import { motion } from 'framer-motion';
import MediaItemRenderer from './media/MediaItemRenderer';
import DateDisplay from './media/DateDisplay';
import SelectionCheckbox from './media/SelectionCheckbox';
import { useMediaCache } from '@/hooks/use-media-cache';

interface LazyMediaItemProps {
  id: string;
  selected: boolean;
  onSelect: (id: string, extendSelection: boolean) => void;
  index: number;
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: any) => void;
  position: 'source' | 'destination';
}

// Using memo to prevent unnecessary re-renders
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
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    freezeOnceVisible: true 
  });
  
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  // Prevent initial loading of media info until element is actually visible
  const shouldLoadInfo = isIntersecting;
  
  // Only fetch media info once the item is visible and if we don't already have a URL
  const { mediaInfo, isLoading } = useMediaInfo(id, shouldLoadInfo, position);
  
  // Clean up timer when component unmounts or when id changes
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
    };
  }, [id]);
  
  // Load thumbnail URL, using cache if available
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
  
  // Update the parent component with media info when it's loaded - BUT ONLY ONCE
  useEffect(() => {
    if (mediaInfo && updateMediaInfo) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo]);
  
  // Determine if this is a video based on the file extension if available
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Optimize click handling with useCallback
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop propagation to prevent bubbling
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Handle long press for mobile (as alternative to Ctrl+click)
  const handleTouchStart = useCallback(() => {
    // Start timer to detect long press
    pressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      // Simulate a "Ctrl+click" by passing true as second argument
      onSelect(id, true);
    }, 500); // 500ms is a good delay for a long press
  }, [id, onSelect]);
  
  const handleTouchEnd = useCallback(() => {
    // Cancel timer if user releases too early
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    
    // If it wasn't a long press, treat as a normal click
    if (!longPressTriggered) {
      onSelect(id, false);
    }
    
    // Reset state for next press
    setLongPressTriggered(false);
  }, [longPressTriggered, id, onSelect]);
  
  // Optimize keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
  }, [id, onSelect]);
  
  // Only render a simple placeholder when the item is not intersecting
  if (!isIntersecting) {
    return (
      <div 
        ref={elementRef} 
        className="aspect-square bg-muted rounded-lg"
        role="img"
        aria-label="Loading media item"
      ></div>
    );
  }
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "image-card group relative", 
        "aspect-square cursor-pointer", 
        selected && "selected",
      )}
      onClick={handleItemClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      aria-label={`Media item ${mediaInfo?.alt || id}`}
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-media-id={id}
    >
      {thumbnailUrl && (
        <>
          <MediaItemRenderer
            src={thumbnailUrl}
            alt={mediaInfo?.alt || id}
            isVideo={Boolean(isVideo)}
            onLoad={() => setLoaded(true)}
            loaded={loaded}
          />

          <DateDisplay dateString={mediaInfo?.createdAt} showDate={showDates} />

          <div className="image-overlay pointer-events-none" />
          <SelectionCheckbox
            selected={selected}
            onSelect={(e) => {
              e.stopPropagation();
              onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
            }}
            loaded={loaded}
            mediaId={id}
          />
        </>
      )}
    </div>
  );
});

// Set component display name for debugging
LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
