
import React, { memo, useMemo, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGalleryGrid } from '@/hooks/use-gallery-grid';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import GalleryGridCell from './GalleryGridCell';
import { 
  calculateRowCount, 
  calculateGridParameters,
  getScrollbarWidth
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
  directory: string; // Ajout du directory pour la mémorisation
  filter?: string; // Ajout du filtre pour la mémorisation
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
  position = 'source',
  directory = '',
  filter = 'all'
}: VirtualizedGalleryGridProps) => {
  // Convertir la position source/destination en left/right pour la cohérence
  const galleryId = position === 'source' ? 'left' : 'right';
  
  // Use custom hook for grid management with our extended options
  const {
    gridRef,
    gridKey,
    handleScroll,
    handleResize,
    prepareViewModeChange
  } = useGalleryGrid({
    galleryId,
    directoryId: directory,
    filter,
    columnsCount,
    viewMode,
    mediaIds
  });
  
  // Use hook for tracking media changes to optimize rendering
  useGalleryMediaTracking(mediaIds, gridRef);
  
  // Sauvegarder explicitement la position avant un changement de vue
  useEffect(() => {
    return () => {
      // Cette fonction sera appelée avant un changement de vue
      prepareViewModeChange();
    };
  }, [viewMode, prepareViewModeChange]);
  
  // Calculate the number of rows based on media and columns
  const rowCount = calculateRowCount(mediaIds.length, columnsCount);
  
  // Define gap consistently
  const gap = 8;
  
  // Get the scrollbar width
  const scrollbarWidth = useMemo(() => getScrollbarWidth(), []);
  
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
    // Simplified cell style calculator - now uniform for all columns
    calculateCellStyle: (originalStyle: React.CSSProperties) => {
      return {
        ...originalStyle,
        width: `${parseFloat(originalStyle.width as string) - gap}px`,
        height: `${parseFloat(originalStyle.height as string) - gap}px`,
        paddingRight: gap,
        paddingBottom: gap,
      };
    }
  }), [mediaIds, selectedIds, onSelectId, showDates, updateMediaInfo, position, columnsCount]);
  
  return (
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Handle resize events for our custom position tracking
          handleResize(width, height);
          
          // Use the enhanced calculation function for all grid parameters
          const { 
            itemWidth, 
            itemHeight, 
            leftoverSpace 
          } = calculateGridParameters(width, columnsCount, gap, showDates);
          
          // Calculate the actual column width including gap distribution
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
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnsCount + columnIndex;
                return index < mediaIds.length ? mediaIds[index] : `empty-${rowIndex}-${columnIndex}`;
              }}
              onScroll={handleScroll}
              className="scrollbar-vertical"
              style={{ 
                overflowX: 'hidden',
                scrollbarGutter: 'stable' as any // Reserve space for the scrollbar
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
