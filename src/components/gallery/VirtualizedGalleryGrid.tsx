
import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import DateSelector from './DateSelector';
import { useMediaDates } from '@/hooks/use-media-dates';
import { MediaListResponse, GalleryItem, GalleryViewMode } from '@/types/gallery';
import { 
  calculateGridParameters,
  getScrollbarWidth
} from '@/utils/grid-utils';

interface VirtualizedGalleryGridProps {
  mediaResponse: MediaListResponse;
  selectedIds: string[];
  onSelectId: (id: string, extendSelection: boolean) => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: DetailedMediaInfo) => void;
  position: 'source' | 'destination';
  gap?: number;
}

/**
 * A virtualized grid component that efficiently renders large collections of media items
 * With improved dimension calculations to prevent gaps and support for month/year separators
 */
const VirtualizedGalleryGrid = memo(({
  mediaResponse,
  selectedIds,
  onSelectId,
  columnsCount = 5,
  viewMode = 'single',
  showDates = false,
  updateMediaInfo,
  position = 'source',
  gap = 8
}: VirtualizedGalleryGridProps) => {
  const mediaIds = mediaResponse?.mediaIds || [];
  
  const {
    gridRef,
    gridKey,
    scrollPositionRef,
    handleGridInitialized,
    gridReadyRef
  } = useGalleryGrid({
    columnsCount,
    mediaItemsCount: mediaIds.length,
    viewMode: mapPositionToViewMode(position, viewMode)
  });
  
  const { 
    dateIndex, 
    scrollToYearMonth, 
    enrichedGalleryItems 
  } = useMediaDates(mediaResponse);
  
  useGalleryMediaTracking(mediaResponse, gridRef);
  
  // Ensure grid is marked as ready after mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleGridInitialized();
    }, 200); // Add a small delay to ensure grid is fully mounted
    
    return () => clearTimeout(timeoutId);
  }, [handleGridInitialized, gridKey]);
  
  const scrollbarWidth = useMemo(() => getScrollbarWidth(), []);
  
  const handleSelectYearMonth = useCallback((year: number, month: number) => {
    if (gridReadyRef.current) {
      scrollToYearMonth(year, month, gridRef);
    }
  }, [scrollToYearMonth, gridRef, gridReadyRef]);
  
  const rowCount = useMemo(() => {
    return Math.ceil(enrichedGalleryItems.length / columnsCount);
  }, [enrichedGalleryItems.length, columnsCount]);
  
  const calculateCellStyle = useCallback((
    originalStyle: React.CSSProperties, 
    columnIndex: number,
    isSeparator: boolean
  ): React.CSSProperties => {
    return {
      ...originalStyle,
      width: `${parseFloat(originalStyle.width as string) - gap}px`,
      height: `${parseFloat(originalStyle.height as string) - gap}px`,
      paddingRight: gap,
      paddingBottom: gap,
    };
  }, [gap]);
  
  const itemData = useMemo(() => ({
    items: enrichedGalleryItems,
    selectedIds,
    onSelectId,
    showDates,
    updateMediaInfo,
    position,
    columnsCount,
    gap,
    calculateCellStyle
  }), [enrichedGalleryItems, selectedIds, onSelectId, showDates, updateMediaInfo, position, columnsCount, gap, calculateCellStyle]);
  
  const getItemKey = useCallback(({ columnIndex, rowIndex }: { columnIndex: number; rowIndex: number }) => {
    const index = rowIndex * columnsCount + columnIndex;
    if (index >= enrichedGalleryItems.length) {
      return `empty-${rowIndex}-${columnIndex}`;
    }
    
    const item = enrichedGalleryItems[index];
    if (item.type === 'separator') {
      return `separator-${item.yearMonth}`;
    }
    return `media-${item.id}`;
  }, [enrichedGalleryItems, columnsCount]);

  // Helper function to map position to GalleryViewMode
  function mapPositionToViewMode(position: 'source' | 'destination', viewMode: 'single' | 'split'): GalleryViewMode {
    if (position === 'source') {
      return 'left';
    } else if (position === 'destination') {
      return 'right';
    }
    return 'both';
  }
  
  return (
    <div className="w-full h-full p-2 gallery-container relative">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          const { 
            itemWidth, 
            itemHeight
          } = calculateGridParameters(width, columnsCount, gap, showDates);
          
          const columnWidth = itemWidth + gap;
          
          const adjustedWidth = width - scrollbarWidth + 1;
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={Math.max(1, rowCount)} // Ensure at least 1 row to prevent errors
              rowHeight={itemHeight + gap}
              width={width}
              itemData={itemData}
              overscanRowCount={5}
              overscanColumnCount={2}
              itemKey={getItemKey}
              onScroll={({ scrollTop }) => {
                if (gridReadyRef.current) {
                  scrollPositionRef.current = scrollTop;
                }
              }}
              initialScrollTop={0} // Start at top, will be updated by our hook when ready
              className="scrollbar-vertical"
              style={{ 
                overflowX: 'hidden',
                scrollbarGutter: 'stable' as any
              }}
            >
              {GalleryGridCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
      
      {dateIndex.years.length > 0 && (
        <DateSelector
          years={dateIndex.years}
          monthsByYear={dateIndex.monthsByYear}
          onSelectYearMonth={handleSelectYearMonth}
          position={position}
        />
      )}
    </div>
  );
});

VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
