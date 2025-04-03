
import { useRef, useState, useCallback, useEffect } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useMediaDates } from '@/hooks/use-media-dates';
import { MediaListResponse } from '@/types/gallery';

interface UseSyncGalleriesOptions {
  leftGridRef: React.RefObject<FixedSizeGrid>;
  rightGridRef: React.RefObject<FixedSizeGrid>;
  leftMediaResponse?: MediaListResponse;
  rightMediaResponse?: MediaListResponse;
  columnsCountLeft: number;
  columnsCountRight: number;
}

/**
 * Hook pour synchroniser le défilement entre deux galeries par mois
 */
export function useGallerySync({
  leftGridRef,
  rightGridRef,
  leftMediaResponse,
  rightMediaResponse,
  columnsCountLeft,
  columnsCountRight
}: UseSyncGalleriesOptions) {
  // État pour activer/désactiver la synchronisation
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  // Référence pour éviter les boucles infinies de synchronisation
  const isSyncing = useRef(false);
  // Source actuelle de la synchronisation (quelle galerie initie le défilement)
  const syncSource = useRef<'left' | 'right' | null>(null);
  
  // Utiliser useMediaDates pour accéder aux structures de données des mois
  const leftDates = useMediaDates(leftMediaResponse);
  const rightDates = useMediaDates(rightMediaResponse);
  
  // Mémoriser les positions de défilement pour chaque grille
  const leftScrollPosition = useRef(0);
  const rightScrollPosition = useRef(0);
  
  // Fonction pour déterminer dans quel mois se trouve la position actuelle
  const getCurrentMonth = useCallback((scrollTop: number, side: 'left' | 'right') => {
    const dates = side === 'left' ? leftDates : rightDates;
    const columnsCount = side === 'left' ? columnsCountLeft : columnsCountRight;
    const enrichedItems = dates.enrichedGalleryItems;
    
    if (!enrichedItems || !enrichedItems.length) {
      return null;
    }
    
    // Calculer la rangée approximative basée sur la position de défilement
    // Nous prenons la première image comme référence pour la hauteur d'une rangée
    // Cette approche est une approximation car la hauteur peut varier avec les séparateurs
    const firstItem = enrichedItems.find(item => item.type === 'media');
    if (!firstItem) {
      return null;
    }
    
    // Trouver tous les séparateurs (débuts de mois)
    const separators = enrichedItems
      .filter(item => item.type === 'separator')
      .sort((a, b) => a.index - b.index);
    
    if (!separators.length) {
      return null;
    }
    
    // Pour chaque séparateur, calculer sa position approximative en pixels
    const gridRef = side === 'left' ? leftGridRef : rightGridRef;
    if (!gridRef.current) {
      return null;
    }
    
    // Hauteur d'une rangée basée sur les props du grid
    const rowHeight = gridRef.current.props.rowHeight as number;
    
    // Trouver le séparateur actuel (mois) basé sur la position de défilement
    let currentSeparator = separators[0];
    let nextSeparator = separators.length > 1 ? separators[1] : null;
    
    for (let i = 0; i < separators.length - 1; i++) {
      const sep = separators[i];
      const nextSep = separators[i + 1];
      
      const sepRow = Math.floor(sep.index / columnsCount);
      const sepPosition = sepRow * rowHeight;
      const nextSepRow = Math.floor(nextSep.index / columnsCount);
      const nextSepPosition = nextSepRow * rowHeight;
      
      if (scrollTop >= sepPosition && scrollTop < nextSepPosition) {
        currentSeparator = sep;
        nextSeparator = nextSep;
        break;
      }
      
      // Si nous sommes après le dernier séparateur
      if (i === separators.length - 2 && scrollTop >= nextSepPosition) {
        currentSeparator = nextSep;
        nextSeparator = null;
      }
    }
    
    return {
      separator: currentSeparator,
      nextSeparator,
      yearMonth: currentSeparator.yearMonth,
      label: currentSeparator.label
    };
  }, [leftDates, rightDates, columnsCountLeft, columnsCountRight, leftGridRef, rightGridRef]);
  
  // Calculer la progression dans le mois courant (0 à 1)
  const getProgressInMonth = useCallback((scrollTop: number, side: 'left' | 'right') => {
    const currentMonth = getCurrentMonth(scrollTop, side);
    if (!currentMonth || !currentMonth.nextSeparator) {
      return 0;
    }
    
    const gridRef = side === 'left' ? leftGridRef : rightGridRef;
    const columnsCount = side === 'left' ? columnsCountLeft : columnsCountRight;
    
    if (!gridRef.current) {
      return 0;
    }
    
    const rowHeight = gridRef.current.props.rowHeight as number;
    
    const currentSepRow = Math.floor(currentMonth.separator.index / columnsCount);
    const currentSepPosition = currentSepRow * rowHeight;
    
    const nextSepRow = Math.floor(currentMonth.nextSeparator.index / columnsCount);
    const nextSepPosition = nextSepRow * rowHeight;
    
    const monthHeight = nextSepPosition - currentSepPosition;
    if (monthHeight <= 0) {
      return 0;
    }
    
    // Calculer le pourcentage de progression dans ce mois
    const relativePosition = scrollTop - currentSepPosition;
    return Math.max(0, Math.min(1, relativePosition / monthHeight));
  }, [getCurrentMonth, leftGridRef, rightGridRef, columnsCountLeft, columnsCountRight]);
  
  // Synchroniser la position de la galerie cible en fonction de la source
  const synchronizeGrids = useCallback((sourceScrollTop: number, sourcePosition: 'left' | 'right') => {
    if (!isSyncEnabled || isSyncing.current) {
      return;
    }
    
    // Définir la source et la cible
    const targetPosition = sourcePosition === 'left' ? 'right' : 'left';
    const sourceGridRef = sourcePosition === 'left' ? leftGridRef : rightGridRef;
    const targetGridRef = sourcePosition === 'left' ? rightGridRef : leftGridRef;
    
    // Vérifier que les deux grids sont disponibles
    if (!sourceGridRef.current || !targetGridRef.current) {
      return;
    }
    
    // Déterminer le mois courant dans la source
    const currentMonth = getCurrentMonth(sourceScrollTop, sourcePosition);
    if (!currentMonth) {
      return;
    }
    
    // Calculer la progression dans ce mois
    const progressInMonth = getProgressInMonth(sourceScrollTop, sourcePosition);
    
    // Trouver le même mois dans la galerie cible
    const targetSeparators = (targetPosition === 'left' ? leftDates : rightDates).enrichedGalleryItems
      .filter(item => item.type === 'separator');
    
    const targetMonthSeparator = targetSeparators.find(
      sep => sep.type === 'separator' && sep.yearMonth === currentMonth.yearMonth
    );
    
    // Si le mois n'existe pas dans la cible, on ne fait rien
    if (!targetMonthSeparator) {
      return;
    }
    
    // Trouver le séparateur suivant dans la cible
    const targetSeparatorIndex = targetSeparators.findIndex(
      sep => sep.type === 'separator' && sep.yearMonth === currentMonth.yearMonth
    );
    
    const nextTargetSeparator = targetSeparatorIndex < targetSeparators.length - 1 
      ? targetSeparators[targetSeparatorIndex + 1] 
      : null;
    
    // Si pas de séparateur suivant, on ne peut pas calculer la hauteur du mois
    if (!nextTargetSeparator) {
      return;
    }
    
    const columnsCount = targetPosition === 'left' ? columnsCountLeft : columnsCountRight;
    const rowHeight = targetGridRef.current.props.rowHeight as number;
    
    // Calculer les positions en pixels pour les séparateurs cibles
    const targetSepRow = Math.floor(targetMonthSeparator.index / columnsCount);
    const targetSepPosition = targetSepRow * rowHeight;
    
    const nextTargetSepRow = Math.floor(nextTargetSeparator.index / columnsCount);
    const nextTargetSepPosition = nextTargetSepRow * rowHeight;
    
    const targetMonthHeight = nextTargetSepPosition - targetSepPosition;
    
    // Calculer la position cible en fonction de la progression dans le mois source
    const targetScrollTop = targetSepPosition + (progressInMonth * targetMonthHeight);
    
    // Éviter les boucles infinies
    isSyncing.current = true;
    syncSource.current = sourcePosition;
    
    // Appliquer le défilement à la grille cible
    targetGridRef.current.scrollTo({ scrollTop: Math.floor(targetScrollTop) });
    
    // Réactiver la synchronisation après un délai
    setTimeout(() => {
      isSyncing.current = false;
      syncSource.current = null;
    }, 50);
    
  }, [isSyncEnabled, leftGridRef, rightGridRef, getCurrentMonth, getProgressInMonth, 
      leftDates, rightDates, columnsCountLeft, columnsCountRight]);
  
  // Gestionnaire de défilement pour la grille gauche
  const handleLeftScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    leftScrollPosition.current = scrollTop;
    
    if (isSyncEnabled && !isSyncing.current && syncSource.current !== 'right') {
      synchronizeGrids(scrollTop, 'left');
    }
  }, [isSyncEnabled, synchronizeGrids]);
  
  // Gestionnaire de défilement pour la grille droite
  const handleRightScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    rightScrollPosition.current = scrollTop;
    
    if (isSyncEnabled && !isSyncing.current && syncSource.current !== 'left') {
      synchronizeGrids(scrollTop, 'right');
    }
  }, [isSyncEnabled, synchronizeGrids]);
  
  // Toggle pour activer/désactiver la synchronisation
  const toggleSync = useCallback(() => {
    setIsSyncEnabled(prev => !prev);
  }, []);
  
  return {
    isSyncEnabled,
    toggleSync,
    handleLeftScroll,
    handleRightScroll
  };
}
