
/**
 * Utility functions for gallery grid calculations
 */

/**
 * Calculate item width based on container width, column count, and gap
 * Using improved calculation to distribute space evenly
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Get available space after accounting for gaps
  const availableWidth = containerWidth - gap * (columnsCount - 1);
  // Calculate width per column and ensure it's a number that will use all available space
  return availableWidth / columnsCount;
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
 * Calculate adjusted style for a grid cell to account for gaps properly
 */
export function calculateGridCellStyle(style: React.CSSProperties, gap: number, isLastColumn: boolean = false): React.CSSProperties {
  return {
    ...style,
    width: `${parseFloat(style.width as string) - (isLastColumn ? 0 : gap)}px`,
    height: `${parseFloat(style.height as string) - gap}px`,
    left: `${parseFloat(style.left as string)}px`,
    top: `${parseFloat(style.top as string)}px`,
    padding: 0,
  };
}
