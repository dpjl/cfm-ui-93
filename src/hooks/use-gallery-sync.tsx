
import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { MediaListResponse } from '@/types/gallery';
import { useMediaDates } from './use-media-dates';
import { throttle } from 'lodash';

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
  const lastSyncTime = useRef<number>(0);
  
  // Référence pour stocker les informations de la date actuelle
  const currentMonthRef = useRef<{ year: number; month: number } | null>(null);
  
  // Utiliser les hooks de dates pour les deux galeries
  const leftDates = useMediaDates(leftMediaResponse);
  const rightDates = useMediaDates(rightMediaResponse);
  
  // Mémoriser les structures d'index pour une meilleure performance
  const leftSeparatorsByYearMonth = useMemo(() => 
    leftDates?.dateIndex?.separatorsByYearMonth || {}, 
    [leftDates?.dateIndex?.separatorsByYearMonth]
  );
  
  const rightSeparatorsByYearMonth = useMemo(() => 
    rightDates?.dateIndex?.separatorsByYearMonth || {}, 
    [rightDates?.dateIndex?.separatorsByYearMonth]
  );
  
  // Obtenir la hauteur d'un élément en pixels
  const getItemHeight = useCallback((grid: React.RefObject<FixedSizeGrid>) => {
    if (!grid.current) return 0;
    return grid.current.props.rowHeight as number;
  }, []);
  
  // Fonction pour déterminer le mois/année à partir d'une position de défilement
  const findYearMonthFromScrollPosition = useCallback((
    scrollTop: number,
    separatorsByYearMonth: Record<string, { index: number; itemCount: number }>,
    columnsCount: number,
    itemHeight: number
  ) => {
    if (!separatorsByYearMonth || Object.keys(separatorsByYearMonth).length === 0) {
      return null;
    }
    
    // Trier les mois par ordre chronologique inverse (le même ordre que dans la grille)
    const yearMonths = Object.keys(separatorsByYearMonth).sort((a, b) => b.localeCompare(a));
    
    // Convertir la position de défilement en indice de ligne approximatif
    const approximateRow = Math.floor(scrollTop / itemHeight);
    
    let bestMatch = { yearMonth: yearMonths[0], distance: Infinity, progress: 0 };
    
    for (const yearMonth of yearMonths) {
      const separatorInfo = separatorsByYearMonth[yearMonth];
      if (!separatorInfo) continue;
      
      const { index, itemCount } = separatorInfo;
      
      // Calculer la position en lignes du séparateur
      const separatorRow = Math.floor(index / columnsCount);
      
      // Calculer la position de fin approximative du mois
      const approximateEndRow = separatorRow + Math.ceil(itemCount / columnsCount);
      
      // Si nous sommes à l'intérieur de cette section de mois
      if (approximateRow >= separatorRow && approximateRow <= approximateEndRow) {
        const progress = (approximateRow - separatorRow) / (approximateEndRow - separatorRow);
        
        return {
          yearMonth,
          progress: Math.min(Math.max(0, progress), 1)
        };
      }
      
      // Sinon, calculer la distance pour trouver le plus proche
      const distance = Math.abs(separatorRow - approximateRow);
      if (distance < bestMatch.distance) {
        const progress = approximateRow > separatorRow ? 
          Math.min(1, (approximateRow - separatorRow) / Math.max(1, (approximateEndRow - separatorRow))) : 0;
        
        bestMatch = { yearMonth, distance, progress };
      }
    }
    
    return {
      yearMonth: bestMatch.yearMonth,
      progress: bestMatch.progress
    };
  }, []);
  
  // Fonction optimisée pour synchroniser les défilements
  const syncScrollPosition = useCallback((
    sourceGrid: React.RefObject<FixedSizeGrid>,
    targetGrid: React.RefObject<FixedSizeGrid>,
    sourceScrollTop: number,
    sourceColumns: number,
    targetColumns: number,
    sourceSeparators: Record<string, { index: number; itemCount: number }>,
    targetSeparators: Record<string, { index: number; itemCount: number }>
  ) => {
    if (!isSyncEnabled || isSyncing.current || !sourceGrid.current || !targetGrid.current) {
      return;
    }
    
    // Éviter les synchronisations trop fréquentes
    const now = Date.now();
    if (now - lastSyncTime.current < 50) {
      return;
    }
    lastSyncTime.current = now;
    
    // Obtenir les hauteurs des éléments
    const sourceItemHeight = getItemHeight(sourceGrid);
    const targetItemHeight = getItemHeight(targetGrid);
    
    if (sourceItemHeight <= 0 || targetItemHeight <= 0) return;
    
    // Déterminer le mois courant dans la source
    const sourceMonthInfo = findYearMonthFromScrollPosition(
      sourceScrollTop,
      sourceSeparators,
      sourceColumns,
      sourceItemHeight
    );
    
    // Si aucun mois n'est trouvé, ne pas synchroniser
    if (!sourceMonthInfo) return;
    
    const { yearMonth, progress } = sourceMonthInfo;
    
    // Trouve les informations du séparateur cible
    const targetSeparatorInfo = targetSeparators[yearMonth];
    
    // Si le mois cible existe, calculer la position et synchroniser
    if (targetSeparatorInfo) {
      isSyncing.current = true;
      
      try {
        const { index, itemCount } = targetSeparatorInfo;
        
        // Calculer la position de début du mois cible
        const targetSeparatorRow = Math.floor(index / targetColumns);
        const targetStartPos = targetSeparatorRow * targetItemHeight;
        
        // Calculer la hauteur totale approximative du mois cible
        const targetMonthRowsCount = Math.ceil(itemCount / targetColumns);
        const targetMonthHeight = targetMonthRowsCount * targetItemHeight;
        
        // Calculer la position finale avec progression
        const targetScrollTop = targetStartPos + (targetMonthHeight * progress);
        
        // Définir la position de défilement de la grille cible
        targetGrid.current.scrollTo({ scrollTop: targetScrollTop });
      } catch (error) {
        console.error('Error during gallery sync:', error);
      } finally {
        // Réinitialiser le flag après un court délai
        setTimeout(() => {
          isSyncing.current = false;
        }, 100);
      }
    }
  }, [isSyncEnabled, getItemHeight, findYearMonthFromScrollPosition]);
  
  // Throttle les fonctions de défilement pour une meilleure performance
  const handleLeftScroll = useMemo(() => 
    throttle(({ scrollTop }: { scrollTop: number }) => {
      if (!isSyncEnabled || isSyncing.current) return;
      
      syncScrollPosition(
        leftGridRef,
        rightGridRef,
        scrollTop,
        columnsCountLeft,
        columnsCountRight,
        leftSeparatorsByYearMonth,
        rightSeparatorsByYearMonth
      );
    }, 16), // ~60fps
    [isSyncEnabled, syncScrollPosition, leftGridRef, rightGridRef, columnsCountLeft, columnsCountRight, leftSeparatorsByYearMonth, rightSeparatorsByYearMonth]
  );
  
  const handleRightScroll = useMemo(() => 
    throttle(({ scrollTop }: { scrollTop: number }) => {
      if (!isSyncEnabled || isSyncing.current) return;
      
      syncScrollPosition(
        rightGridRef,
        leftGridRef,
        scrollTop,
        columnsCountRight,
        columnsCountLeft,
        rightSeparatorsByYearMonth,
        leftSeparatorsByYearMonth
      );
    }, 16), // ~60fps
    [isSyncEnabled, syncScrollPosition, rightGridRef, leftGridRef, columnsCountRight, columnsCountLeft, rightSeparatorsByYearMonth, leftSeparatorsByYearMonth]
  );
  
  // Fonction pour activer/désactiver la synchronisation
  const toggleSync = useCallback(() => {
    setIsSyncEnabled(prev => !prev);
  }, []);
  
  // Réinitialiser l'état de synchronisation quand les données changent
  useEffect(() => {
    isSyncing.current = false;
    lastSyncTime.current = 0;
  }, [leftMediaResponse, rightMediaResponse]);
  
  return {
    isSyncEnabled,
    toggleSync,
    handleLeftScroll,
    handleRightScroll,
    currentMonth: currentMonthRef.current
  };
}
