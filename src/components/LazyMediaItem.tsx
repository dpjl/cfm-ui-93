
import React, { useState, useEffect, memo, useCallback } from 'react';
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
const LazyMediaItem: React.FC<LazyMediaItemProps> = memo(({
  id,
  selected,
  onSelect,
  index,
  showDates = false,
  updateMediaInfo,
  position
}) => {
  const [loaded, setLoaded] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ 
    threshold: 0.1, 
    freezeOnceVisible: true 
  });
  
  const { mediaInfo, isLoading } = useMediaInfo(id, isIntersecting, position);
  const { getCachedThumbnailUrl, setCachedThumbnailUrl } = useMediaCache();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);
  
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
  
  // Update the parent component with media info when it's loaded
  useEffect(() => {
    if (mediaInfo && updateMediaInfo) {
      updateMediaInfo(id, mediaInfo);
    }
  }, [id, mediaInfo, updateMediaInfo]);
  
  // Determine if this is a video based on the file extension if available
  const isVideo = mediaInfo?.alt ? /\.(mp4|webm|ogg|mov)$/i.test(mediaInfo.alt) : false;
  
  // Gestion des clics
  const handleItemClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [id, onSelect]);
  
  // Gestion du appui long pour les mobiles (comme alternative au Ctrl+click)
  const handleTouchStart = useCallback(() => {
    // Démarrer le timer pour détecter un appui long
    const timer = setTimeout(() => {
      setLongPressTriggered(true);
      // Simuler un "Ctrl+click" en passant true comme second argument
      onSelect(id, true);
    }, 500); // 500ms est un bon délai pour un appui long
    
    setPressTimer(timer);
  }, [id, onSelect]);
  
  const handleTouchEnd = useCallback(() => {
    // Annuler le timer si l'utilisateur relâche trop tôt
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    // Si ce n'était pas un appui long, traiter comme un clic normal
    if (!longPressTriggered) {
      onSelect(id, false);
    }
    
    // Réinitialiser l'état pour le prochain appui
    setLongPressTriggered(false);
  }, [pressTimer, longPressTriggered, id, onSelect]);
  
  // Simplified animation variants for better performance
  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };
  
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
    <motion.div
      ref={elementRef}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      layout="position"
    >
      {thumbnailUrl && (
        <div 
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(id, e.shiftKey || e.ctrlKey || e.metaKey);
            }
          }}
          data-media-id={id}
        >
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
        </div>
      )}
    </motion.div>
  );
});

// Set component display name for debugging
LazyMediaItem.displayName = 'LazyMediaItem';

export default LazyMediaItem;
