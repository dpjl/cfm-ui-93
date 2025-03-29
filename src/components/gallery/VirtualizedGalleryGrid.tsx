
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { calculateGridParameters } from '@/utils/grid-calculations';
import LazyMediaItem from '@/components/LazyMediaItem';
import { useGalleryContext } from '@/hooks/use-gallery-context';

interface VirtualizedGalleryGridProps {
  mediaIds: string[];
  selectedIds: string[];
  onSelectId: (id: string, extendSelection: boolean) => void;
  columnsCount: number;
  viewMode?: 'single' | 'split';
  position: 'source' | 'destination';
}

const VirtualizedGalleryGrid: React.FC<VirtualizedGalleryGridProps> = ({
  mediaIds,
  selectedIds,
  onSelectId,
  columnsCount,
  viewMode = 'single',
  position,
}) => {
  // Use the context for updating media info
  const { updateMediaInfo } = useGalleryContext();
  
  // Calculate grid parameters
  const { rowHeight, columnWidth, totalWidth, totalHeight, rowCount } = 
    calculateGridParameters(mediaIds.length, columnsCount);
  
  // Function to determine if an item is loaded
  const isItemLoaded = (index: number) => {
    return index < mediaIds.length;
  };
  
  // Define key for items
  const itemKey = ({ columnIndex, rowIndex }: { columnIndex: number, rowIndex: number }) => {
    const index = rowIndex * columnsCount + columnIndex;
    return index < mediaIds.length ? mediaIds[index] : `placeholder-${index}`;
  };
  
  // Render item cell
  const renderGridItem = React.useCallback(({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: React.CSSProperties }) => {
    const index = rowIndex * columnsCount + columnIndex;
    
    // Return empty cell if we've rendered all items
    if (index >= mediaIds.length) {
      return <div style={style} className="gallery-grid-item empty" />;
    }
    
    const id = mediaIds[index];
    const isSelected = selectedIds.includes(id);
    
    return (
      <div style={style} className="gallery-grid-item">
        <LazyMediaItem
          id={id}
          selected={isSelected}
          onSelect={onSelectId}
          index={index}
          updateMediaInfo={updateMediaInfo}
          position={position}
        />
      </div>
    );
  }, [mediaIds, selectedIds, onSelectId, columnsCount, updateMediaInfo, position]);
  
  return (
    <div className="w-full h-full">
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={mediaIds.length}
            loadMoreItems={() => {}}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeGrid
                ref={ref}
                columnCount={columnsCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
                onItemsRendered={gridProps => {
                  const { visibleRowStartIndex, visibleRowStopIndex, visibleColumnStartIndex, visibleColumnStopIndex } = gridProps;
                  
                  const visibleStartIndex = visibleRowStartIndex * columnsCount + visibleColumnStartIndex;
                  const visibleStopIndex = visibleRowStopIndex * columnsCount + visibleColumnStopIndex;
                  
                  onItemsRendered({
                    visibleStartIndex,
                    visibleStopIndex,
                  });
                }}
                itemKey={itemKey}
              >
                {renderGridItem}
              </FixedSizeGrid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedGalleryGrid;
