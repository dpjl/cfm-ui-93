
/**
 * Utility functions for gallery grid calculations
 */

/**
 * Calculate item width based on container width, column count, and gap
 * Using a more precise calculation to avoid cumulative rounding errors
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Calculate total gap width between columns
  const totalGapWidth = gap * (columnsCount - 1);
  
  // Calculate the available width for all items
  const availableWidth = containerWidth - totalGapWidth;
  
  // Calculate base item width with potential fractional part
  const exactItemWidth = availableWidth / columnsCount;
  
  // Use ceiling instead of floor to maximize space utilization
  // This prevents accumulation of empty space on the right
  return Math.ceil(exactItemWidth);
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
 * with optimal space utilization
 */
export function calculateGridParameters(
  containerWidth: number,
  columnsCount: number,
  gap: number = 8,
  showDates: boolean = false
) {
  // Ensure we're working with a valid container width
  const availableWidth = Math.max(containerWidth, 0);
  
  // Calculate total gap width
  const totalGapWidth = gap * (columnsCount - 1);
  
  // Calculate exact item width to optimize space utilization
  const exactItemWidth = (availableWidth - totalGapWidth) / columnsCount;
  
  // Use ceiling to maximize space usage and avoid right-side gaps
  const itemWidth = Math.ceil(exactItemWidth);
  
  // Calculate total width used by all items
  const totalItemsWidth = itemWidth * columnsCount;
  
  // Calculate total width including gaps
  const effectiveGridWidth = totalItemsWidth + totalGapWidth;
  
  // Calculate item height based on width
  const itemHeight = calculateItemHeight(itemWidth, showDates);
  
  return {
    itemWidth,
    itemHeight,
    gap,
    effectiveGridWidth,
    containerWidth: availableWidth,
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
    width: `${parseFloat(originalStyle.width as string)}px`,
    height: `${parseFloat(originalStyle.height as string)}px`,
    paddingRight: gap,
    paddingBottom: gap,
    boxSizing: 'border-box',
  };
}
