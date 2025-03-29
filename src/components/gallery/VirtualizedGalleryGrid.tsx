
import React, { memo, useMemo, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import { calculateRowCount } from '@/utils/grid-utils';

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

/**
 * A virtualized grid component that efficiently renders large collections of media items
 * With improved dimension calculations to ensure uniform cell sizes
 */
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
  // Always call hooks at the top level
  const {
    gridRef,
    gridKey,
    scrollPositionRef
  } = useGalleryGrid();
  
  // Use hook for tracking media changes to optimize rendering
  useGalleryMediaTracking(mediaIds, gridRef);
  
  // Calculate the number of rows based on media and columns
  const rowCount = calculateRowCount(mediaIds.length, columnsCount);
  
  // Define gap consistently
  const gap = 8;

  // Memoize the item data to prevent unnecessary renders
  const itemData = useMemo(() => ({
    mediaIds,
    selectedIds,
    onSelectId,
    showDates,
    updateMediaInfo,
    position,
    columnsCount,
    gap,
    // Pass the cell style calculator function
    calculateCellStyle: (originalStyle: React.CSSProperties, columnIndex: number) => {
      return {
        ...originalStyle,
        width: `${parseFloat(originalStyle.width as string) - gap}px`,
        height: `${parseFloat(originalStyle.height as string) - gap}px`,
        paddingRight: gap,
        paddingBottom: gap,
        boxSizing: 'border-box' as 'border-box'
      };
    }
  }), [mediaIds, selectedIds, onSelectId, showDates, updateMediaInfo, position, columnsCount, gap]);
  
  // Define a function to get optimal grid dimensions
  const getGridDimensions = useMemo(() => {
    return (containerWidth: number) => {
      // Standardized scrollbar estimate for consistency across browsers
      const scrollbarWidth = 12;
      
      // Add a small buffer (1px) to ensure full space utilization
      const availableWidth = Math.max(containerWidth - scrollbarWidth + 1, 0);
      
      // Distribute space optimally for items with ceiling to avoid right-side gaps
      const totalGapWidth = gap * (columnsCount - 1);
      const exactItemWidth = (availableWidth - totalGapWidth) / columnsCount;
      const itemWidth = Math.ceil(exactItemWidth);
      
      // Calculate height accommodating optional date display
      const itemHeight = itemWidth + (showDates ? 40 : 0);
      
      return {
        itemWidth, 
        itemHeight,
        adjustedWidth: availableWidth
      };
    };
  }, [columnsCount, gap, showDates]);
  
  return (
    <div className="w-full h-full p-2 gallery-container" style={{ overflowX: 'hidden' }}>
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Get dimensions using our memoized function
          const { itemWidth, itemHeight, adjustedWidth } = getGridDimensions(width);
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemHeight}
              width={adjustedWidth}
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
              className="scrollbar-vertical"
              style={{ 
                overflowX: 'hidden',
                scrollbarGutter: 'stable'
              }}
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
