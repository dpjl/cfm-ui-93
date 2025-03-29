
import React, { memo, useEffect, useCallback } from 'react';
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
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: DetailedMediaInfo) => void;
  position: 'source' | 'destination';
}

const VirtualizedGalleryGrid = memo(({
  mediaIds,
  selectedIds,
  onSelectId,
  columnsCount = 5,
  viewMode = 'single',
  showDates = false,
  updateMediaInfo,
  position = 'source'
}: VirtualizedGalleryGridProps) => {
  // Use our custom hooks for grid management
  const {
    gridRef,
    gridKey,
    scrollPositionRef,
    handleResize,
    refreshGrid
  } = useGalleryGrid();
  
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

    // Observe the gallery container
    const galleryContainer = document.querySelector('.gallery-container') || document.body;
    resizeObserver.observe(galleryContainer);

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
    showDates,
    updateMediaInfo,
    position,
    columnsCount,
    gap: 8
  }), [mediaIds, selectedIds, handleSelectItem, showDates, updateMediaInfo, position, columnsCount]);
  
  return (
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Calculate item size based on container width
          // Important: Use fixed cell width for consistent gallery sizing
          const gap = 8;
          const totalGapWidth = gap * (columnsCount - 1);
          const availableWidth = width - totalGapWidth;
          const cellWidth = Math.floor(availableWidth / columnsCount);
          const cellHeight = cellWidth + (showDates ? 40 : 0); // Add space for date display if needed
          
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
              // Increased overscan for smoother scrolling
              overscanRowCount={5}
              overscanColumnCount={2}
              // Use stable item key for better rendering efficiency
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnsCount + columnIndex;
                return index < mediaIds.length ? mediaIds[index] : `empty-${rowIndex}-${columnIndex}`;
              }}
              // Save scroll position during scroll events
              onScroll={({ scrollTop }) => {
                scrollPositionRef.current = scrollTop;
              }}
              // Initialize with saved scroll position
              initialScrollTop={scrollPositionRef.current}
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
