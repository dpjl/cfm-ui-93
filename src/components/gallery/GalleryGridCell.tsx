
import React, { memo } from 'react';
import LazyMediaItem, { LazyMediaItemProps } from '@/components/LazyMediaItem';

interface GalleryGridCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    mediaIds: string[];
    selectedIds: string[];
    onSelectId: (id: string, extendSelection: boolean) => void;
    showDates?: boolean;
    updateMediaInfo?: (id: string, info: any) => void;
    position: 'source' | 'destination';
    columnsCount: number;
    gap: number;
    calculateCellStyle: (style: React.CSSProperties) => React.CSSProperties;
  };
}

const GalleryGridCell = memo(({ columnIndex, rowIndex, style, data }: GalleryGridCellProps) => {
  const index = rowIndex * data.columnsCount + columnIndex;
  
  // Return null for out of bounds indices
  if (index >= data.mediaIds.length) return null;
  
  const id = data.mediaIds[index];
  const isSelected = data.selectedIds.includes(id);
  
  // Use the provided calculation function which is now guaranteed to exist
  const adjustedStyle = data.calculateCellStyle(style);
  
  return (
    <div style={adjustedStyle}>
      <LazyMediaItem
        key={id}
        id={id}
        selected={isSelected}
        onSelect={data.onSelectId}
        index={index}
        showDates={data.showDates}
        updateMediaInfo={data.updateMediaInfo}
        position={data.position}
      />
    </div>
  );
});

// Set display name for debugging
GalleryGridCell.displayName = 'GalleryGridCell';

export default GalleryGridCell;
