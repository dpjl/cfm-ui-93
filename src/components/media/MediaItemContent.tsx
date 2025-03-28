
import React, { memo } from 'react';
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

// A focused component for the actual content inside the media item
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
  if (!thumbnailUrl && !isScrolling) return null;
  
  return (
    <>
      <MediaItemRenderer
        src={thumbnailUrl || ''}
        alt={mediaInfo?.alt || id}
        isVideo={isVideo}
        onLoad={() => setLoaded(true)}
        loaded={loaded}
        isScrolling={isScrolling}
      />

      {showDates && <DateDisplay dateString={mediaInfo?.createdAt} showDate={showDates} />}

      <div className="image-overlay pointer-events-none" />
      
      <SelectionCheckbox
        selected={selected}
        onSelect={handleCheckboxClick}
        loaded={loaded}
        mediaId={id}
      />
    </>
  );
});

MediaItemContent.displayName = 'MediaItemContent';

export default MediaItemContent;
