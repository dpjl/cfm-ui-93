
import React from 'react';
import type { MediaItem } from '../../types/gallery';
import VirtualizedGalleryGridWrapper from './VirtualizedGalleryGridWrapper';
import MediaItemRenderer from '../media/MediaItemRenderer';
import { Skeleton } from '../ui/skeleton';

interface GalleryGridContainerProps {
  items: MediaItem[];
  isLoading: boolean;
  columnCount: number;
  position: 'source' | 'destination';
  onMediaClick?: (id: string) => void;
}

const GalleryGridContainer: React.FC<GalleryGridContainerProps> = ({
  items,
  isLoading,
  columnCount,
  position,
  onMediaClick
}) => {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4" style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`
      }}>
        {Array.from({ length: columnCount * 3 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="w-full aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <p className="text-gray-500">Aucun média trouvé</p>
      </div>
    );
  }

  const renderMediaItem = (item: MediaItem, style: React.CSSProperties) => (
    <MediaItemRenderer
      key={item.id}
      item={item}
      position={position}
      onClick={() => onMediaClick?.(item.id)}
      style={style}
    />
  );

  return (
    <div className="h-full w-full">
      <VirtualizedGalleryGridWrapper
        items={items}
        columnCount={columnCount}
        renderItem={renderMediaItem}
      />
    </div>
  );
};

export default GalleryGridContainer;
