
import React, { useMemo } from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DetailedMediaInfo } from '@/api/imageApi';
import { useGallery } from '@/contexts/GalleryContext';
import { useUnifiedGrid } from '@/hooks/use-unified-grid';

interface UnifiedVirtualizedGridProps {
  position?: 'source' | 'destination';
}

interface GridCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    mediaIds: string[];
    selectedIds: string[];
    onSelectId: (id: string, extendSelection: boolean) => void;
    showDates?: boolean;
    updateMediaInfo?: (id: string, info: DetailedMediaInfo | null) => void;
    position: 'source' | 'destination';
    calculateCellStyle: (style: React.CSSProperties) => React.CSSProperties;
    renderItem: (id: string, index: number) => React.ReactNode;
  };
}

// Cellule de la grille
const GridCell = React.memo(({ columnIndex, rowIndex, style, data }: GridCellProps) => {
  // Calculer l'index dans le tableau plat basé sur la ligne et la colonne
  const index = rowIndex * data.mediaIds.length + columnIndex;
  
  // Retourner null pour les indices hors limites pour éviter les erreurs
  if (index >= data.mediaIds.length) return null;
  
  // Obtenir l'ID du média et vérifier s'il est sélectionné
  const id = data.mediaIds[index];
  
  // Calculer le style de la cellule avec des ajustements d'espacement appropriés
  const adjustedStyle = data.calculateCellStyle(style);
  
  // Utiliser la fonction de rendu fournie par le parent
  return (
    <div style={adjustedStyle}>
      {data.renderItem(id, index)}
    </div>
  );
});

GridCell.displayName = 'GridCell';

// Grille virtualisée principale
const UnifiedVirtualizedGrid: React.FC<UnifiedVirtualizedGridProps> = ({ 
  position = 'source'
}) => {
  // Utiliser le contexte de la galerie
  const { 
    mediaIds, 
    selectedIds, 
    selectItem,
    updateMediaInfo,
    columnsCount,
    showDates
  } = useGallery();
  
  // Calculer le nombre de lignes en fonction des éléments et des colonnes
  const rowCount = Math.ceil(mediaIds.length / columnsCount);
  
  // Memoize les données de l'élément pour éviter les rendus inutiles
  const itemData = useMemo(() => {
    return {
      mediaIds,
      selectedIds,
      onSelectId: selectItem,
      showDates,
      updateMediaInfo,
      position,
      // Fournir une fonction de style de cellule
      calculateCellStyle: (originalStyle: React.CSSProperties) => {
        return {
          ...originalStyle,
          width: `${parseFloat(originalStyle.width as string) - 8}px`,
          height: `${parseFloat(originalStyle.height as string) - 8}px`,
        };
      },
      // Fonction de rendu pour chaque élément
      renderItem: (id: string, index: number) => (
        <div 
          key={id}
          className={`aspect-square ${selectedIds.includes(id) ? 'bg-primary/20' : 'bg-secondary/20'} rounded-md`}
          onClick={() => selectItem(id, false)}
        >
          {/* Ici, vous pourriez rendre le composant LazyMediaItem */}
          {id.substring(0, 6)}
        </div>
      )
    };
  }, [mediaIds, selectedIds, selectItem, showDates, updateMediaInfo, position]);
  
  // Utiliser un hook unif pour la gestion de la grille
  const { getGridConfig, calculateCellStyle } = useUnifiedGrid(undefined, columnsCount, 8, showDates);
  
  return (
    <div className="w-full h-full">
      <AutoSizer>
        {({ height, width }) => {
          // Obtenir la configuration de la grille
          const gridConfig = getGridConfig(mediaIds.length, width, height);
          
          return (
            <FixedSizeGrid
              {...gridConfig}
              itemData={{
                ...itemData,
                calculateCellStyle
              }}
            >
              {GridCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default UnifiedVirtualizedGrid;
