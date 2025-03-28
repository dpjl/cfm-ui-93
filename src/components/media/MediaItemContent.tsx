
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
  // Protection pour les urls nulles pendant le scrolling
  const effectiveThumbnailUrl = thumbnailUrl || '';
  
  // Précharger les images hors-écran
  useEffect(() => {
    if (!isVideo && thumbnailUrl && !loaded && !isScrolling) {
      const img = new Image();
      img.src = thumbnailUrl;
      img.onload = () => setLoaded(true);
    }
  }, [isVideo, thumbnailUrl, loaded, isScrolling, setLoaded]);
  
  // Si pas de thumbnail pendant le scrolling, afficher un placeholder simple
  if (!effectiveThumbnailUrl && isScrolling) {
    return <div className="w-full h-full rounded-md bg-muted/40" />;
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
      
      {/* Checkbox de sélection - n'afficher que si le média est chargé */}
      {loaded && (
        <SelectionCheckbox
          selected={selected}
          onSelect={handleCheckboxClick}
          loaded={loaded}
          mediaId={id}
        />
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Optimisation des comparaisons pour minimiser les re-rendus
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
