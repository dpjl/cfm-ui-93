
import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import LazyMediaItem from '@/components/LazyMediaItem';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface VirtualizedGalleryGridProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string, extendSelection: boolean) => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  showDates?: boolean;
  updateMediaInfo?: (id: string, info: DetailedMediaInfo) => void;
  position: 'source' | 'destination';
}

const VirtualizedGalleryGrid = memo(({
  mediaIds,
  selectedIds,
  onSelectId,
  columnsCount = 5,
  viewMode = 'single',
  showDates = false,
  updateMediaInfo,
  position = 'source'
}: VirtualizedGalleryGridProps) => {
  const isMobile = useIsMobile();
  const gridRef = useRef<FixedSizeGrid>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Optimisation - Set pour lookups O(1)
  const selectedIdsSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  
  const gap = 8;
  
  // Nettoyage des timeouts au démontage
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Gestion du scrolling avec debounce simple
  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 150);
  }, []);
  
  const Cell = useCallback(({ columnIndex, rowIndex, style }: { 
    columnIndex: number; rowIndex: number; style: React.CSSProperties 
  }) => {
    const index = rowIndex * columnsCount + columnIndex;
    if (index >= mediaIds.length) return null;
    
    const id = mediaIds[index];
    const isSelected = selectedIdsSet.has(id);
    
    // Style simplifié
    const adjustedStyle = {
      ...style,
      left: `${parseFloat(style.left as string) + (columnIndex * gap)}px`,
      top: `${parseFloat(style.top as string) + (rowIndex * gap)}px`,
      width: `${parseFloat(style.width as string) - gap}px`,
      height: `${parseFloat(style.height as string) - gap}px`,
      padding: 0,
    };
    
    return (
      <div style={adjustedStyle}>
        <LazyMediaItem
          key={id}
          id={id}
          selected={isSelected}
          onSelect={onSelectId}
          index={index}
          showDates={showDates}
          updateMediaInfo={updateMediaInfo}
          position={position}
          isScrolling={isScrolling}
        />
      </div>
    );
  }, [mediaIds, selectedIdsSet, columnsCount, gap, showDates, updateMediaInfo, position, onSelectId, isScrolling]);
  
  const rowCount = React.useMemo(() => 
    Math.ceil(mediaIds.length / columnsCount), 
    [mediaIds.length, columnsCount]
  );
  
  return (
    <div className="w-full h-full p-2">
      <AutoSizer>
        {({ width, height }) => {
          const itemWidth = Math.floor((width - (gap * (columnsCount - 1))) / columnsCount);
          const itemHeight = itemWidth + (showDates ? 28 : 0);
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemHeight}
              width={width}
              overscanRowCount={5}
              onScroll={handleScroll}
              style={{ overflowX: 'hidden' }}
              useIsScrolling={true}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
