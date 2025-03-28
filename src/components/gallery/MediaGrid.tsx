
import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from 'react-window-virtualized';
import MediaCard from './MediaCard';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useColumns } from '@/hooks/use-columns';

interface MediaGridProps {
  mediaIds: string[];
  position: 'source' | 'destination';
  selectedMedia: string[];
  onSelect: (id: string, multiSelect?: boolean) => void;
  onPreview: (id: string) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  mediaIds,
  position,
  selectedMedia,
  onSelect,
  onPreview
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { columns, columnWidth } = useColumns(parentRef);
  
  const getItemKey = useCallback((index: number) => mediaIds[index], [mediaIds]);
  
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(mediaIds.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => columnWidth,
    overscan: 5,
  });
  
  const handleMediaSelect = (id: string, e: React.MouseEvent) => {
    const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(id, multiSelect);
  };
  
  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
      <AutoSizer>
        {({ height, width }) => {
          const totalHeight = Math.ceil(mediaIds.length / columns) * columnWidth;
          
          return (
            <div
              style={{
                height: `${height}px`,
                width: `${width}px`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: `${totalHeight}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const rowIndex = virtualRow.index;
                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${columnWidth}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: '1rem',
                      }}
                    >
                      {Array.from({ length: columns }).map((_, columnIndex) => {
                        const itemIndex = rowIndex * columns + columnIndex;
                        const mediaId = mediaIds[itemIndex];
                        
                        if (!mediaId) return null;
                        
                        return (
                          <MediaCard
                            key={mediaId}
                            id={mediaId}
                            position={position}
                            isSelected={selectedMedia.includes(mediaId)}
                            onClick={(e) => handleMediaSelect(mediaId, e)}
                            onDoubleClick={() => onPreview(mediaId)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default MediaGrid;
