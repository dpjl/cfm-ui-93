
import React, { memo, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import { 
  calculateRowCount, 
  calculateGridParameters
} from '@/utils/grid-utils';

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
 * With improved dimension calculations to prevent gaps
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
  // Use custom hook for grid management
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
    // More precise cell style calculator function
    calculateCellStyle: (originalStyle: React.CSSProperties, columnIndex: number) => {
      const isLastColumn = columnIndex === columnsCount - 1;
      
      return {
        ...originalStyle,
        width: `${parseFloat(originalStyle.width as string) - gap}px`,
        height: `${parseFloat(originalStyle.height as string) - gap}px`,
        paddingRight: isLastColumn ? 0 : gap,
        paddingBottom: gap,
      };
    }
  }), [mediaIds, selectedIds, onSelectId, showDates, updateMediaInfo, position, columnsCount]);
  
  return (
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Use the enhanced calculation function for all grid parameters
          const { 
            itemWidth, 
            itemHeight, 
            leftoverSpace 
          } = calculateGridParameters(width, columnsCount, gap, showDates);
          
          // Calculate the actual column width including gap distribution
          const columnWidth = itemWidth + gap;
          
          // Add tiny padding to the right to ensure no gap
          const adjustedWidth = width + 1;
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemHeight + gap}
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
              style={{ overflowX: 'hidden' }} // Prevent horizontal scrolling
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
