
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
  const [gridKey, setGridKey] = useState(0);
  const previousSizeRef = useRef({ width: 0, height: 0 });
  const prevMediaIdsRef = useRef<string[]>(mediaIds);
  const prevSelectedIdsRef = useRef<string[]>(selectedIds);
  
  // Détecter les changements de dimensions du conteneur parent
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        // Vérifier si le changement est significatif pour éviter les mises à jour inutiles
        if (
          Math.abs(previousSizeRef.current.width - width) > 5 || 
          Math.abs(previousSizeRef.current.height - height) > 5
        ) {
          previousSizeRef.current = { width, height };
          // Forcer la réinitialisation complète de la grille
          setGridKey(prev => prev + 1);
        }
      }
    });

    // Observer le conteneur parent
    const galleryContainer = document.querySelector('.gallery-container') || document.body;
    resizeObserver.observe(galleryContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Détecter les changements de données qui nécessitent une réinitialisation
  useEffect(() => {
    // Si les médias ou le nombre de colonnes change, réinitialiser la grille
    if (
      prevMediaIdsRef.current.length !== mediaIds.length ||
      columnsCount !== prevMediaIdsRef.current.length / Math.ceil(prevMediaIdsRef.current.length / columnsCount)
    ) {
      prevMediaIdsRef.current = mediaIds;
      setGridKey(prev => prev + 1);
      
      if (gridRef.current) {
        gridRef.current.scrollTo({ scrollTop: 0, scrollLeft: 0 });
      }
    }
  }, [mediaIds, columnsCount]);
  
  // Force re-render of only the cells that changed selection state
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Trouver les IDs qui ont changé de statut de sélection
    const prevSelectedSet = new Set(prevSelectedIdsRef.current);
    const currentSelectedSet = new Set(selectedIds);
    
    const changedIds = mediaIds.filter(id => 
      (prevSelectedSet.has(id) && !currentSelectedSet.has(id)) || 
      (!prevSelectedSet.has(id) && currentSelectedSet.has(id))
    );
    
    // Mettre à jour la référence pour la prochaine comparaison
    prevSelectedIdsRef.current = selectedIds;
    
    // Si des sélections ont changé, forcer la mise à jour de la grille
    if (changedIds.length > 0) {
      // Utiliser forceUpdate au lieu de resetAfterIndices
      if (gridRef.current) {
        gridRef.current.forceUpdate();
      }
    }
  }, [selectedIds, mediaIds]);
  
  // Calculate rows needed
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
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
    gap: 8
  }), [mediaIds, selectedIds, handleSelectItem, showDates, updateMediaInfo, position, columnsCount]);
  
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
    
    // N'ajustez que la largeur et la hauteur, pas les positions
    const adjustedStyle = {
      ...style,
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
    <div className="w-full h-full p-2 gallery-container">
      <AutoSizer key={`gallery-grid-${gridKey}`}>
        {({ height, width }) => {
          // Calculate item size based on available width
          const gap = 8;
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
              // Augmenter les overscan pour améliorer les performances de défilement
              overscanRowCount={5}
              overscanColumnCount={2}
              // Utiliser une clé stable pour améliorer l'efficacité du rendu
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
