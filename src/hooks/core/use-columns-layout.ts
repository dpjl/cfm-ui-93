
import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { GalleryViewMode, ViewModeType } from '@/types/gallery';
import { useIsMobile } from '@/hooks/use-breakpoint';

// Types standard pour les différents modes d'affichage
const VIEW_MODES = {
  DESKTOP_SPLIT: 'desktop',
  DESKTOP_FULL: 'desktop-single',
  MOBILE_SPLIT: 'mobile-split',
  MOBILE_FULL: 'mobile-single'
} as const;

// Valeurs par défaut pour chaque mode d'affichage
const DEFAULT_COLUMNS = {
  [VIEW_MODES.DESKTOP_SPLIT]: { left: 5, right: 5 },
  [VIEW_MODES.DESKTOP_FULL]: { left: 6, right: 6 },
  [VIEW_MODES.MOBILE_SPLIT]: { left: 2, right: 2 },
  [VIEW_MODES.MOBILE_FULL]: { left: 4, right: 4 }
};

/**
 * Hook combiné pour gérer les colonnes et la mise en page
 */
export function useColumnsLayout() {
  const isMobile = useIsMobile();
  
  // Column counts for different modes, stored in local storage
  const [desktopColumnsLeft, setDesktopColumnsLeft] = useLocalStorage('desktop-split-columns-left', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].left);
  const [desktopColumnsRight, setDesktopColumnsRight] = useLocalStorage('desktop-split-columns-right', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].right);
  const [desktopSingleColumnsLeft, setDesktopSingleColumnsLeft] = useLocalStorage('desktop-single-columns-left', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_FULL].left);
  const [desktopSingleColumnsRight, setDesktopSingleColumnsRight] = useLocalStorage('desktop-single-columns-right', DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_FULL].right);
  const [mobileSplitColumnsLeft, setMobileSplitColumnsLeft] = useLocalStorage('mobile-split-columns-left', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_SPLIT].left);
  const [mobileSplitColumnsRight, setMobileSplitColumnsRight] = useLocalStorage('mobile-split-columns-right', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_SPLIT].right);
  const [mobileSingleColumnsLeft, setMobileSingleColumnsLeft] = useLocalStorage('mobile-single-columns-left', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_FULL].left);
  const [mobileSingleColumnsRight, setMobileSingleColumnsRight] = useLocalStorage('mobile-single-columns-right', DEFAULT_COLUMNS[VIEW_MODES.MOBILE_FULL].right);
  
  // Fonction utilitaire pour obtenir le type de vue en fonction de l'appareil et du mode
  const getViewModeType = useCallback((viewMode: GalleryViewMode): ViewModeType => {
    if (isMobile) {
      return viewMode === 'both' ? 'mobile-split' : 'mobile-single';
    } else {
      return viewMode === 'both' ? 'desktop' : 'desktop-single';
    }
  }, [isMobile]);
  
  // Fonction pour obtenir le nombre de colonnes actuel pour un côté
  const getColumnsForSide = useCallback((side: 'left' | 'right', viewMode: GalleryViewMode): number => {
    const viewModeType = getViewModeType(viewMode);
    
    if (side === 'left') {
      switch (viewModeType) {
        case 'desktop': return desktopColumnsLeft;
        case 'desktop-single': return desktopSingleColumnsLeft;
        case 'mobile-split': return mobileSplitColumnsLeft;
        case 'mobile-single': return mobileSingleColumnsLeft;
        default: return DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].left;
      }
    } else {
      switch (viewModeType) {
        case 'desktop': return desktopColumnsRight;
        case 'desktop-single': return desktopSingleColumnsRight;
        case 'mobile-split': return mobileSplitColumnsRight;
        case 'mobile-single': return mobileSingleColumnsRight;
        default: return DEFAULT_COLUMNS[VIEW_MODES.DESKTOP_SPLIT].right;
      }
    }
  }, [
    desktopColumnsLeft, desktopColumnsRight, 
    desktopSingleColumnsLeft, desktopSingleColumnsRight,
    mobileSplitColumnsLeft, mobileSplitColumnsRight,
    mobileSingleColumnsLeft, mobileSingleColumnsRight,
    getViewModeType
  ]);
  
  // Fonction pour mettre à jour le nombre de colonnes
  const updateColumnsCount = useCallback((side: 'left' | 'right', viewMode: GalleryViewMode, count: number) => {
    const viewModeType = getViewModeType(viewMode);
    
    if (side === 'left') {
      switch (viewModeType) {
        case 'desktop': 
          setDesktopColumnsLeft(count);
          break;
        case 'desktop-single': 
          setDesktopSingleColumnsLeft(count);
          break;
        case 'mobile-split': 
          setMobileSplitColumnsLeft(count);
          break;
        case 'mobile-single': 
          setMobileSingleColumnsLeft(count);
          break;
      }
    } else {
      switch (viewModeType) {
        case 'desktop': 
          setDesktopColumnsRight(count);
          break;
        case 'desktop-single': 
          setDesktopSingleColumnsRight(count);
          break;
        case 'mobile-split': 
          setMobileSplitColumnsRight(count);
          break;
        case 'mobile-single': 
          setMobileSingleColumnsRight(count);
          break;
      }
    }
  }, [
    setDesktopColumnsLeft, setDesktopColumnsRight,
    setDesktopSingleColumnsLeft, setDesktopSingleColumnsRight,
    setMobileSplitColumnsLeft, setMobileSplitColumnsRight,
    setMobileSingleColumnsLeft, setMobileSingleColumnsRight,
    getViewModeType
  ]);
  
  // Classes pour la mise en page
  const getGalleryClasses = useCallback((position: 'left' | 'right', viewMode: GalleryViewMode) => {
    const baseClasses = "transition-all duration-300 h-full overflow-hidden";
    
    // Classes pour la visibilité et la largeur
    if (position === 'left') {
      if (viewMode === 'both') return `${baseClasses} w-1/2`;
      if (viewMode === 'left') return `${baseClasses} w-full`;
      return `${baseClasses} w-0 invisible`;
    } else { // position === 'right'
      if (viewMode === 'both') return `${baseClasses} w-1/2`;
      if (viewMode === 'right') return `${baseClasses} w-full`;
      return `${baseClasses} w-0 invisible`;
    }
  }, []);
  
  // Déterminer si une galerie est visible en fonction du mode d'affichage
  const isGalleryVisible = useCallback((position: 'left' | 'right', viewMode: GalleryViewMode) => {
    if (position === 'left') {
      return viewMode === 'both' || viewMode === 'left';
    } else {
      return viewMode === 'both' || viewMode === 'right';
    }
  }, []);
  
  return {
    // Méthodes pour obtenir et mettre à jour le nombre de colonnes
    getCurrentColumnsLeft: (viewMode: GalleryViewMode) => getColumnsForSide('left', viewMode),
    getCurrentColumnsRight: (viewMode: GalleryViewMode) => getColumnsForSide('right', viewMode),
    updateColumnCount: (side: 'left' | 'right', viewMode: GalleryViewMode, count: number) => 
      updateColumnsCount(side, viewMode, count),
    
    // Méthodes pour la mise en page
    getViewModeType,
    getGalleryClasses,
    isGalleryVisible,
    
    // Constants exportées pour utilisation externe
    VIEW_MODES
  };
}
