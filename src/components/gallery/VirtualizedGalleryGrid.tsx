
import React, { memo, useMemo, useCallback, useEffect, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import DateSelector from './DateSelector';
import { useMediaDates } from '@/hooks/use-media-dates';
import { MediaListResponse, GalleryItem } from '@/types/gallery';
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
  const initialRenderRef = useRef(true);
  
  const {
    gridRef,
    gridKey,
    handleResize,
    handleGridReady,
    saveScrollPercentage
  } = useGalleryGrid({ position });
  
  const { 
    dateIndex, 
    scrollToYearMonth, 
    enrichedGalleryItems 
  } = useMediaDates(mediaResponse);
  
  useGalleryMediaTracking(mediaResponse, gridRef);
  
  const scrollbarWidth = useMemo(() => getScrollbarWidth(), []);
  
  const handleSelectYearMonth = useCallback((year: number, month: number) => {
    scrollToYearMonth(year, month, gridRef);
  }, [scrollToYearMonth, gridRef]);
  
  const rowCount = useMemo(() => {
    // Always ensure at least 1 row to avoid react-window errors
    return Math.max(1, Math.ceil(enrichedGalleryItems.length / columnsCount));
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
  
  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    saveScrollPercentage(gridRef);
  }, [saveScrollPercentage, gridRef]);
  
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
  
  // Signal when grid is ready for scroll restoration
  useEffect(() => {
    // Use requestIdleCallback (or fallback to setTimeout) to ensure the grid is fully rendered
    const idleCallback = window.requestIdleCallback || ((callback) => setTimeout(callback, 200));
    const timeoutId = idleCallback(() => {
      handleGridReady();
      initialRenderRef.current = false;
    });
    
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(timeoutId);
      } else {
        clearTimeout(timeoutId as unknown as number);
      }
    };
  }, [handleGridReady, gridKey]);
  
  // Adapter pour corriger la signature de handleResize
  const handleAutosizeChange = useCallback(({ width, height }: { width: number; height: number }) => {
    handleResize(width, height);
  }, [handleResize]);
  
  return (
    <div className="w-full h-full p-2 gallery-container relative">
      <AutoSizer key={`gallery-grid-${gridKey}`} onResize={handleAutosizeChange}>
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
              rowCount={rowCount}
              rowHeight={itemHeight + gap}
              width={width}
              itemData={itemData}
              overscanRowCount={5}
              overscanColumnCount={2}
              itemKey={getItemKey}
              onScroll={handleScroll}
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
