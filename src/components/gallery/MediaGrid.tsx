
import React, { useRef, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
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
  
  const handleMediaSelect = (id: string, e: React.MouseEvent) => {
    const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(id, multiSelect);
  };
  
  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columns + columnIndex;
    const mediaId = mediaIds[index];
    
    if (!mediaId) return null;
    
    return (
      <div style={style}>
        <MediaCard
          key={mediaId}
          id={mediaId}
          position={position}
          isSelected={selectedMedia.includes(mediaId)}
          onClick={(e) => handleMediaSelect(mediaId, e)}
          onDoubleClick={() => onPreview(mediaId)}
        />
      </div>
    );
  };
  
  return (
    <div ref={parentRef} className="h-full w-full overflow-auto">
      <AutoSizer>
        {({ height, width }) => {
          const itemWidth = width / columns;
          const rowCount = Math.ceil(mediaIds.length / columns);
          
          return (
            <FixedSizeGrid
              columnCount={columns}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemWidth} // Square cells for images
              width={width}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default MediaGrid;
