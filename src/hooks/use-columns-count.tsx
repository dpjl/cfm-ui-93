
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ViewModeType } from '@/types/gallery';

// Define types for different view modes
type SidePosition = 'left' | 'right';

// Default column counts for different modes
const DEFAULT_COLUMN_COUNTS = {
  'desktop': 5,              // Split view desktop
  'desktop-single': 6,       // Full screen view desktop
  'mobile-split': 2,         // Split view mobile
  'mobile-single': 4,        // Full screen view mobile
};

// Hook to manage column counts with localStorage persistence
export function useColumnsCount(position: SidePosition) {
  // Initialize states for each view mode with localStorage values or defaults
  const [desktopColumns, setDesktopColumns] = useState<number>(
    Number(localStorage.getItem(`columns-desktop-${position}`)) || DEFAULT_COLUMN_COUNTS.desktop
  );
  const [desktopSingleColumns, setDesktopSingleColumns] = useState<number>(
    Number(localStorage.getItem(`columns-desktop-single-${position}`)) || DEFAULT_COLUMN_COUNTS['desktop-single']
  );
  const [mobileSplitColumns, setMobileSplitColumns] = useState<number>(
    Number(localStorage.getItem(`columns-mobile-split-${position}`)) || DEFAULT_COLUMN_COUNTS['mobile-split']
  );
  const [mobileSingleColumns, setMobileSingleColumns] = useState<number>(
    Number(localStorage.getItem(`columns-mobile-single-${position}`)) || DEFAULT_COLUMN_COUNTS['mobile-single']
  );

  // Update localStorage when values change
  const updateDesktopColumns = useCallback((value: number) => {
    setDesktopColumns(value);
    localStorage.setItem(`columns-desktop-${position}`, value.toString());
  }, [position]);

  const updateDesktopSingleColumns = useCallback((value: number) => {
    setDesktopSingleColumns(value);
    localStorage.setItem(`columns-desktop-single-${position}`, value.toString());
  }, [position]);

  const updateMobileSplitColumns = useCallback((value: number) => {
    setMobileSplitColumns(value);
    localStorage.setItem(`columns-mobile-split-${position}`, value.toString());
  }, [position]);

  const updateMobileSingleColumns = useCallback((value: number) => {
    setMobileSingleColumns(value);
    localStorage.setItem(`columns-mobile-single-${position}`, value.toString());
  }, [position]);

  // Get the column count based on the view mode string
  const getColumnCount = (viewMode: ViewModeType | string): number => {
    switch (viewMode) {
      case 'desktop':
        return desktopColumns;
      case 'desktop-single':
        return desktopSingleColumns;
      case 'mobile-split':
        return mobileSplitColumns;
      case 'mobile-single':
        return mobileSingleColumns;
      default:
        console.warn(`Unknown view mode: ${viewMode}, defaulting to desktop columns`);
        return desktopColumns;
    }
  };

  // Function to update the appropriate column count based on view mode
  const updateColumnCount = useCallback((viewMode: ViewModeType | string, value: number) => {
    switch (viewMode) {
      case 'desktop':
        updateDesktopColumns(value);
        break;
      case 'desktop-single':
        updateDesktopSingleColumns(value);
        break;
      case 'mobile-split':
        updateMobileSplitColumns(value);
        break;
      case 'mobile-single':
        updateMobileSingleColumns(value);
        break;
      default:
        console.warn(`Unknown view mode for update: ${viewMode}`);
    }
  }, [updateDesktopColumns, updateDesktopSingleColumns, updateMobileSplitColumns, updateMobileSingleColumns]);

  return {
    desktopColumns,
    desktopSingleColumns,
    mobileSplitColumns,
    mobileSingleColumns,
    updateDesktopColumns,
    updateDesktopSingleColumns,
    updateMobileSplitColumns,
    updateMobileSingleColumns,
    getColumnCount,
    updateColumnCount
  };
}
