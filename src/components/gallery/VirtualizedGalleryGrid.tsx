
import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';
import LazyMediaItem from '@/components/LazyMediaItem';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useIsMobile } from '@/hooks/use-breakpoint';
import AutoSizer from 'react-virtualized-auto-sizer';

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
  const prevSelectedIdsRef = useRef<string[]>(selectedIds);
  
  // Calculate optimal item size
  const gap = 8; // 2rem converted to px (matches the gap-2 class)
  
  // Calculate rows needed
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
  // Reset scroll position when columns or data changes (but not when only selection changes)
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTo({ scrollTop: 0, scrollLeft: 0 });
    }
  }, [columnsCount, mediaIds]);
  
  // Force re-render of only the cells that changed selection state
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Get set of IDs that changed selection state
    const prevSelectedSet = new Set(prevSelectedIdsRef.current);
    const currentSelectedSet = new Set(selectedIds);
    
    // Find IDs that were added or removed from selection
    const changedIds = new Set([
      ...prevSelectedIdsRef.current.filter(id => !currentSelectedSet.has(id)),
      ...selectedIds.filter(id => !prevSelectedSet.has(id))
    ]);
    
    // Update ref for next comparison
    prevSelectedIdsRef.current = selectedIds;
    
    // If no selection changes, nothing to do
    if (changedIds.size === 0) return;
    
    // Au lieu d'utiliser resetAfterIndices qui n'existe pas, on force la grille entière à être mise à jour
    if (gridRef.current) {
      // Forcer la mise à jour de toute la grille
      gridRef.current.forceUpdate();
    }
  }, [selectedIds, mediaIds, columnsCount]);
  
  // Memoized version of onSelectId to prevent unnecessary renders when selecting items
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    onSelectId(id, extendSelection);
  }, [onSelectId]);
  
  // Memoize ItemData to prevent unnecessary renders
  const itemData = React.useMemo(() => ({
    mediaIds,
    selectedIds,
    onSelectId: handleSelectItem,
    showDates,
    updateMediaInfo,
    position,
    columnsCount,
    gap
  }), [mediaIds, selectedIds, handleSelectItem, showDates, updateMediaInfo, position, columnsCount, gap]);
  
  // Memoize the Cell component to prevent unnecessary re-renders
  const Cell = useCallback(({ columnIndex, rowIndex, style, data }: { 
    columnIndex: number; 
    rowIndex: number; 
    style: React.CSSProperties;
    data: any;
  }) => {
    const index = rowIndex * data.columnsCount + columnIndex;
    if (index >= data.mediaIds.length) return null;
    
    const id = data.mediaIds[index];
    const isSelected = data.selectedIds.includes(id);
    
    // Apply gap spacing to the style
    const adjustedStyle = {
      ...style,
      left: `${parseFloat(style.left as string) + (columnIndex * data.gap)}px`,
      top: `${parseFloat(style.top as string) + (rowIndex * data.gap)}px`,
      width: `${parseFloat(style.width as string) - data.gap}px`,
      height: `${parseFloat(style.height as string) - data.gap}px`,
      padding: 0,
    };
    
    return (
      <div style={adjustedStyle}>
        <LazyMediaItem
          key={id}
          id={id}
          selected={isSelected}
          onSelect={data.onSelectId}
          index={index}
          showDates={data.showDates}
          updateMediaInfo={data.updateMediaInfo}
          position={data.position}
        />
      </div>
    );
  }, []);
  
  return (
    <div className="w-full h-full p-2">
      <AutoSizer>
        {({ height, width }) => {
          // Calculate item size based on available width
          const itemWidth = Math.floor((width - (gap * (columnsCount - 1))) / columnsCount);
          const itemHeight = itemWidth + (showDates ? 40 : 0); // Add space for date display if needed
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnsCount}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemHeight}
              width={width}
              itemData={itemData}
              overscanRowCount={2}
              overscanColumnCount={1}
              // Use a stable itemKey to improve render efficiency
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnsCount + columnIndex;
                return index < mediaIds.length ? mediaIds[index] : `empty-${rowIndex}-${columnIndex}`;
              }}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

// Set display name for debugging
VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
