
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
  
  // Force full re-render when items or columns change
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [items.length, columnCount]);

  const cellRenderer = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    
    // Return empty cell if index is out of bounds
    if (index >= items.length) {
      return <div style={style}></div>;
    }
    
    // IMPORTANT: Pour corriger le problème de défilement, ne manipulons pas 
    // les valeurs "top" et "left" du style, car react-window s'occupe déjà 
    // du positionnement correct. Ajustons seulement width et height pour les gaps.
    const adjustedStyle = {
      ...style,
      width: `calc(${style.width}px - ${columnGap}px)`,
      height: `calc(${style.height}px - ${rowGap}px)`,
      padding: '4px',
    };
    
    return renderItem(items[index], adjustedStyle);
  }, [items, columnCount, columnGap, rowGap, renderItem]);

  // Calculate dimensions including gaps
  const getItemWidth = (width: number) => {
    // Calcul correct de la largeur des éléments en tenant compte des gaps
    return (width - (columnGap * (columnCount - 1))) / columnCount;
  };
  
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
            itemData={items} // Fournir les items comme données
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
