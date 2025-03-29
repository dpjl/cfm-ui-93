
import React, { memo } from 'react';
import LazyMediaItem from '@/components/LazyMediaItem';

interface GalleryGridCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    mediaIds: string[];
    selectedIds: string[];
    onSelectId: (id: string, extendSelection: boolean) => void;
    updateMediaInfo?: (id: string, info: any) => void;
    position: 'source' | 'destination';
    columnsCount: number;
    gap: number;
  };
}

const GalleryGridCell = memo(({ columnIndex, rowIndex, style, data }: GalleryGridCellProps) => {
  const index = rowIndex * data.columnsCount + columnIndex;
  
  // Return null for out of bounds indices
  if (index >= data.mediaIds.length) return null;
  
  const id = data.mediaIds[index];
  const isSelected = data.selectedIds.includes(id);
  
  // Adjust style to account for gap
  const adjustedStyle = {
    ...style,
    width: `${parseFloat(style.width as string) - data.gap}px`,
    height: `${parseFloat(style.height as string) - data.gap}px`,
    padding: 0,
  };
  
  return (
    <div style={adjustedStyle}>
      <LazyMediaItem
        key={id}
        id={id}
        selected={isSelected}
        onSelect={data.onSelectId}
        index={index}
        updateMediaInfo={data.updateMediaInfo}
        position={data.position}
      />
    </div>
  );
});

// Set display name for debugging
GalleryGridCell.displayName = 'GalleryGridCell';

export default GalleryGridCell;
