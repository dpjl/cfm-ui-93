
import React, { memo, useEffect, useState, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
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
  
  // Calculate dimensions
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate optimal item size
  const gap = 8; // 2rem converted to px (matches the gap-2 class)
  const itemWidth = Math.floor((containerSize.width - (gap * (columnsCount - 1))) / columnsCount);
  const itemHeight = itemWidth + (showDates ? 40 : 0); // Add space for date display if needed
  
  // Calculate rows needed
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
  // Update container size on mount and when columns change
  useEffect(() => {
    const updateSize = () => {
      if (parentRef.current) {
        setContainerSize({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight,
        });
      }
    };
    
    updateSize();
    
    const resizeObserver = new ResizeObserver(updateSize);
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }
    
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, [columnsCount]);
  
  // Reset scroll position when columns or data changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTo({ scrollTop: 0, scrollLeft: 0 });
    }
  }, [columnsCount, mediaIds]);
  
  // Render each cell of the grid
  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnsCount + columnIndex;
    if (index >= mediaIds.length) return null;
    
    const id = mediaIds[index];
    
    // Apply gap spacing to the style
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
          selected={selectedIds.includes(id)}
          onSelect={onSelectId}
          index={index}
          showDates={showDates}
          updateMediaInfo={updateMediaInfo}
          position={position}
        />
      </div>
    );
  };
  
  return (
    <div ref={parentRef} className="w-full h-full p-2">
      {containerSize.width > 1 && (
        <FixedSizeGrid
          ref={gridRef}
          columnCount={columnsCount}
          columnWidth={itemWidth}
          height={containerSize.height}
          rowCount={rowCount}
          rowHeight={itemHeight}
          width={containerSize.width}
          itemData={mediaIds}
          overscanRowCount={2}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
});

// Set display name for debugging
VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
