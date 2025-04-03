
import { useRef, RefObject, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import { GalleryViewMode } from '@/types/gallery';

interface GridVisibleArea {
  startIndex: number;
  centerIndex: number;
  topIndex: number;
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
   */
  const getVisibleArea = useCallback((
    grid: FixedSizeGrid, 
    columnsCount: number,
    totalItems: number
  ): GridVisibleArea => {
    const { scrollTop, scrollLeft, outerHeight, outerWidth } = grid.state;
    
    // Vérifier si _instanceProps existe et contient les propriétés nécessaires
    if (!grid._instanceProps || !grid._instanceProps.rowHeight || !grid._instanceProps.columnWidth) {
      console.warn('Grid instance properties are not fully initialized yet');
      // Retourner des valeurs par défaut pour éviter les erreurs
      return {
        startIndex: 0,
        centerIndex: 0,
        topIndex: 0,
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
    
    // Find the topmost visible item index
    const topIndex = startRow * columnsCount + startCol;
    
    // Calculate center point of viewport
    const centerX = scrollLeft + outerWidth / 2;
    const centerY = scrollTop + outerHeight / 2;
    
    // Find closest item to center
    const centerRow = Math.floor(centerY / rowHeight);
    const centerCol = Math.floor(centerX / columnWidth);
    const centerIndex = centerRow * columnsCount + centerCol;
    
    // Ensure centerIndex is within bounds
    const boundedCenterIndex = Math.min(Math.max(0, centerIndex), totalItems - 1);
    
    // First item visible in viewport
    const startIndex = startRow * columnsCount + startCol;
    
    return {
      startIndex,
      centerIndex: boundedCenterIndex,
      topIndex,
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
    const { visibleArea, viewModeType: previousViewModeType } = previousDetailsRef.current;
    const currentViewModeType = viewMode === 'both' ? 'split' : 'single';
    
    const isColumnChange = columnsCount !== previousColumnsCount;
    const isViewModeChange = currentViewModeType !== previousViewModeType;
    
    if (!isColumnChange && !isViewModeChange) return;
    
    // Use requestAnimationFrame to ensure the grid has updated its layout
    requestAnimationFrame(() => {
      if (!gridRef.current) return;
      
      try {
        // Vérifier si _instanceProps est défini avant d'utiliser getOffsetForCell
        if (!grid._instanceProps || !grid._instanceProps.rowHeight || !grid._instanceProps.columnWidth) {
          console.warn('Grid instance properties not fully initialized, delaying scroll restoration');
          // Essayer à nouveau après un court délai
          setTimeout(() => restoreScrollAnchor(props), 100);
          return;
        }
        
        // For column count changes (zoom effect) - maintain center item
        if (isColumnChange && !isViewModeChange) {
          const { centerIndex } = visibleArea;
          const newRowIndex = Math.floor(centerIndex / columnsCount);
          const newColIndex = centerIndex % columnsCount;
          
          const scrollInfo = grid.getOffsetForCell({
            rowIndex: newRowIndex,
            columnIndex: newColIndex,
            alignment: 'center'
          });
          
          grid.scrollTo({ scrollTop: scrollInfo.scrollTop });
        } 
        // For view mode changes - maintain top item
        else if (isViewModeChange) {
          const { topIndex } = visibleArea;
          const newRowIndex = Math.floor(topIndex / columnsCount);
          const newColIndex = topIndex % columnsCount;
          
          const scrollInfo = grid.getOffsetForCell({
            rowIndex: newRowIndex,
            columnIndex: newColIndex,
            alignment: 'start'
          });
          
          grid.scrollTo({ scrollTop: scrollInfo.scrollTop });
        }
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
