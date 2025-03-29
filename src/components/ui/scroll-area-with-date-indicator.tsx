
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
  const [customScrollbarVisible, setCustomScrollbarVisible] = useState(false);
  const isMobile = useIsMobile();
  const scrollTimerRef = useRef<number | null>(null);

  // Calculer le pourcentage de défilement
  const scrollPercentage = contentHeight > containerHeight 
    ? scrollTop / (contentHeight - containerHeight) 
    : 0;
  
  // Déterminer la position du custom scrollbar handle
  const handleTopPosition = containerHeight * scrollPercentage;
  
  // Hauteur relative du handle par rapport à la taille du contenu
  const handleHeightPercentage = contentHeight > 0
    ? Math.min(1, containerHeight / contentHeight)
    : 0;
  
  const handleHeight = Math.max(30, containerHeight * handleHeightPercentage);

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
            
            // Afficher la scrollbar uniquement si le contenu est plus grand que le conteneur
            setCustomScrollbarVisible(content.scrollHeight > container.clientHeight);
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
  
  // Gestion du drag de la scrollbar custom
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startScrollTop = scrollTop;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollRef.current) return;
      
      const deltaY = e.clientY - startY;
      const scrollFactor = (contentHeight - containerHeight) / (containerHeight - handleHeight);
      const newScrollTop = Math.max(0, Math.min(contentHeight - containerHeight, startScrollTop + deltaY * scrollFactor));
      
      scrollRef.current.scrollTop = newScrollTop;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsScrolling(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    setIsScrolling(true);
  };
  
  // Gestion du touch pour mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    
    const startY = e.touches[0].clientY;
    const startScrollTop = scrollTop;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!scrollRef.current || e.touches.length !== 1) return;
      
      const deltaY = e.touches[0].clientY - startY;
      const scrollFactor = (contentHeight - containerHeight) / (containerHeight - handleHeight);
      const newScrollTop = Math.max(0, Math.min(contentHeight - containerHeight, startScrollTop + deltaY * scrollFactor));
      
      scrollRef.current.scrollTop = newScrollTop;
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      setIsScrolling(false);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    setIsScrolling(true);
  };

  return (
    <div className="relative h-full" ref={scrollRef}>
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

      {/* Custom scrollbar handle */}
      {customScrollbarVisible && (
        <div 
          className={cn(
            "scrollbar-handle",
            isScrolling ? "opacity-80" : "opacity-40"
          )}
          style={{
            height: `${handleHeight}px`,
            top: `${handleTopPosition}px`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      )}
    </div>
  );
});

ScrollAreaWithDateIndicator.displayName = 'ScrollAreaWithDateIndicator';
