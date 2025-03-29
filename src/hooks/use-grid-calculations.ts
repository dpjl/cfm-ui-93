
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
   */
  const gridParams = useMemo(() => {
    return calculateGridParameters(containerWidth, columnsCount, gap, showDates);
  }, [containerWidth, columnsCount, gap, showDates]);

  /**
   * Calculate cell style with gap considerations
   */
  const calculateCellStyle = useMemo(() => {
    return (originalStyle: React.CSSProperties, columnIndex: number): React.CSSProperties => {
      const isLastColumn = columnIndex === columnsCount - 1;
      
      // Adjust width and height to account for gap
      const adjustedStyle = { 
        ...originalStyle,
        width: `${parseFloat(originalStyle.width as string) - gap}px`,
        height: `${parseFloat(originalStyle.height as string) - gap}px`,
        paddingRight: isLastColumn ? 0 : gap,
        paddingBottom: gap
      };
      
      return adjustedStyle;
    };
  }, [gap, columnsCount]);

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
