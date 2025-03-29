
import React, { memo, useCallback, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import { useGridCalculations, calculateRowCount } from '@/hooks/use-grid-calculations';

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
  // Use our custom hook for grid management
  const {
    gridRef,
    gridKey,
    scrollPositionRef,
    handleResize
  } = useGalleryGrid();
  
  // Use our hook for tracking media changes
  useGalleryMediaTracking(mediaIds, gridRef);
  
  // Calculate the number of rows based on media and columns
  const rowCount = calculateRowCount(mediaIds.length, columnsCount);
  
  // Define gap here to ensure it's consistently used
  const gap = 8;
  
  // Memorize the selection callback
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    onSelectId(id, extendSelection);
  }, [onSelectId]);
  
  // Memorize item data to prevent unnecessary renders
  const itemData = useMemo(() => ({
    mediaIds,
    selectedIds,
    onSelectId: handleSelectItem,
    showDates,
    updateMediaInfo,
    position,
    columnsCount,
    gap
  }), [mediaIds, selectedIds, handleSelectItem, showDates, updateMediaInfo, position, columnsCount]);
  
  return (
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Pre-calculate values that will be used in the grid rendering
          // but do NOT call hooks here
          const totalGapWidth = gap * (columnsCount - 1);
          const calculatedItemWidth = Math.floor((width - totalGapWidth) / columnsCount);
          const calculatedItemHeight = calculatedItemWidth + (showDates ? 40 : 0);
          
          // Create the cell style calculation function without using useMemo
          const cellStyleCalculator = (originalStyle: React.CSSProperties) => {
            return {
              ...originalStyle,
              width: `${parseFloat(originalStyle.width as string) - gap}px`,
              height: `${parseFloat(originalStyle.height as string) - gap}px`,
            };
          };
          
          // Update itemData with the cell style calculation function
          const enhancedItemData = {
            ...itemData,
            calculateCellStyle: cellStyleCalculator
          };
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={calculatedItemWidth + gap / columnsCount}
              height={height}
              rowCount={rowCount}
              rowHeight={calculatedItemHeight + gap}
              width={width}
              itemData={enhancedItemData}
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
