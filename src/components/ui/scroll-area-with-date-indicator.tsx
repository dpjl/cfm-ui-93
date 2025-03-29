
import React, { useRef, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { DetailedMediaInfo } from '@/api/imageApi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScrollAreaWithDateIndicatorProps extends React.ComponentPropsWithoutRef<typeof ScrollArea> {
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  mediaInfoMap?: Map<string, DetailedMediaInfo | null>;
  mediaIds?: string[];
}

export const ScrollAreaWithDateIndicator = React.forwardRef<
  HTMLDivElement,
  ScrollAreaWithDateIndicatorProps
>(({ className, children, onScroll, mediaInfoMap, mediaIds, ...props }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const isMobile = useIsMobile();
  const scrollTimerRef = useRef<number | null>(null);

  // Gérer le défilement
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    
    // Reset scroll state after a delay
    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current);
    }
    
    scrollTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimerRef.current = null;
    }, 1000);
    
    // Call parent's onScroll if provided
    if (onScroll) {
      onScroll(e);
    }
  };
  
  // Mettre à jour les dimensions lorsque le contenu change
  useEffect(() => {
    if (scrollRef.current) {
      const updateDimensions = () => {
        if (scrollRef.current) {
          const container = scrollRef.current;
          const content = container.querySelector('[data-radix-scroll-area-viewport] > div') as HTMLElement;
          
          if (container && content) {
            setContainerHeight(container.clientHeight);
            setContentHeight(content.scrollHeight);
          }
        }
      };
      
      updateDimensions();
      
      // Observer les changements de taille
      const resizeObserver = new ResizeObserver(updateDimensions);
      
      if (scrollRef.current) {
        resizeObserver.observe(scrollRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [mediaIds, children]);

  // Calculer les propriétés de la scrollbar
  const scrollPercentage = contentHeight > containerHeight 
    ? scrollTop / (contentHeight - containerHeight) 
    : 0;
  
  const handleHeight = Math.max(30, containerHeight * Math.min(1, containerHeight / contentHeight));
  const handleTopPosition = (containerHeight - handleHeight) * scrollPercentage;
  const showScrollbar = contentHeight > containerHeight;

  return (
    <div className="relative h-full overflow-hidden" ref={scrollRef}>
      <ScrollArea
        className={cn("h-full w-full", className, isScrolling && "scrolling")}
        onScroll={handleScroll}
        {...props}
      >
        {children}
      </ScrollArea>

      {/* Indicateurs de traction pour mobile */}
      {isMobile && (
        <>
          <div className={cn(
            "scrollbar-pull-tab top",
            isScrolling ? "" : "faded",
            scrollTop > 10 ? "opacity-100" : "opacity-0"
          )} />
          <div className={cn(
            "scrollbar-pull-tab bottom",
            isScrolling ? "" : "faded",
            scrollTop < contentHeight - containerHeight - 10 ? "opacity-100" : "opacity-0"
          )} />
        </>
      )}

      {/* Custom scrollbar handle - Simplified */}
      {showScrollbar && (
        <div 
          className={cn(
            "scrollbar-handle",
            isScrolling ? "opacity-80" : "opacity-40"
          )}
          style={{
            height: `${handleHeight}px`,
            top: `${handleTopPosition}px`,
          }}
        />
      )}
    </div>
  );
});

ScrollAreaWithDateIndicator.displayName = 'ScrollAreaWithDateIndicator';
