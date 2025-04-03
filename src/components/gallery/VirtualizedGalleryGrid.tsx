
import React, { memo, useMemo, useCallback } from 'react';
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
  
  // Use custom hook for grid management
  const {
    gridRef,
    gridKey,
    scrollPositionRef
  } = useGalleryGrid();
  
  // Use hook for date navigation and get enriched gallery items
  const { 
    dateIndex, 
    scrollToYearMonth, 
    enrichedGalleryItems 
  } = useMediaDates(mediaResponse);
  
  // Use hook for tracking media changes to optimize rendering
  useGalleryMediaTracking(mediaResponse, gridRef);
  
  // Get the scrollbar width
  const scrollbarWidth = useMemo(() => getScrollbarWidth(), []);
  
  // Handle year-month selection
  const handleSelectYearMonth = useCallback((year: number, month: number) => {
    scrollToYearMonth(year, month, gridRef);
  }, [scrollToYearMonth, gridRef]);
  
  // Calculate the number of rows based on enriched items and columns
  const rowCount = useMemo(() => {
    return Math.ceil(enrichedGalleryItems.length / columnsCount);
  }, [enrichedGalleryItems.length, columnsCount]);
  
  // Enhanced cell style calculator that handles separators correctly
  const calculateCellStyle = useCallback((
    originalStyle: React.CSSProperties, 
    columnIndex: number,
    isSeparator: boolean
  ): React.CSSProperties => {
    if (isSeparator) {
      // Style for separator that spans all columns
      return {
        ...originalStyle,
        width: `${parseFloat(originalStyle.width as string) * columnsCount}px`,
        height: '36px',  // Hauteur réduite pour les séparateurs
        paddingRight: 0,
        paddingBottom: 0,
        zIndex: 10,
        position: 'sticky' as const,  // Réintégrer le positionnement sticky
        top: 0,  // Réintégrer la position top
        gridColumn: `span ${columnsCount}`,
      };
    }
    
    // Regular cell style with gap
    return {
      ...originalStyle,
      width: `${parseFloat(originalStyle.width as string) - gap}px`,
      height: `${parseFloat(originalStyle.height as string) - gap}px`,
      paddingRight: gap,
      paddingBottom: gap,
    };
  }, [columnsCount, gap]);
  
  // Memoize the item data to prevent unnecessary renders
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
  
  // Memoize the key generator function for better performance
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
  
  return (
    <div className="w-full h-full p-2 gallery-container relative">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Use the enhanced calculation function for all grid parameters
          const { 
            itemWidth, 
            itemHeight
          } = calculateGridParameters(width, columnsCount, gap, showDates);
          
          // Calculate the actual column width including gap
          const columnWidth = itemWidth + gap;
          
          // Apply padding to ensure no overlap with scrollbar
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
              onScroll={({ scrollTop }) => {
                scrollPositionRef.current = scrollTop;
              }}
              initialScrollTop={scrollPositionRef.current}
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

// Set component display name for debugging
VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
