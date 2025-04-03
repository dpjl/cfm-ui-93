
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
  
  console.log(`[${position}] VirtualizedGalleryGrid rendering, initialRender:`, initialRenderRef.current, 'mediaIds length:', mediaIds.length);
  
  const {
    gridRef,
    gridKey,
    handleResize,
    handleGridReady,
    saveScrollPercentage,
    onItemsRendered
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
    console.log(`[${position}] Grid scrolled to ${scrollTop}px`);
    saveScrollPercentage(gridRef);
  }, [saveScrollPercentage, gridRef, position]);
  
  // Gestionnaire pour l'événement onItemsRendered de react-window
  const handleItemsRendered = useCallback(() => {
    console.log(`[${position}] Grid items rendered callback from VirtualizedGalleryGrid`);
    onItemsRendered();
  }, [onItemsRendered, position]);
  
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
  
  // Log grid initialization
  useEffect(() => {
    console.log(`[${position}] Grid mounting with key:`, gridKey);
    return () => {
      console.log(`[${position}] Grid unmounting with key:`, gridKey);
    };
  }, [gridKey, position]);
  
  // Signal when grid is ready for scroll restoration
  useEffect(() => {
    // Use a short delay to ensure the grid has time to initialize
    console.log(`[${position}] Scheduling grid ready callback in 300ms`);
    const timer = setTimeout(() => {
      console.log(`[${position}] Timer fired, initializing grid`);
      handleGridReady();
      initialRenderRef.current = false;
    }, 300);
    
    return () => {
      console.log(`[${position}] Clearing grid initialization timer`);
      clearTimeout(timer);
    };
  }, [handleGridReady, gridKey, position]);
  
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
          
          console.log(`[${position}] Rendering grid with dimensions:`, {
            gridHeight: height, 
            gridWidth: width, 
            itemWidth, 
            itemHeight, 
            columnWidth,
            rowCount
          });
          
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
              onItemsRendered={handleItemsRendered}
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
