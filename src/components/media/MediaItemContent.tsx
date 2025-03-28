
import React, { memo, useEffect } from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';
import MediaItemRenderer from './MediaItemRenderer';
import DateDisplay from './DateDisplay';
import SelectionCheckbox from './SelectionCheckbox';

interface MediaItemContentProps {
  id: string;
  thumbnailUrl: string | null;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
  handleCheckboxClick: (e: React.MouseEvent) => void;
  mediaInfo?: DetailedMediaInfo | null;
  isVideo: boolean;
  showDates?: boolean;
  isScrolling?: boolean;
  selected: boolean;
}

// Optimisé pour réduire les re-rendus et les clignotements
const MediaItemContent = memo(({
  id,
  thumbnailUrl,
  loaded,
  setLoaded,
  handleCheckboxClick,
  mediaInfo,
  isVideo,
  showDates = false,
  isScrolling = false,
  selected
}: MediaItemContentProps) => {
  // Protection supplémentaire pour les urls nulles pendant le scrolling
  const effectiveThumbnailUrl = thumbnailUrl || '';
  
  // Précharger les images pour réduire les clignotements
  useEffect(() => {
    if (!isVideo && thumbnailUrl && !loaded && !isScrolling) {
      const img = new Image();
      img.src = thumbnailUrl;
      img.onload = () => setLoaded(true);
    }
  }, [isVideo, thumbnailUrl, loaded, isScrolling, setLoaded]);
  
  // Pendant le scrolling rapide, ne pas essayer de rendre un média sans URL
  if (!effectiveThumbnailUrl && isScrolling) {
    return (
      <div className="w-full h-full rounded-md bg-muted/40" />
    );
  }
  
  return (
    <>
      <MediaItemRenderer
        src={effectiveThumbnailUrl}
        alt={mediaInfo?.alt || id}
        isVideo={isVideo}
        onLoad={() => setLoaded(true)}
        loaded={loaded}
        isScrolling={isScrolling}
      />

      {/* Afficher la date seulement si demandé et disponible */}
      {showDates && mediaInfo?.createdAt && (
        <DateDisplay 
          dateString={mediaInfo.createdAt} 
          showDate={showDates} 
        />
      )}

      {/* Overlay subtil pour l'effet visuel - pas de clignotement */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{ pointerEvents: 'none', willChange: 'opacity' }}
      />
      
      {/* Checkbox optimisée avec visibilité contrôlée */}
      <SelectionCheckbox
        selected={selected}
        onSelect={handleCheckboxClick}
        loaded={loaded}
        mediaId={id}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Optimisation maximale des comparaisons pour minimiser les re-rendus
  return (
    prevProps.id === nextProps.id &&
    prevProps.thumbnailUrl === nextProps.thumbnailUrl && 
    prevProps.loaded === nextProps.loaded &&
    prevProps.selected === nextProps.selected &&
    prevProps.isScrolling === nextProps.isScrolling &&
    prevProps.showDates === nextProps.showDates
  );
});

MediaItemContent.displayName = 'MediaItemContent';

export default MediaItemContent;
