
/**
 * Utility functions for gallery grid calculations
 */

/**
 * Calculate item width based on container width, column count, and gap
 * Using a more precise calculation to avoid cumulative rounding errors
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Calculate the total gap width
  const totalGapWidth = gap * (columnsCount - 1);
  // Calculate item width with more precision (using Math.ceil to avoid empty space)
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
 * Calculate grid parameters including width and height adjustments
 * This function provides all necessary dimensions for a responsive grid
 */
export function calculateGridParameters(
  containerWidth: number,
  columnsCount: number,
  gap: number = 8,
  showDates: boolean = false
) {
  // Calculate total available width for items (account for right scrollbar)
  const availableWidth = containerWidth - 2; // Subtract scrollbar width approximation
  
  // Calculate the total gap width
  const totalGapWidth = gap * (columnsCount - 1);
  
  // Calculate item width with more precision
  const rawItemWidth = (availableWidth - totalGapWidth) / columnsCount;
  const itemWidth = Math.floor(rawItemWidth);
  
  // Calculate effective total width (to avoid cumulative errors)
  const effectiveGridWidth = (itemWidth * columnsCount) + totalGapWidth;
  
  // Calculate leftover space that needs to be distributed
  const leftoverSpace = availableWidth - effectiveGridWidth;
  
  // Calculate item height based on width
  const itemHeight = calculateItemHeight(itemWidth, showDates);

  return {
    itemWidth,
    itemHeight,
    gap,
    leftoverSpace,
    effectiveGridWidth,
    containerWidth,
    columnsCount
  };
}

/**
 * Calculate cell style with proper gap adjustments
 * Now with more precise gap and size handling
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
