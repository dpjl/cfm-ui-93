
import { useState, useEffect, useCallback, RefObject } from 'react';
import { FixedSizeGrid } from 'react-window';

type MediaInfoMap = Map<string, { createdAt: string | null; [key: string]: any }>;

export function useGalleryYearTracking(
  mediaIds: string[],
  mediaInfoMap: MediaInfoMap,
  gridRef: RefObject<FixedSizeGrid>,
  columnsCount: number
) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  
  // Calculate the year from date string
  const getYear = useCallback((dateString: string | null): number | null => {
    if (!dateString) return null;
    try {
      return new Date(dateString).getFullYear();
    } catch (e) {
      console.error('Error parsing date:', e);
      return null;
    }
  }, []);
  
  // Get year from media ID
  const getYearFromMediaId = useCallback((id: string): number | null => {
    const info = mediaInfoMap.get(id);
    if (!info?.createdAt) return null;
    return getYear(info.createdAt);
  }, [mediaInfoMap, getYear]);
  
  // Scroll to a specific media index
  const scrollToIndex = useCallback((index: number) => {
    if (!gridRef.current) return;
    
    const rowIndex = Math.floor(index / columnsCount);
    gridRef.current.scrollToItem({
      rowIndex,
      align: 'start'
    });
  }, [gridRef, columnsCount]);
  
  // Update current year based on visible items
  const updateCurrentYear = useCallback(() => {
    if (!gridRef.current || mediaIds.length === 0 || mediaInfoMap.size === 0) return;
    
    // Get current scroll position
    const grid = gridRef.current;
    const { scrollTop, clientHeight } = grid.state;
    
    // Estimate the row index based on scroll position
    const rowHeight = grid.props.rowHeight as number;
    const visibleRowStart = Math.floor(scrollTop / rowHeight);
    
    // Get the first visible media ID
    const startIndex = visibleRowStart * columnsCount;
    const visibleId = startIndex < mediaIds.length ? mediaIds[startIndex] : null;
    
    if (visibleId) {
      const year = getYearFromMediaId(visibleId);
      if (year !== currentYear) {
        setCurrentYear(year);
      }
    }
  }, [mediaIds, mediaInfoMap, gridRef, columnsCount, getYearFromMediaId, currentYear]);
  
  // Set up scroll event listener
  useEffect(() => {
    if (!gridRef.current) return;
    
    const grid = gridRef.current;
    const scrollElement = grid._outerRef;
    
    const handleScroll = () => {
      updateCurrentYear();
    };
    
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateCurrentYear();
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [gridRef, updateCurrentYear]);
  
  return {
    currentYear,
    scrollToIndex
  };
}
