
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
  const scrollPositionRef = useRef(0);
  
  // Sauvegarder la position de défilement actuelle
  const saveScrollPosition = useCallback(() => {
    if (gridRef.current) {
      scrollPositionRef.current = gridRef.current.state.scrollTop;
    }
  }, []);
  
  // Restaurer la position de défilement
  const restoreScrollPosition = useCallback(() => {
    if (gridRef.current && scrollPositionRef.current > 0) {
      gridRef.current.scrollTo({ scrollTop: scrollPositionRef.current });
    }
  }, []);
  
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
          // Sauvegarder d'abord la position
          saveScrollPosition();
          
          previousSizeRef.current = { width, height };
          
          // Forcer la réinitialisation complète de la grille
          setGridKey(prev => prev + 1);
          
          // Restaurer la position après que la grille soit mise à jour
          setTimeout(restoreScrollPosition, 50);
        }
      }
    });

    // Observer le conteneur parent
    const galleryContainer = document.querySelector('.gallery-container') || document.body;
    resizeObserver.observe(galleryContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [saveScrollPosition, restoreScrollPosition]);
  
  // Détecter les changements de données qui nécessitent une réinitialisation
  useEffect(() => {
    // Si le nombre de médias change significativement, réinitialiser la grille
    if (Math.abs(prevMediaIdsRef.current.length - mediaIds.length) > 5) {
      // Sauvegarder la position avant de réinitialiser
      saveScrollPosition();
      
      prevMediaIdsRef.current = mediaIds;
      setGridKey(prev => prev + 1);
      
      // Si c'est un nouvel ensemble d'IDs complètement différent, revenir en haut
      const intersection = mediaIds.filter(id => prevMediaIdsRef.current.includes(id));
      if (intersection.length < Math.min(mediaIds.length, prevMediaIdsRef.current.length) * 0.5) {
        scrollPositionRef.current = 0;
      }
      
      // Restaurer la position ou revenir en haut
      setTimeout(restoreScrollPosition, 50);
    } else {
      // Juste mettre à jour la référence, pas besoin de reset complet
      prevMediaIdsRef.current = mediaIds;
    }
  }, [mediaIds, saveScrollPosition, restoreScrollPosition]);
  
  // Mettre à jour uniquement les cellules qui ont changé de statut de sélection
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
    prevSelectedIdsRef.current = [...selectedIds];
    
    // Si des sélections ont changé, forcer la mise à jour de la grille
    // MAIS NE PAS réinitialiser la position de défilement
    if (changedIds.length > 0) {
      // Utiliser forceUpdate au lieu de resetAfterIndices
      if (gridRef.current) {
        gridRef.current.forceUpdate();
      }
    }
  }, [selectedIds, mediaIds]);
  
  // Calculer le nombre de lignes nécessaires
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
  // Version mémorisée de onSelectId pour éviter les rendus inutiles
  const handleSelectItem = useCallback((id: string, extendSelection: boolean) => {
    onSelectId(id, extendSelection);
  }, [onSelectId]);
  
  // Mémoriser ItemData pour éviter les rendus inutiles
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
  
  // Mémoriser le composant Cell pour éviter les re-rendus inutiles
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
    
    // N'ajuster que la largeur et la hauteur, pas les positions
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
          // Calculer la taille des éléments en fonction de la largeur disponible
          const gap = 8;
          const itemWidth = Math.floor((width - (gap * (columnsCount - 1))) / columnsCount);
          const itemHeight = itemWidth + (showDates ? 40 : 0); // Ajouter de l'espace pour l'affichage de la date si nécessaire
          
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
              // Sauvegarder la position de défilement lors des événements de défilement
              onScroll={({ scrollTop }) => {
                scrollPositionRef.current = scrollTop;
              }}
              // Maintenir la position de défilement après les rendus
              initialScrollTop={scrollPositionRef.current}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

// Définir un nom d'affichage pour le débogage
VirtualizedGalleryGrid.displayName = 'VirtualizedGalleryGrid';

export default VirtualizedGalleryGrid;
