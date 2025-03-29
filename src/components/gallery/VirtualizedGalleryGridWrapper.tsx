
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { MediaItem } from '../../types/gallery';
import { useGalleryMediaTracking } from '@/hooks/use-gallery-media-tracking';
import { calculateRowCount } from '@/utils/grid-utils';

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
  const gridRef = useRef<FixedSizeGrid | null>(null);
  const [key, setKey] = useState(0);
  const itemIds = items.map(item => item.id);
  
  // Utiliser notre hook de suivi des médias
  useGalleryMediaTracking(itemIds, gridRef);
  
  // Calculer le nombre de lignes en fonction des éléments et des colonnes
  const rowCount = calculateRowCount(items.length, columnCount);
  
  // Forcer une réinitialisation complète lorsque les éléments ou les colonnes changent
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [items.length, columnCount]);

  // Create a memoized function to calculate item dimensions
  const getItemSize = useMemo(() => {
    return (width: number) => {
      return Math.floor((width - (columnGap * (columnCount - 1))) / columnCount);
    };
  }, [columnCount, columnGap]);

  const cellRenderer = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    
    // Retourner une cellule vide si l'index est hors limites
    if (index >= items.length) {
      return <div style={style}></div>;
    }
    
    // Ajuster le style uniquement pour la largeur et la hauteur (pour les espaces)
    const adjustedStyle = {
      ...style,
      width: `calc(${style.width}px - ${columnGap}px)`,
      height: `calc(${style.height}px - ${rowGap}px)`,
      padding: '4px',
    };
    
    return renderItem(items[index], adjustedStyle);
  }, [items, columnCount, columnGap, rowGap, renderItem]);

  return (
    <div className="w-full h-full">
      <AutoSizer key={`gallery-grid-${key}`}>
        {({ height, width }) => {
          const itemWidth = getItemSize(width);
          
          return (
            <FixedSizeGrid
              ref={gridRef}
              columnCount={columnCount}
              columnWidth={itemWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={itemSize}
              width={width}
              overscanRowCount={5}
              overscanColumnCount={2}
              itemKey={({ columnIndex, rowIndex }) => {
                const index = rowIndex * columnCount + columnIndex;
                return index < items.length ? items[index].id : `empty-${rowIndex}-${columnIndex}`;
              }}
            >
              {cellRenderer}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedGalleryGridWrapper;
