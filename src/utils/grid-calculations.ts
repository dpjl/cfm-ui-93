
import { useMemo } from 'react';

/**
 * Utility functions for gallery grid calculations
 */

/**
 * Calculate item width based on container width, column count, and gap
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Calculate the total gap width
  const totalGapWidth = gap * (columnsCount - 1);
  // Calculate item width by dividing the remaining space
  return Math.floor((containerWidth - totalGapWidth) / columnsCount);
}

/**
 * Calculate item height, optionally accounting for date display
 */
export function calculateItemHeight(itemWidth: number, showDates: boolean = false): number {
  return itemWidth + (showDates ? 40 : 0);
}

/**
 * Calculate the number of rows needed based on item count and columns
 */
export function calculateRowCount(itemCount: number, columnsCount: number): number {
  return Math.ceil(itemCount / columnsCount);
}

/**
 * Calculate grid item index from row and column indices
 */
export function calculateItemIndex(rowIndex: number, columnIndex: number, columnsCount: number): number {
  return rowIndex * columnsCount + columnIndex;
}

/**
 * Check if an item exists at the given indices
 */
export function itemExistsAtIndex(rowIndex: number, columnIndex: number, columnsCount: number, totalItems: number): boolean {
  const index = calculateItemIndex(rowIndex, columnIndex, columnsCount);
  return index < totalItems;
}

/**
 * Calculate cell style with proper gap adjustments
 */
export function calculateCellStyle(
  originalStyle: React.CSSProperties,
  gap: number,
  isLastColumn: boolean = false,
  isLastRow: boolean = false
): React.CSSProperties {
  return {
    ...originalStyle,
    width: `${parseFloat(originalStyle.width as string) - (isLastColumn ? 0 : gap)}px`,
    height: `${parseFloat(originalStyle.height as string) - (isLastRow ? 0 : gap)}px`,
    padding: 0,
  };
}

/**
 * React hook for grid calculations with memoization
 */
export function useGridCalculations(
  containerWidth: number, 
  columnsCount: number, 
  gap: number = 8, 
  showDates: boolean = false
) {
  // Calculate item width with memoization
  const itemWidth = useMemo(() => {
    return calculateItemWidth(containerWidth, columnsCount, gap);
  }, [containerWidth, columnsCount, gap]);

  // Calculate item height with memoization
  const itemHeight = useMemo(() => {
    return calculateItemHeight(itemWidth, showDates);
  }, [itemWidth, showDates]);

  // Create cell style calculation function with memoization
  const getCellStyle = useMemo(() => {
    return (originalStyle: React.CSSProperties, isLastColumn: boolean = false, isLastRow: boolean = false) => {
      return calculateCellStyle(originalStyle, gap, isLastColumn, isLastRow);
    };
  }, [gap]);

  return {
    itemWidth,
    itemHeight,
    getCellStyle,
    gap
  };
}
