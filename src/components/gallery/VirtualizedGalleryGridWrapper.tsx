
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { MediaItem } from '../../types/gallery';

interface VirtualizedGalleryGridWrapperProps {
  items: MediaItem[];
  columnCount: number;
  rowGap?: number;
  columnGap?: number;
  itemSize?: number; 
  renderItem: (item: MediaItem, style: React.CSSProperties) => React.ReactNode;
}

const VirtualizedGalleryGridWrapper: React.FC<VirtualizedGalleryGridWrapperProps> = ({
  items,
  columnCount,
  rowGap = 8,
  columnGap = 8,
  itemSize = 200,
  renderItem
}) => {
  const gridRef = useRef<Grid | null>(null);
  const [key, setKey] = useState(0);

  // Calculate rows based on items and columns
  const rowCount = Math.ceil(items.length / columnCount);
  
  useEffect(() => {
    // Force rerender when items or columnCount changes by changing the key
    setKey(prev => prev + 1);
  }, [items.length, columnCount]);

  const cellRenderer = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    
    // Return empty cell if index is out of bounds
    if (index >= items.length) {
      return <div style={style}></div>;
    }
    
    // Apply gaps to style
    const adjustedStyle = {
      ...style,
      left: Number(style.left) + columnGap * columnIndex,
      top: Number(style.top) + rowGap * rowIndex,
      width: Number(style.width) - columnGap,
      height: Number(style.height) - rowGap,
      padding: '4px',
    };
    
    return renderItem(items[index], adjustedStyle);
  }, [items, columnCount, columnGap, rowGap, renderItem]);

  // Calculate dimensions including gaps
  const getItemWidth = (width: number) => (width - (columnGap * (columnCount - 1))) / columnCount;
  const getItemHeight = () => itemSize;

  return (
    <div className="w-full h-full">
      <AutoSizer key={`gallery-grid-${key}`}>
        {({ height, width }) => (
          <Grid
            ref={gridRef}
            columnCount={columnCount}
            columnWidth={getItemWidth(width)}
            height={height}
            rowCount={rowCount}
            rowHeight={getItemHeight()}
            width={width}
            itemKey={({ columnIndex, rowIndex }) => {
              const index = rowIndex * columnCount + columnIndex;
              return index < items.length ? items[index].id : `empty-${rowIndex}-${columnIndex}`;
            }}
          >
            {cellRenderer}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedGalleryGridWrapper;
