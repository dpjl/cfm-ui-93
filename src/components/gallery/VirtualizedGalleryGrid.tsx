
import React, { memo, useEffect, useCallback, forwardRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';

interface VirtualizedGalleryGridProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string, extendSelection: boolean) => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  updateMediaInfo?: (id: string, info: DetailedMediaInfo) => void;
  position: 'source' | 'destination';
}

const VirtualizedGalleryGrid = forwardRef<any, VirtualizedGalleryGridProps>(({
  mediaIds,
  selectedIds,
  onSelectId,
  columnsCount = 5,
  viewMode = 'single',
  updateMediaInfo,
  position = 'source'
}, ref) => {
  // Use our custom hooks for grid management
  const {
    gridRef,
    gridKey,
    scrollPositionRef,
    handleResize,
    refreshGrid
  } = useGalleryGrid();
  
  // Expose ref for parent component
  React.useImperativeHandle(ref, () => ({
    ...gridRef.current,
    refreshGrid
  }));
  
  // Track media and selection changes
  useGalleryMediaTracking(mediaIds, selectedIds, gridRef);
  
  // Set up resize observer to detect container size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        handleResize(width, height);
      }
    });

    // Observer la galerie container
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
      resizeObserver.observe(galleryContainer);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);
  
  // Reset grid only when media IDs count changes significantly
  useEffect(() => {
    if (Math.abs(mediaIds.length - (gridRef.current as any)?._lastMediaLength || 0) > 5) {
      refreshGrid();
      // Store current length for future comparisons
      if (gridRef.current) {
        (gridRef.current as any)._lastMediaLength = mediaIds.length;
      }
    }
  }, [mediaIds.length, refreshGrid, gridRef]);
  
  // Calculate row count based on media IDs and columns
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
  // Memoize selection callback
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    onSelectId(id, extendSelection);
  }, [onSelectId]);
  
  // Memoize item data to prevent unnecessary re-renders
  const itemData = React.useMemo(() => ({
    mediaIds,
    selectedIds,
    onSelectId: handleSelectItem,
    updateMediaInfo,
    position,
    columnsCount,
    gap: 8
  }), [mediaIds, selectedIds, handleSelectItem, updateMediaInfo, position, columnsCount]);
  
  return (
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Calculate item size based on available width
          const gap = 8;
          const cellWidth = Math.floor((width - (gap * (columnsCount - 1))) / columnsCount);
          const cellHeight = cellWidth; // Make cells square
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={cellWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={cellHeight}
              width={width}
              itemData={itemData}
              overscanRowCount={5}
              overscanColumnCount={2}
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnsCount + columnIndex;
                return index < mediaIds.length ? mediaIds[index] : `empty-${rowIndex}-${columnIndex}`;
              }}
              onScroll={({ scrollTop }) => {
                scrollPositionRef.current = scrollTop;
              }}
              initialScrollTop={scrollPositionRef.current}
              className="gallery-grid"
            >
              {GalleryGridCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

// Set component display name for debugging
VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
