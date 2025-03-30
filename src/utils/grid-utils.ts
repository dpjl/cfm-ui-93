
/**
 * Utility functions for gallery grid calculations
 */

/**
 * Calculate the scrollbar width for the current browser/OS
 * This uses a more accurate approach than fixed values
 */
export function getScrollbarWidth(): number {
  // Default to 15px as a safe estimate if calculation fails
  let scrollbarWidth = 15;
  
  // Only run in browser environment
  if (typeof document !== 'undefined') {
    // Create a temporary div to measure scrollbar width
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    // Create an inner div
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    // Calculate the difference in width
    scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    
    // Clean up
    if (outer.parentNode) {
      outer.parentNode.removeChild(outer);
    }
  }
  
  // Ensure we have at least a minimum width (for styled scrollbars)
  return Math.max(scrollbarWidth, 12);
}

/**
 * Calculate item width based on container width, column count, and gap
 * Using a more precise calculation to avoid cumulative rounding errors
 */
export function calculateItemWidth(containerWidth: number, columnsCount: number, gap: number = 8): number {
  // Account for scrollbar width
  const scrollbarWidth = getScrollbarWidth();
  const availableWidth = Math.max(containerWidth - scrollbarWidth, 0);
  
  // Calculate the total gap width
  const totalGapWidth = gap * (columnsCount - 1);
  // Calculate item width with more precision (using Math.floor to avoid overflow)
  return Math.floor((availableWidth - totalGapWidth) / columnsCount);
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
  // Get accurate scrollbar width
  const scrollbarWidth = getScrollbarWidth();
  
  // Calculate total available width for items (account for scrollbar)
  const availableWidth = Math.max(containerWidth - scrollbarWidth, 0);
  
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
    columnsCount,
    scrollbarWidth
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
