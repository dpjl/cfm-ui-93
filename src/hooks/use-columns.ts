
import { useState, useEffect, RefObject } from 'react';
import { useMediaQuery } from './use-media-query';

export const useColumns = (
  containerRef: RefObject<HTMLElement>,
  minColumnWidth = 180,
  gap = 16
) => {
  const [columns, setColumns] = useState(3);
  const [columnWidth, setColumnWidth] = useState(0);
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      let baseColumnCount;
      
      if (isMobile) {
        baseColumnCount = 2;
      } else if (isTablet) {
        baseColumnCount = 3;
      } else {
        baseColumnCount = Math.floor((containerWidth - gap) / (minColumnWidth + gap));
      }
      
      const actualColumns = Math.max(1, baseColumnCount);
      setColumns(actualColumns);
      
      // Calculer la largeur d'une colonne
      const calculatedWidth = (containerWidth - (gap * (actualColumns - 1))) / actualColumns;
      setColumnWidth(calculatedWidth);
    };
    
    updateColumns();
    
    const observer = new ResizeObserver(updateColumns);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, minColumnWidth, gap, isMobile, isTablet]);
  
  return { columns, columnWidth };
};
