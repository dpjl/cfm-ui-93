
import { useMemo } from 'react';

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
    // Calculate the total gap width (gaps between columns)
    const totalGapWidth = gap * (columnsCount - 1);
    // Calculate item width by dividing the remaining space after gaps
    return Math.floor((containerWidth - totalGapWidth) / columnsCount);
  }, [containerWidth, columnsCount, gap]);

  /**
   * Calculate item height, optionally accounting for date display
   */
  const itemHeight = useMemo(() => {
    return itemWidth + (showDates ? 40 : 0);
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

  // These functions don't depend on hook state, so they're safe to include
  // without useMemo as they won't cause render issues
  const calculateRowCount = (itemCount: number): number => {
    return Math.ceil(itemCount / columnsCount);
  };

  const calculateItemIndex = (rowIndex: number, columnIndex: number): number => {
    return rowIndex * columnsCount + columnIndex;
  };

  const itemExistsAtIndex = (rowIndex: number, columnIndex: number, totalItems: number): boolean => {
    const index = calculateItemIndex(rowIndex, columnIndex);
    return index < totalItems;
  };

  return {
    itemWidth,
    itemHeight,
    calculateRowCount,
    calculateItemIndex,
    itemExistsAtIndex,
    calculateCellStyle,
    gap
  };
}
