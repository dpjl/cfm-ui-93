
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
  const previousDimensionsRef = useRef<{width: number, height: number}>({width: 0, height: 0});
  
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
    
    // IMPORTANT: Ne pas manipuler les positions top/left contrôlées par react-window
    // Ajuster uniquement width et height pour les gaps
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
    return Math.floor((width - (columnGap * (columnCount - 1))) / columnCount);
  };
  
  const getItemHeight = () => itemSize;

  return (
    <div className="w-full h-full">
      <AutoSizer key={`gallery-grid-${key}`}>
        {({ height, width }) => {
          // Si les dimensions changent significativement, forcer la mise à jour du grid
          const dimensionsChanged = 
            Math.abs(previousDimensionsRef.current.width - width) > 5 || 
            Math.abs(previousDimensionsRef.current.height - height) > 5;
          
          if (dimensionsChanged) {
            previousDimensionsRef.current = { width, height };
            // On ne change pas le key ici, car cela provoquerait une boucle infinie
            // Mais on force la mise à jour du grid si nécessaire
            if (gridRef.current) {
              setTimeout(() => {
                gridRef.current?.forceUpdate();
              }, 0);
            }
          }
          
          // Calculer la largeur des éléments
          const itemWidth = getItemWidth(width);
          const itemHeight = getItemHeight();
          
          return (
            <Grid
              ref={gridRef}
              columnCount={columnCount}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemHeight}
              width={width}
              overscanRowCount={5} // Augmenter pour un meilleur défilement
              overscanColumnCount={2}
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnCount + columnIndex;
                return index < items.length ? items[index].id : `empty-${rowIndex}-${columnIndex}`;
              }}
            >
              {cellRenderer}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedGalleryGridWrapper;
