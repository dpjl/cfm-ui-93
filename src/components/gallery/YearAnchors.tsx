
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

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
  uniqueYears: YearAnchor[];
}

const YearAnchors: React.FC<YearAnchorsProps> = ({
  containerRef,
  onYearClick,
  currentYear,
  uniqueYears
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle scrolling state to show/hide the anchors
  useEffect(() => {
    const scrollElement = containerRef.current?.querySelector('.gallery-scrollbar');
    if (!scrollElement) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsVisible(true);
      
      // Clear previous timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Hide anchors after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsVisible(false);
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
  
  if (uniqueYears.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`year-anchors-container ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {uniqueYears.map(({ year, index }) => (
        <div 
          key={year}
          className={`year-anchor ${currentYear === year ? 'current' : ''}`}
          onClick={() => onYearClick(index)}
        >
          <Calendar className="h-3 w-3 inline-block mr-1" />
          {year}
        </div>
      ))}
    </div>
  );
};

export default YearAnchors;
