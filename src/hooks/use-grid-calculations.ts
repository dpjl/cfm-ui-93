
import { useMemo } from 'react';
import { 
  calculateItemWidth, 
  calculateItemHeight, 
  calculateRowCount, 
  calculateItemIndex, 
  itemExistsAtIndex
} from '../utils/grid-utils';

/**
 * Hook that provides centralized grid calculation utilities
 */
export function useGridCalculations(
  containerWidth: number, 
  columnsCount: number, 
  gap: number = 8, 
  showDates: boolean = false
) {
  /**
   * Calculate item width based on container width, column count, and gap
   */
  const itemWidth = useMemo(() => {
    return calculateItemWidth(containerWidth, columnsCount, gap);
  }, [containerWidth, columnsCount, gap]);

  /**
   * Calculate item height, optionally accounting for date display
   */
  const itemHeight = useMemo(() => {
    return calculateItemHeight(itemWidth, showDates);
  }, [itemWidth, showDates]);

  /**
   * Calculate cell style with gap considerations
   */
  const calculateCellStyle = useMemo(() => {
    return (originalStyle: React.CSSProperties, isLastColumn: boolean): React.CSSProperties => {
      // Start with the original style
      const adjustedStyle = { ...originalStyle };
      
      // Adjust width and height to account for gap
      adjustedStyle.width = `${parseFloat(originalStyle.width as string) - gap}px`;
      adjustedStyle.height = `${parseFloat(originalStyle.height as string) - gap}px`;
      
      return adjustedStyle;
    };
  }, [gap]);

  return {
    itemWidth,
    itemHeight,
    calculateCellStyle,
    gap
  };
}

// These are pure functions that don't depend on React hooks
// They can be called anywhere safely
export {
  calculateRowCount,
  calculateItemIndex,
  itemExistsAtIndex
};
