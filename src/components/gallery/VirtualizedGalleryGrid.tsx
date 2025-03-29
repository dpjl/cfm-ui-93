
import React, { memo, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import { useGridCalculations } from '@/hooks/use-grid-calculations';
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

  // Since useGridCalculations requires a containerWidth that we don't have yet,
  // we'll use useMemo to create a function that can be called later with the width
  const getGridDimensions = useMemo(() => {
    return (containerWidth: number) => {
      // Standard scrollbar width approximation
      const scrollbarWidth = 17;
      // Calculate available width accounting for scrollbar
      const availableWidth = Math.max(containerWidth - scrollbarWidth - 2, 0); // 2px for micro-adjustments
      
      // Calculate item dimensions based on available width
      const totalGapWidth = gap * (columnsCount - 1);
      const itemWidth = Math.floor((availableWidth - totalGapWidth) / columnsCount);
      const itemHeight = itemWidth + (showDates ? 40 : 0);
      
      return {
        itemWidth, 
        itemHeight,
        adjustedWidth: availableWidth
      };
    };
  }, [columnsCount, gap, showDates]);
  
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
