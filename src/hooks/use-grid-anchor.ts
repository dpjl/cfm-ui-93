
import { useRef, RefObject, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import { GalleryViewMode } from '@/types/gallery';

interface GridVisibleArea {
  startIndex: number;
  visibleIndices: number[];
}

interface GridAnchorProps {
  gridRef: RefObject<FixedSizeGrid>;
  columnsCount: number;
  previousColumnsCount: number;
  mediaItemsCount: number;
  viewMode: GalleryViewMode;
  previousViewMode: GalleryViewMode;
}

/**
 * Hook that handles calculating and preserving scroll position
 * when grid layout changes (column count or view mode)
 * Using a simplified approach that always maintains the top-left item position
 */
export function useGridAnchor() {
  const previousDetailsRef = useRef<{
    columnsCount: number;
    viewModeType: 'single' | 'split';
    visibleArea: GridVisibleArea | null;
  }>({
    columnsCount: 0,
    viewModeType: 'single',
    visibleArea: null,
  });
  
  /**
   * Get the current visible area of the grid
   * Simplified to only track the top-left item and visible items
   */
  const getVisibleArea = useCallback((
    grid: FixedSizeGrid, 
    columnsCount: number,
    totalItems: number
  ): GridVisibleArea => {
    const { scrollTop, scrollLeft, outerHeight, outerWidth } = grid.state;
    
    // Check if grid instance is fully initialized
    if (!grid._instanceProps || !grid._instanceProps.rowHeight || !grid._instanceProps.columnWidth) {
      console.warn('Grid instance properties are not fully initialized yet');
      return {
        startIndex: 0,
        visibleIndices: [],
      };
    }
    
    // Get grid item dimensions
    const { rowHeight, columnWidth } = grid._instanceProps;
    
    // Calculate visible rows and columns
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      Math.ceil((scrollTop + outerHeight) / rowHeight),
      Math.ceil(totalItems / columnsCount)
    );
    const startCol = Math.floor(scrollLeft / columnWidth);
    const endCol = Math.min(
      Math.ceil((scrollLeft + outerWidth) / columnWidth),
      columnsCount
    );
    
    // Calculate the visible indices
    const visibleIndices: number[] = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const index = row * columnsCount + col;
        if (index < totalItems) {
          visibleIndices.push(index);
        }
      }
    }
    
    // Calculate top-left visible item index
    const startIndex = startRow * columnsCount + startCol;
    
    // Ensure startIndex is within bounds
    const boundedStartIndex = Math.min(Math.max(0, startIndex), totalItems - 1);
    
    return {
      startIndex: boundedStartIndex,
      visibleIndices
    };
  }, []);
  
  /**
   * Save the current state before layout change
   */
  const saveScrollAnchor = useCallback((props: GridAnchorProps) => {
    const { gridRef, columnsCount, mediaItemsCount, viewMode } = props;
    
    if (!gridRef.current) return;
    
    try {
      const grid = gridRef.current;
      const visibleArea = getVisibleArea(grid, columnsCount, mediaItemsCount);
      const viewModeType = viewMode === 'both' ? 'split' : 'single';
      
      previousDetailsRef.current = {
        columnsCount,
        viewModeType,
        visibleArea,
      };
    } catch (error) {
      console.error('Error saving scroll anchor:', error);
    }
  }, [getVisibleArea]);
  
  /**
   * Restore scroll position after layout change
   * Simplified to always maintain the top-left item position
   */
  const restoreScrollAnchor = useCallback((props: GridAnchorProps) => {
    const { 
      gridRef, 
      columnsCount, 
      previousColumnsCount, 
      viewMode, 
      previousViewMode 
    } = props;
    
    if (!gridRef.current || !previousDetailsRef.current.visibleArea) return;
    
    const grid = gridRef.current;
    const { visibleArea } = previousDetailsRef.current;
    
    // Check if we need to restore position (column count or view mode change)
    const isColumnChange = columnsCount !== previousColumnsCount;
    const isViewModeChange = viewMode !== previousViewMode;
    
    if (!isColumnChange && !isViewModeChange) return;
    
    // Use requestAnimationFrame to ensure the grid has updated its layout
    requestAnimationFrame(() => {
      if (!gridRef.current) return;
      
      try {
        // Check if _instanceProps is defined before using grid methods
        if (!grid._instanceProps || !grid._instanceProps.rowHeight || !grid._instanceProps.columnWidth) {
          console.warn('Grid instance properties not fully initialized, delaying scroll restoration');
          // Try again after a short delay
          setTimeout(() => restoreScrollAnchor(props), 100);
          return;
        }
        
        // Use the startIndex (top-left item) for all types of changes
        const { startIndex } = visibleArea;
        
        // Calculate the new row and column indices based on the new column count
        const newRowIndex = Math.floor(startIndex / columnsCount);
        const newColIndex = startIndex % columnsCount;
        
        // Get the scroll position that would bring this item to the top-left
        const scrollInfo = grid.getOffsetForCell({
          rowIndex: newRowIndex,
          columnIndex: newColIndex,
          alignment: 'start' // Always align to start (top-left)
        });
        
        // Apply the scroll position
        grid.scrollTo({ scrollTop: scrollInfo.scrollTop });
      } catch (error) {
        console.error('Error restoring scroll position:', error);
      }
    });
  }, []);
  
  return {
    saveScrollAnchor,
    restoreScrollAnchor
  };
}
