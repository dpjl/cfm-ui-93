
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface YearAnchor {
  year: number;
  index: number; // First media index for this year
}

interface YearAnchorsProps {
  mediaIds: string[];
  mediaInfoMap: Map<string, any>;
  containerRef: React.RefObject<HTMLDivElement>;
  onYearClick: (index: number) => void;
  currentYear: number | null;
}

const YearAnchors: React.FC<YearAnchorsProps> = ({
  mediaIds,
  mediaInfoMap,
  containerRef,
  onYearClick,
  currentYear
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [yearAnchors, setYearAnchors] = useState<YearAnchor[]>([]);
  
  // Analyze media info to extract unique years and their first indices
  useEffect(() => {
    if (mediaIds.length === 0 || mediaInfoMap.size === 0) return;
    
    const years = new Map<number, number>();
    
    mediaIds.forEach((id, index) => {
      const info = mediaInfoMap.get(id);
      if (info?.createdAt) {
        const year = new Date(info.createdAt).getFullYear();
        if (!years.has(year)) {
          years.set(year, index);
        }
      }
    });
    
    // Convert to array and sort by year
    const anchorsArray: YearAnchor[] = Array.from(years.entries())
      .map(([year, index]) => ({ year, index }))
      .sort((a, b) => a.year - b.year);
    
    setYearAnchors(anchorsArray);
  }, [mediaIds, mediaInfoMap]);
  
  // Handle scrolling state to show/hide the anchors
  useEffect(() => {
    const scrollElement = containerRef.current?.querySelector('.gallery-scrollbar');
    if (!scrollElement) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Hide anchors after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1500); // Keep visible for 1.5s after scrolling stops
    };
    
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [containerRef]);
  
  // Handle year anchor click
  const handleYearClick = useCallback((index: number) => {
    onYearClick(index);
  }, [onYearClick]);
  
  if (yearAnchors.length === 0) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isScrolling && (
        <motion.div 
          className={`year-anchors-container ${isScrolling ? 'visible' : ''}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          {yearAnchors.map(({ year, index }) => (
            <div 
              key={year}
              className={`year-anchor ${currentYear === year ? 'current' : ''}`}
              onClick={() => handleYearClick(index)}
            >
              <Calendar className="h-3 w-3 inline-block mr-1" />
              {year}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default YearAnchors;
