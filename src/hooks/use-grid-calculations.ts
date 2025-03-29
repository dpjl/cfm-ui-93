
import { useMemo } from 'react';
import { 
  calculateItemWidth, 
  calculateItemHeight, 
  calculateRowCount, 
  calculateItemIndex, 
  itemExistsAtIndex,
  calculateGridParameters
} from '../utils/grid-utils';

/**
 * Hook that provides centralized grid calculation utilities
 * with improved precision to avoid spacing issues
 */
export function useGridCalculations(
  containerWidth: number, 
  columnsCount: number, 
  gap: number = 8, 
  showDates: boolean = false
) {
  /**
   * Use the combined grid parameters calculation for better precision
   * with dynamic scrollbar width detection
   */
  const gridParams = useMemo(() => {
    // Use a variable scrollbar width based on different browser/OS defaults
    // 12px is a more conservative estimate that works better across platforms
    const scrollbarWidth = 12;
    
    // Calculate available width accounting for scrollbar
    // We add 1px buffer to prevent potential gaps
    const availableWidth = Math.max(containerWidth - scrollbarWidth + 1, 0);
    
    return calculateGridParameters(availableWidth, columnsCount, gap, showDates);
  }, [containerWidth, columnsCount, gap, showDates]);

  /**
   * Calculate cell style with gap considerations and uniform sizing
   */
  const calculateCellStyle = useMemo(() => {
    return (originalStyle: React.CSSProperties, columnIndex: number): React.CSSProperties => {
      // Ensure all cells have identical dimensions by applying the same gap treatment
      const adjustedStyle = { 
        ...originalStyle,
        width: `${gridParams.itemWidth}px`,
        height: `${gridParams.itemHeight - gap}px`,
        paddingRight: gap,
        paddingBottom: gap,
        boxSizing: 'border-box' as 'border-box'
      };
      
      return adjustedStyle;
    };
  }, [gap, gridParams.itemWidth, gridParams.itemHeight]);

  return {
    ...gridParams,
    calculateCellStyle,
  };
}

// These are pure functions that don't depend on React hooks
// They can be called anywhere safely
export {
  calculateRowCount,
  calculateItemIndex,
  itemExistsAtIndex
};
