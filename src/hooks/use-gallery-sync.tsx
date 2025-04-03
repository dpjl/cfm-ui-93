
import { useCallback, useRef, useState } from 'react';
import { FixedSizeGrid } from 'react-window';
import { MediaListResponse } from '@/types/gallery';
import { useMediaDates } from './use-media-dates';

interface UseGallerySyncProps {
  leftGridRef: React.RefObject<FixedSizeGrid>;
  rightGridRef: React.RefObject<FixedSizeGrid>;
  leftMediaResponse?: MediaListResponse;
  rightMediaResponse?: MediaListResponse;
  columnsCountLeft: number;
  columnsCountRight: number;
}

export function useGallerySync({
  leftGridRef,
  rightGridRef,
  leftMediaResponse,
  rightMediaResponse,
  columnsCountLeft,
  columnsCountRight
}: UseGallerySyncProps) {
  // État pour activer/désactiver la synchronisation
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(false);
  
  // Flag pour éviter les boucles infinies de synchronisation
  const isSyncing = useRef<boolean>(false);
  
  // Référence pour stocker les informations de la date actuelle
  const currentMonthRef = useRef<{ year: number; month: number } | null>(null);
  
  // Utiliser les hooks de dates pour les deux galeries
  const leftDates = useMediaDates(leftMediaResponse);
  const rightDates = useMediaDates(rightMediaResponse);
  
  // Fonction pour déterminer le mois actuel à partir d'une position de défilement
  const determineCurrentMonth = useCallback((
    scrollTop: number, 
    dateIndex: ReturnType<typeof useMediaDates>['dateIndex'],
    itemHeight: number,
    columnsCount: number
  ) => {
    // Parcourir les mois dans l'index de dates
    for (const year of dateIndex.years) {
      const months = dateIndex.monthsByYear[year];
      
      for (const month of months) {
        const monthKey = `${year}-${month}`;
        const separatorInfo = dateIndex.separatorsByYearMonth[monthKey];
        
        if (separatorInfo) {
          const rowIndex = Math.floor(separatorInfo.index / columnsCount);
          const startPos = rowIndex * itemHeight;
          const endPos = startPos + (separatorInfo.itemCount / columnsCount) * itemHeight;
          
          // Si la position de défilement est dans ce mois
          if (scrollTop >= startPos && scrollTop <= endPos) {
            return { 
              year, 
              month, 
              startPos, 
              endPos,
              progress: (scrollTop - startPos) / (endPos - startPos)
            };
          }
        }
      }
    }
    
    return null;
  }, []);
  
  // Fonction pour obtenir la hauteur d'un élément en pixels
  const getItemHeight = useCallback((grid: React.RefObject<FixedSizeGrid>) => {
    if (!grid.current) return 0;
    return grid.current.props.rowHeight as number;
  }, []);
  
  // Fonction pour synchroniser les grilles
  const syncGrids = useCallback((
    sourceGrid: React.RefObject<FixedSizeGrid>,
    targetGrid: React.RefObject<FixedSizeGrid>,
    sourceScrollTop: number,
    sourceDates: ReturnType<typeof useMediaDates>,
    targetDates: ReturnType<typeof useMediaDates>,
    sourceColumnsCount: number,
    targetColumnsCount: number
  ) => {
    if (!isSyncEnabled || isSyncing.current || !sourceGrid.current || !targetGrid.current) {
      return;
    }
    
    // Obtenir les hauteurs des éléments
    const sourceItemHeight = getItemHeight(sourceGrid);
    const targetItemHeight = getItemHeight(targetGrid);
    
    if (sourceItemHeight <= 0 || targetItemHeight <= 0) return;
    
    // Déterminer le mois courant dans la source
    const currentMonthInfo = determineCurrentMonth(
      sourceScrollTop, 
      sourceDates.dateIndex, 
      sourceItemHeight,
      sourceColumnsCount
    );
    
    // Si aucun mois n'est trouvé, ne pas synchroniser
    if (!currentMonthInfo) return;
    
    const { year, month, progress } = currentMonthInfo;
    
    // Stocker le mois courant pour référence
    currentMonthRef.current = { year, month };
    
    // Trouver le mois correspondant dans la cible
    const monthKey = `${year}-${month}`;
    const targetSeparatorInfo = targetDates.dateIndex.separatorsByYearMonth[monthKey];
    
    // Si le mois cible existe, calculer la position et synchroniser
    if (targetSeparatorInfo) {
      isSyncing.current = true;
      
      const targetRowIndex = Math.floor(targetSeparatorInfo.index / targetColumnsCount);
      const targetStartPos = targetRowIndex * targetItemHeight;
      const targetEndPos = targetStartPos + (targetSeparatorInfo.itemCount / targetColumnsCount) * targetItemHeight;
      
      // Calculer la position relative dans le mois cible
      const targetScrollTop = targetStartPos + (targetEndPos - targetStartPos) * progress;
      
      // Définir la position de défilement de la grille cible
      targetGrid.current.scrollTo({ scrollTop: targetScrollTop });
      
      // Réinitialiser le flag après un court délai
      setTimeout(() => {
        isSyncing.current = false;
      }, 100);
    }
  }, [isSyncEnabled, getItemHeight, determineCurrentMonth]);
  
  // Gestionnaire de défilement pour la galerie gauche
  const handleLeftScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    if (!isSyncEnabled || isSyncing.current) return;
    
    syncGrids(
      leftGridRef, 
      rightGridRef, 
      scrollTop, 
      leftDates, 
      rightDates,
      columnsCountLeft,
      columnsCountRight
    );
  }, [isSyncEnabled, syncGrids, leftGridRef, rightGridRef, leftDates, rightDates, columnsCountLeft, columnsCountRight]);
  
  // Gestionnaire de défilement pour la galerie droite
  const handleRightScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    if (!isSyncEnabled || isSyncing.current) return;
    
    syncGrids(
      rightGridRef, 
      leftGridRef, 
      scrollTop, 
      rightDates, 
      leftDates,
      columnsCountRight,
      columnsCountLeft
    );
  }, [isSyncEnabled, syncGrids, rightGridRef, leftGridRef, rightDates, leftDates, columnsCountRight, columnsCountLeft]);
  
  // Fonction pour activer/désactiver la synchronisation
  const toggleSync = useCallback(() => {
    setIsSyncEnabled(prev => !prev);
  }, []);
  
  return {
    isSyncEnabled,
    toggleSync,
    handleLeftScroll,
    handleRightScroll,
    currentMonth: currentMonthRef.current
  };
}
